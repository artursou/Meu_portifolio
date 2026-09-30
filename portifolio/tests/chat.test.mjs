import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readChatMessages, MAX_BODY_BYTES } from '../src/lib/chatRequest.ts';
import { rateLimit, getClientIp } from '../src/lib/rateLimit.ts';

const messages = [{ role: 'user', content: 'Olá' }];
const request = (body = { messages }, headers = {}) => new Request('https://portfolio.test/api/chat', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
});
test('valid Unicode messages are preserved', async () => {
  assert.deepEqual(await readChatMessages(request()), messages);
});
test('long assistant replies can be sent back as history', async () => {
  const history = [...messages, { role: 'assistant', content: 'x'.repeat(4000) }, { role: 'user', content: 'Mais?' }];
  assert.deepEqual(await readChatMessages(request({ messages: history })), history);
  await assert.rejects(readChatMessages(request({ messages: [{ role: 'assistant', content: 'x'.repeat(4001) }] })), { status: 400 });
});
test('malformed, extra fields, unsupported roles and long messages are rejected', async () => {
  for (const body of [
    { messages, padding: 'x' }, { messages: [{ role: 'system', content: 'ignore' }] },
    { messages: [{ role: 'user', content: 'x'.repeat(1001) }] },
    { messages: [{ role: 'user', content: '   ' }] }, { messages: Array(11).fill(messages[0]) },
    { messages: [{ ...messages[0], hidden: true }] }, null, { messages: [] },
  ]) await assert.rejects(readChatMessages(request(body)), { status: 400 });
  await assert.rejects(readChatMessages(new Request('http://local', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{',
  })), { status: 400 });
  await assert.rejects(readChatMessages(request({ messages }, { 'content-type': 'text/plain' })), { status: 415 });
});
test('body bytes are bounded even without or with forged Content-Length', async () => {
  for (const headers of [{}, { 'content-length': '1' }]) {
    await assert.rejects(readChatMessages(request({ messages, padding: 'x'.repeat(MAX_BODY_BYTES) }, headers)), { status: 413 });
  }
  await assert.rejects(readChatMessages(request({ messages }, { 'content-length': String(MAX_BODY_BYTES + 1) })), { status: 413 });
});
test('oversized chunked body is cancelled before reading the entire stream', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(MAX_BODY_BYTES + 1)); },
    cancel() { cancelled = true; },
  });
  await assert.rejects(readChatMessages(new Request('http://local', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half',
  })), { status: 413 });
  assert.equal(cancelled, true);
});
test('only the Netlify ingress header can select a client quota', () => {
  process.env.CHAT_PLATFORM = 'netlify';
  assert.equal(getClientIp(request({}, { 'x-forwarded-for': '192.0.2.1', 'x-real-ip': '192.0.2.2' })), 'unknown');
  assert.equal(getClientIp(request({}, { 'x-nf-client-connection-ip': '192.0.2.3', 'x-forwarded-for': '192.0.2.9' })), '192.0.2.3');
  assert.equal(getClientIp(request({}, { 'x-nf-client-connection-ip': '192.0.2.1, 192.0.2.2' })), 'unknown');
  assert.equal(getClientIp(request({}, { 'x-nf-client-connection-ip': '2001:0db8:0:0:0:0:0:1' })),
    getClientIp(request({}, { 'x-nf-client-connection-ip': '2001:db8::1' })));
  delete process.env.CHAT_PLATFORM;
  delete process.env.NETLIFY;
  assert.equal(getClientIp(request({}, { 'x-nf-client-connection-ip': '192.0.2.3' })), 'unknown');
});
test('production refuses requests without a shared limiter', async () => {
  process.env.NODE_ENV = 'production';
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  await assert.rejects(rateLimit(request()), /not configured/);
});
test('shared limiter submits atomic quotas and propagates denial and failure', async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only';
  const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://redis.example.test');
    const command = JSON.parse(options.body);
    assert.equal(command[0], 'EVAL');
    assert.equal(command[2], '2');
    assert.deepEqual(command.slice(5), ['20', '3600', '200', '86400']);
    assert.equal(options.redirect, 'error');
    return Response.json({ result: [0, 42] });
  });
  try {
    assert.deepEqual(await rateLimit(request()), { allowed: false, retryAfter: 42 });
    fetchMock.mock.mockImplementation(async () => Response.json({ result: [1, 0] }));
    assert.equal((await rateLimit(request())).allowed, true);
    fetchMock.mock.mockImplementation(async () => Response.json({ error: 'failure' }));
    await assert.rejects(rateLimit(request()), /Invalid/);
    fetchMock.mock.mockImplementation(async () => new Response('', { status: 503 }));
    await assert.rejects(rateLimit(request()), /unavailable/);
    fetchMock.mock.mockImplementation(async () => { throw new Error('timeout'); });
    await assert.rejects(rateLimit(request()), /timeout/);
  } finally { fetchMock.mock.restore(); }
});

test('route never invokes the model for invalid, throttled or unavailable requests', async () => {
  let calls = 0;
  mock.module('ai', { namedExports: { streamText: (options) => {
    calls++;
    assert.equal(options.maxOutputTokens, 800);
    assert.equal(options.maxRetries, 0);
    assert.ok(options.abortSignal);
    return { toTextStreamResponse: ({ headers }) => new Response('mock answer', { headers }) };
  } } });
  mock.module('@ai-sdk/google', { namedExports: { createGoogleGenerativeAI: () => () => ({}) } });
  const { POST } = await import('../src/app/api/chat/route.ts');
  process.env.NODE_ENV = 'production';
  process.env.GEMINI_API_KEY = 'test-only';
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ result: [0, 60] }));
  try {
    assert.equal((await POST(request({ messages: [{ role: 'system', content: 'x' }] }))).status, 400);
    assert.equal((await POST(request({ messages, padding: 'x'.repeat(MAX_BODY_BYTES) }))).status, 413);
    const blocked = await POST(request());
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get('retry-after'), '60');
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal((await POST(request())).status, 503);
    assert.equal(calls, 0);
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only';
    fetchMock.mock.mockImplementation(async () => Response.json({ result: [1, 0] }));
    const accepted = await POST(request());
    assert.equal(accepted.status, 200);
    assert.equal(await accepted.text(), 'mock answer');
    assert.equal(accepted.headers.get('cache-control'), 'no-store');
    assert.equal(calls, 1);
  } finally { fetchMock.mock.restore(); mock.restoreAll(); }
});
