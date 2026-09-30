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
