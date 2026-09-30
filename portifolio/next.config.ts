/** @type {import('next').NextConfig} */
const nextConfig = {
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