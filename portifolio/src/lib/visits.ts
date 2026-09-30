import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getClientIp } from '@/lib/rateLimit';
import { hasRedis, isLocalEnv, redisCommand } from '@/lib/redis';
import { siteDay } from '@/lib/siteTime';

const CLAIM_TTL = 2 * 86400;
const localClaims = new Set<string>();

// Counts each visitor once per site day. Only a keyed hash of the IP is kept,
// in Redis, and it expires on its own; the database stores just the timestamp.
// Returns the claim key, or null when this visitor was already counted today.
export async function claimDailyVisit(req: Request): Promise<string | null> {
  const secret = process.env.UPSTASH_REDIS_REST_TOKEN ?? 'local-only';
  const visitor = createHmac('sha256', secret).update(getClientIp(req)).digest('hex');
  const key = '{portfolio-visit}:' + siteDay() + ':' + visitor;
  if (!hasRedis()) {
    if (!isLocalEnv()) throw new Error('Shared Redis is not configured');
    if (localClaims.has(key)) return null;
    localClaims.add(key);
    return key;
  }
  const result = await redisCommand(['SET', key, '1', 'NX', 'EX', String(CLAIM_TTL)]);
  return result === 'OK' ? key : null;
}

export async function releaseDailyVisit(key: string): Promise<void> {
  if (!hasRedis()) { localClaims.delete(key); return; }
  await redisCommand(['DEL', key]);
}

// The service key bypasses RLS: it must never leave the server or use NEXT_PUBLIC.
// Visitors cannot call record_site_visit themselves; only service_role can.
export async function recordVisit(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Visit storage is not configured');
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000) }) },
  });
  const { error } = await db.rpc('record_site_visit');
  if (error) throw new Error('Visit storage unavailable');
}
