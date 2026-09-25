// Rate limit simples em memória (janela deslizante por IP).
// Obs.: em hospedagem serverless (ex.: Vercel) cada instância tem sua própria memória,
// então o limite é "por instância". Para um limite global, troque por Upstash Redis / Vercel KV.

const hits = new Map<string, number[]>();

export const rateLimit = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Limpeza para o Map não crescer para sempre
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(k);
    }
  }

  return true;
};

export const getClientIp = (req: Request): string =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
