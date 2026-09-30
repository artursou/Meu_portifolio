import { claimDailyVisit, recordVisit, releaseDailyVisit } from '@/lib/visits';

export const runtime = 'nodejs';

const noStore = { 'Cache-Control': 'no-store' };

// Browsers always send Origin on POST; pages on other sites cannot fake it.
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    const hosts = [req.headers.get('host'), req.headers.get('x-forwarded-host'), new URL(req.url).host];
    return hosts.includes(originHost);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: 'forbidden' }, { status: 403, headers: noStore });
  try {
    const claim = await claimDailyVisit(req);
    if (!claim) return new Response(null, { status: 204, headers: noStore });
    try {
      await recordVisit();
    } catch (error) {
      // Let the visitor be counted on a later attempt.
      await releaseDailyVisit(claim).catch(() => {});
      throw error;
    }
    return new Response(null, { status: 201, headers: noStore });
  } catch {
    console.error('Visit tracking temporarily unavailable');
    return Response.json({ error: 'tracking_unavailable' }, { status: 503, headers: noStore });
  }
}
