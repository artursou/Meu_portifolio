import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('RLS denies anonymous and ordinary user writes even with old permissive policies', async () => {
  const db = new PGlite();
  const admin = '00000000-0000-4000-8000-000000000001';
  const visitor = '00000000-0000-4000-8000-000000000002';
  const tables = ['projects', 'technologies', 'project_technologies'];
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key);
      insert into auth.users values ('${admin}'), ('${visitor}');
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);
    for (const name of tables) {
      await db.exec(`
        create table public.${name} (id integer primary key, title text);
        insert into public.${name} values (1, 'Original');
        grant all on public.${name} to anon, authenticated;
        alter table public.${name} enable row level security;
        create policy old_open_policy on public.${name} for all to anon, authenticated using (true) with check (true);
      `);
    }
    await db.exec(await readFile(new URL('../supabase/migrations/202609300001_admin_permissions.sql', import.meta.url), 'utf8'));
    await db.exec(`insert into portfolio_private.admins values ('${admin}')`);
    await db.exec('set role anon');
    for (const name of tables) {
      assert.equal((await db.query(`select * from public.${name}`)).rows.length, 1);
      await assert.rejects(db.exec(`insert into public.${name} values (2, 'bad')`));
      await assert.rejects(db.exec(`update public.${name} set title = 'bad'`));
      await assert.rejects(db.exec(`delete from public.${name}`));
    }
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${visitor}'`);
    assert.equal((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed, false);
    await assert.rejects(db.exec(`insert into portfolio_private.admins values ('${visitor}')`));
    for (const name of tables) {
      await assert.rejects(db.exec(`insert into public.${name} values (2, 'bad')`));
      assert.equal((await db.query(`update public.${name} set title = 'bad' returning *`)).rows.length, 0);
      assert.equal((await db.query(`delete from public.${name} returning *`)).rows.length, 0);
      await assert.rejects(db.exec(`truncate public.${name}`));
    }
    await db.exec(`set request.jwt.claim.sub = '${admin}'`);
    assert.equal((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed, true);
    for (const name of tables) {
      await db.exec(`insert into public.${name} values (2, 'new')`);
      assert.equal((await db.query(`update public.${name} set title = 'edited' where id = 2 returning *`)).rows.length, 1);
      assert.equal((await db.query(`delete from public.${name} where id = 2 returning *`)).rows.length, 1);
      assert.equal((await db.query(`select title from public.${name} where id = 1`)).rows[0].title, 'Original');
    }
    // Revoking the allowlist takes effect immediately, even with the old JWT.
    await db.exec(`reset role; delete from portfolio_private.admins; set role authenticated`);
    assert.equal((await db.query('select public.is_portfolio_admin() as allowed')).rows[0].allowed, false);
    await assert.rejects(db.exec("insert into projects values (3, 'no longer admin')"));
  } finally { await db.close(); }
});

test('removing legacy policies keeps public read and admin-only writes', async () => {
  const db = new PGlite();
  const admin = '00000000-0000-4000-8000-000000000001';
  const visitor = '00000000-0000-4000-8000-000000000002';
  const legacy = { projects: 'search', technologies: 'Search_tecs2', project_technologies: 'Search_tecs' };
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key);
      insert into auth.users values ('${admin}'), ('${visitor}');
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create function auth.role() returns text language sql stable as
      $$ select case when auth.uid() is null then 'anon' else 'authenticated' end $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on all functions in schema auth to anon, authenticated;
      create function public.update_updated_at_column() returns trigger language plpgsql as
      $$ begin new.updated_at = now(); return new; end $$;
    `);
    for (const [name, readPolicy] of Object.entries(legacy)) {
      await db.exec(`
        create table public.${name} (id integer primary key, title text, updated_at timestamptz);
        insert into public.${name} values (1, 'Original', null);
        create trigger touch before update on public.${name} for each row execute function public.update_updated_at_column();
        grant all on public.${name} to anon, authenticated;
        alter table public.${name} enable row level security;
        create policy "Policy with security definer functions" on public.${name} for all to authenticated using (auth.role() = 'authenticated');
        create policy "${readPolicy}" on public.${name} for select using (true);
      `);
    }
    for (const file of ['202609300001_admin_permissions.sql', '202610010002_cleanup_legacy_policies.sql']) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
    }
    await db.exec(`insert into portfolio_private.admins values ('${admin}')`);

    const remaining = (await db.query(`select policyname from pg_policies where schemaname = 'public'
      and policyname in ('Policy with security definer functions', 'search', 'Search_tecs', 'Search_tecs2')`)).rows;
    assert.equal(remaining.length, 0);

    await db.exec('set role anon');
    for (const name of Object.keys(legacy)) {
      assert.equal((await db.query(`select * from public.${name}`)).rows.length, 1);
      await assert.rejects(db.exec(`insert into public.${name} values (2, 'bad', null)`));
    }
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${visitor}'`);
    for (const name of Object.keys(legacy)) {
      assert.equal((await db.query(`select * from public.${name}`)).rows.length, 1);
      await assert.rejects(db.exec(`insert into public.${name} values (2, 'bad', null)`));
      assert.equal((await db.query(`update public.${name} set title = 'bad' returning *`)).rows.length, 0);
    }
    await db.exec(`set request.jwt.claim.sub = '${admin}'`);
    for (const name of Object.keys(legacy)) {
      const [row] = (await db.query(`update public.${name} set title = 'edited' where id = 1 returning updated_at`)).rows;
      assert.ok(row.updated_at, 'trigger still works with a pinned search_path');
    }
  } finally { await db.close(); }
});
