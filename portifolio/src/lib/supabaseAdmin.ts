import { createClient } from '@supabase/supabase-js';

// Server-only client. The service key bypasses RLS: it must never leave the
// server or use NEXT_PUBLIC. The database only lets it call the record_* RPCs
// that matter here; visitors cannot call them.
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server storage is not configured');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000) }) },
  });
}
