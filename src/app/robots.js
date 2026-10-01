import { SITE_URL as SITE_URL_FROM_LIB } from '@/lib/site';
const BASE = SITE_URL_FROM_LIB;

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
