/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/RaposaAnalitica';

const nextConfig = {
  output: 'export',
  // Gera foo/index.html (em vez de foo.html) pra /blog/[slug]/ resolver
  // quando o WhatsApp/scrapers adicionam barra final na URL.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

module.exports = nextConfig;
