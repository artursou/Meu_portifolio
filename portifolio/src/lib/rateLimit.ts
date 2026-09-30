import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

type LimitResult = { allowed: boolean; retryAfter: number };
const HOUR = 3600;
const DAY = 86400;

// The Netlify ingress overwrites this header. Never trust generic forwarding
// headers on a directly reachable server. Without a trusted IP, share one quota.
export function getClientIp(req: Request): string {
  if (process.env.CHAT_PLATFORM !== 'netlify' && process.env.NETLIFY !== 'true') return 'unknown';
  const value = req.headers.get('x-nf-client-connection-ip')?.trim();
  if (!value || !isIP(value)) return 'unknown';
  return isIP(value) === 6 ? new URL('http://[' + value + ']').hostname : value;
}

// Both checks and increments run atomically, with Redis-managed expiration.
// A global daily ceiling also bounds usage by clients rotating IP addresses.
export const RATE_LIMIT_SCRIPT = `
for i = 1, 2 do
  local count = tonumber(redis.call('GET', KEYS[i]) or '0')
  if count >= tonumber(ARGV[(i - 1) * 2 + 1]) then
    return {0, math.max(1, redis.call('TTL', KEYS[i]))}
  end
end
for i = 1, 2 do
  local count = redis.call('INCR', KEYS[i])
  if count == 1 then redis.call('EXPIRE', KEYS[i], ARGV[i * 2]) end
end
return {1, 0}
`;

const localHits = new Map<string, { count: number; expires: number }>();
function localLimit(key: string): LimitResult {
  const now = Date.now();
  for (const [k, value] of localHits) if (value.expires <= now) localHits.delete(k);
  const rules = [[key, 20, HOUR], ['global', 200, DAY]] as const;
  for (const [k, limit] of rules) {
    const entry = localHits.get(k);
    if (entry && entry.count >= limit) return { allowed: false, retryAfter: Math.ceil((entry.expires - now) / 1000) };
  }
  for (const [k, , seconds] of rules) {
    const entry = localHits.get(k) ?? { count: 0, expires: now + seconds * 1000 };
    entry.count++;
    localHits.set(k, entry);
  }
  return { allowed: true, retryAfter: 0 };
}

export async function rateLimit(req: Request): Promise<LimitResult> {
  const ip = getClientIp(req);
  const key = createHash('sha256').update(ip).digest('hex');
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') return localLimit(key);
    throw new Error('Shared rate limiter is not configured');
  }
  if (new URL(url).protocol !== 'https:') throw new Error('Redis must use HTTPS');
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', RATE_LIMIT_SCRIPT, '2', '{portfolio-chat}:ip:' + key,
      '{portfolio-chat}:global', '20', String(HOUR), '200', String(DAY)]),
    signal: AbortSignal.timeout(3000),
    cache: 'no-store',
    redirect: 'error',
  });
  if (!response.ok) throw new Error('Shared rate limiter unavailable');
  const data: unknown = await response.json();
  const result = data && typeof data === 'object' && 'result' in data ? data.result : undefined;
  if (!Array.isArray(result) || result.length !== 2 ||
      (result[0] !== 0 && result[0] !== 1) || !Number.isInteger(result[1]) || result[1] < 0) {
    throw new Error('Invalid rate limiter response');
  }
  return { allowed: result[0] === 1, retryAfter: Math.max(1, result[1]) };
}
