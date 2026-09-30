// The platform enforces this burst limit before invoking the Next.js function.
// The application's Redis counter separately enforces hourly and daily quotas.
export default async function chatGuard(_request, context) {
  return context.next();
}

export const config = {
  path: "/api/chat",
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
