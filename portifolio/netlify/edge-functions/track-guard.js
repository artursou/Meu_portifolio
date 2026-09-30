// Burst limit for visit tracking, applied before the Next.js function runs.
// Each visitor is counted once per day, so real browsers send very few requests.
export default async function trackGuard(_request, context) {
  return context.next();
}

export const config = {
  path: "/api/track",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
