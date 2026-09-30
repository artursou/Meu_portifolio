// Cabeçalhos de segurança aplicados a todas as rotas.
// frame-ancestors/X-Frame-Options impedem que o site (e o /admin) seja
// embutido em outra página para enganar cliques (clickjacking).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    // O cache em disco do Turbopack grava valores de variáveis de ambiente
    // (ex.: GEMINI_API_KEY) e é barrado pelo secrets scanning da Netlify.
    turbopackFileSystemCacheForBuild: false,
  },
};

module.exports = nextConfig;