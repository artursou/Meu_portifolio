export const hasRedis = () =>
  Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export const isLocalEnv = () =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// Runs one command through the Upstash REST API and returns its `result`.
export async function redisCommand(command: string[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Shared Redis is not configured');
  if (new URL(url).protocol !== 'https:') throw new Error('Redis must use HTTPS');
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(3000),
    cache: 'no-store',
    redirect: 'error',
  });
  if (!response.ok) throw new Error('Shared Redis unavailable');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('result' in data)) throw new Error('Invalid Redis response');
  return data.result;
}
