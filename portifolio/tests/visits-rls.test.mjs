import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const migration = (name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');

test('only the server records visits and only the administrator reads them', async () => {
  const db = new PGlite();
  const admin = '00000000-0000-4000-8000-000000000001';
  const visitor = '00000000-0000-4000-8000-000000000002';
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      insert into auth.users values ('${admin}'), ('${visitor}');
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated, service_role;
      grant execute on function auth.uid() to anon, authenticated, service_role;
      create table public.projects (id integer primary key);
      create table public.technologies (id integer primary key);
      create table public.project_technologies (id integer primary key);
    `);
    await db.exec(await migration('202609300001_admin_permissions.sql'));
    await db.exec(await migration('202610010001_site_visits.sql'));
    // Supabase grants everything on new tables by default; the migration must undo it.
    await db.exec(`grant all on public.site_visits to anon, authenticated`);
    await db.exec(await migration('202610010001_site_visits.sql'));
    await db.exec(`insert into portfolio_private.admins values ('${admin}')`);

    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.site_visits'));
    await assert.rejects(db.query('select public.record_site_visit()'));
    await assert.rejects(db.query('insert into public.site_visits default values'));
    await assert.rejects(db.query('select * from public.site_visits_daily(30)'));

    await db.exec(`reset role; set role service_role`);
    await db.query('select public.record_site_visit()');
    await db.query('select public.record_site_visit()');

    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${visitor}'`);
    assert.equal((await db.query('select * from public.site_visits')).rows.length, 0);
    await assert.rejects(db.query('select public.record_site_visit()'));
    await assert.rejects(db.query('insert into public.site_visits default values'));
    await assert.rejects(db.query('delete from public.site_visits'));
    const hidden = (await db.query('select * from public.site_visits_daily(30)')).rows;
    assert.equal(hidden.length, 30);
    assert.ok(hidden.every((row) => Number(row.visits) === 0));

    await db.exec(`set request.jwt.claim.sub = '${admin}'`);
    const visits = (await db.query('select visited_at from public.site_visits')).rows;
    assert.equal(visits.length, 2);
    const daily = (await db.query('select * from public.site_visits_daily(30)')).rows;
    assert.equal(daily.length, 30);
    assert.equal(Number(daily.at(-1).visits), 2);
    assert.equal(daily.reduce((sum, row) => sum + Number(row.visits), 0), 2);
    assert.equal((await db.query('select * from public.site_visits_daily(100000)')).rows.length, 366);
    // Even the administrator cannot write or delete visits through the API roles.
    await assert.rejects(db.query('insert into public.site_visits default values'));
    await assert.rejects(db.query('delete from public.site_visits'));
  } finally { await db.close(); }
});
