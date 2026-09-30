import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

test('visit tracking counts each visitor once and stores nothing identifying', async () => {
  let rpcCalls = 0;
  let rpcError = null;
  mock.module('@supabase/supabase-js', { namedExports: { createClient: (url, key) => {
    assert.equal(key, 'service-test-only');
    return { rpc: async (name) => { assert.equal(name, 'record_site_visit'); rpcCalls++; return { error: rpcError }; } };
  } } });
  const { POST } = await import('../src/app/api/track/route.ts');
  const { siteDay } = await import('../src/lib/siteTime.ts');

  Object.assign(process.env, {
    NODE_ENV: 'production', CHAT_PLATFORM: 'netlify',
    NEXT_PUBLIC_SUPABASE_URL: 'https://db.example.test', SUPABASE_SERVICE_ROLE_KEY: 'service-test-only',
    UPSTASH_REDIS_REST_URL: 'https://redis.example.test', UPSTASH_REDIS_REST_TOKEN: 'test-only',
  });
  const visit = (headers = {}) => POST(new Request('https://portfolio.test/api/track', {
    method: 'POST',
    headers: { origin: 'https://portfolio.test', 'x-nf-client-connection-ip': '192.0.2.10', ...headers },
  }));

  const commands = [];
  let claimed = new Set();
  const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://redis.example.test');
    const command = JSON.parse(options.body);
    commands.push(command);
    if (command[0] === 'DEL') { claimed.delete(command[1]); return Response.json({ result: 1 }); }
    if (claimed.has(command[1])) return Response.json({ result: null });
    claimed.add(command[1]);
    return Response.json({ result: 'OK' });
  });
  try {
    // Other sites (or requests without Origin) cannot count visits.
    assert.equal((await visit({ origin: 'https://evil.example' })).status, 403);
    assert.equal((await POST(new Request('https://portfolio.test/api/track', { method: 'POST' }))).status, 403);
    assert.equal(commands.length, 0);

    const first = await visit();
    assert.equal(first.status, 201);
    assert.equal(first.headers.get('cache-control'), 'no-store');
    assert.equal(rpcCalls, 1);
    const [set] = commands;
    assert.deepEqual([set[0], set[3], set[4], set[5]], ['SET', 'NX', 'EX', '172800']);
    assert.ok(set[1].startsWith('{portfolio-visit}:' + siteDay() + ':'));
    assert.ok(!set[1].includes('192.0.2.10'), 'the IP is never stored in clear');

    // Same visitor on the same day: not counted again.
    assert.equal((await visit()).status, 204);
    assert.equal(rpcCalls, 1);

    // A different visitor is counted.
    assert.equal((await visit({ 'x-nf-client-connection-ip': '192.0.2.11' })).status, 201);
    assert.equal(rpcCalls, 2);

    // If the database fails, the claim is released so the visit can be retried.
    rpcError = { message: 'down' };
    assert.equal((await visit({ 'x-nf-client-connection-ip': '192.0.2.12' })).status, 503);
    assert.equal(commands.at(-1)[0], 'DEL');
    rpcError = null;
    assert.equal((await visit({ 'x-nf-client-connection-ip': '192.0.2.12' })).status, 201);

    // Production never records without the shared Redis.
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const before = rpcCalls;
    assert.equal((await visit({ 'x-nf-client-connection-ip': '192.0.2.13' })).status, 503);
    assert.equal(rpcCalls, before);
  } finally { fetchMock.mock.restore(); mock.restoreAll(); }
});
