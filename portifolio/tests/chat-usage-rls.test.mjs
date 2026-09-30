import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const migration = (name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
const record = `select public.record_chat_usage('ok', 'stop', 120, 80, 30, 200, 1500, 1)`;

test('only the server records chat usage and only the administrator reads it', async () => {
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
    await db.exec(await migration('202610010003_chat_usage.sql'));
    // Supabase grants everything on new tables by default; re-running must undo it.
    await db.exec(`grant all on public.chat_usage to anon, authenticated`);
    await db.exec(await migration('202610010003_chat_usage.sql'));
    await db.exec(`insert into portfolio_private.admins values ('${admin}')`);

    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.chat_usage'));
    await assert.rejects(db.query(record));
    await assert.rejects(db.query('select * from public.chat_usage_daily(30)'));
    await assert.rejects(db.query('select * from public.chat_usage_totals()'));

    await db.exec(`reset role; set role service_role`);
    await db.query(record);
    await db.query(`select public.record_chat_usage('error')`);
    await assert.rejects(db.query(`select public.record_chat_usage('hacked')`), 'status is constrained');
    await assert.rejects(db.query(`select public.record_chat_usage('ok', null, -5)`), 'tokens cannot be negative');

    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${visitor}'`);
    assert.equal((await db.query('select * from public.chat_usage')).rows.length, 0);
    await assert.rejects(db.query(record));
    await assert.rejects(db.query(`insert into public.chat_usage (status) values ('ok')`));
    assert.equal(Number((await db.query('select * from public.chat_usage_totals()')).rows[0].replies), 0);

    await db.exec(`set request.jwt.claim.sub = '${admin}'`);
    const rows = (await db.query('select status, input_tokens, total_tokens from public.chat_usage order by id')).rows;
    assert.deepEqual(rows.map((r) => r.status), ['ok', 'error']);
    assert.equal(rows[0].total_tokens, 200);
    const daily = (await db.query('select * from public.chat_usage_daily(30)')).rows;
    assert.equal(daily.length, 30);
    assert.equal(Number(daily.at(-1).replies), 2);
    assert.equal(Number(daily.at(-1).total_tokens), 200);
    const [totals] = (await db.query('select * from public.chat_usage_totals()')).rows;
    assert.deepEqual([Number(totals.replies), Number(totals.total_tokens)], [2, 200]);
    // Even the administrator cannot edit or delete the log through the API roles.
    await assert.rejects(db.query('delete from public.chat_usage'));
    await assert.rejects(db.query(`update public.chat_usage set total_tokens = 0`));
  } finally { await db.close(); }
});
