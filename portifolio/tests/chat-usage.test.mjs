import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

test('chat replies record token usage without the conversation text', async () => {
  const calls = [];
  let outcome = 'finish';
  mock.module('@supabase/supabase-js', { namedExports: { createClient: (url, key) => {
    assert.equal(key, 'service-test-only');
    return { rpc: async (name, params) => { calls.push({ name, params }); return { error: null }; } };
  } } });
  mock.module('ai', { namedExports: { streamText: (options) => ({
    // Like the SDK, the callback is awaited before the stream closes.
    toTextStreamResponse: ({ headers }) => new Response(new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode('resposta secreta do modelo'));
        if (outcome === 'finish') {
          await options.onFinish({
            finishReason: 'stop',
            text: 'resposta secreta do modelo',
            totalUsage: {
              inputTokens: 512, outputTokens: 140, totalTokens: 652,
              outputTokenDetails: { textTokens: 40, reasoningTokens: 100 },
            },
          });
        } else {
          await options.onError({ error: new Error('provider down') });
        }
        controller.close();
      },
    }), { headers }),
  }) } });
  mock.module('@ai-sdk/google', { namedExports: { createGoogleGenerativeAI: () => () => ({}) } });

  Object.assign(process.env, {
    NODE_ENV: 'production', GEMINI_API_KEY: 'test-only',
    NEXT_PUBLIC_SUPABASE_URL: 'https://db.example.test', SUPABASE_SERVICE_ROLE_KEY: 'service-test-only',
    UPSTASH_REDIS_REST_URL: 'https://redis.example.test', UPSTASH_REDIS_REST_TOKEN: 'test-only',
  });
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ result: [1, 0] }));
  const { POST } = await import('../src/app/api/chat/route.ts');
  const ask = () => POST(new Request('https://portfolio.test/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [
      { role: 'user', content: 'pergunta privada do visitante' },
      { role: 'assistant', content: 'ok' },
      { role: 'user', content: 'outra pergunta' },
    ] }),
  }));

  try {
    const response = await ask();
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'resposta secreta do modelo');
    assert.equal(calls.length, 1);
    const [{ name, params }] = calls;
    assert.equal(name, 'record_chat_usage');
    assert.equal(params.p_status, 'ok');
    assert.equal(params.p_finish_reason, 'stop');
    assert.deepEqual(
      [params.p_input_tokens, params.p_output_tokens, params.p_reasoning_tokens, params.p_total_tokens],
      [512, 140, 100, 652],
    );
    assert.equal(params.p_message_count, 3);
    assert.ok(Number.isInteger(params.p_duration_ms) && params.p_duration_ms >= 0);
    const stored = JSON.stringify(params);
    assert.ok(!stored.includes('pergunta') && !stored.includes('secreta'), 'no message text is stored');

    // Provider errors are logged too, without tokens.
    outcome = 'error';
    await (await ask()).text();
    assert.equal(calls.length, 2);
    assert.equal(calls[1].params.p_status, 'error');
    assert.equal(calls[1].params.p_total_tokens, null);

    // Logging failures never break the chat.
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    outcome = 'finish';
    const stillWorks = await ask();
    assert.equal(stillWorks.status, 200);
    assert.equal(await stillWorks.text(), 'resposta secreta do modelo');
  } finally { fetchMock.mock.restore(); mock.restoreAll(); }
});
