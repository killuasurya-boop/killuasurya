import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/os', '/portal', '/workspace', '/login', '/client', '/reset-password', '/forgot-password', '/set-password', '/auth'] }], sitemap: `${siteUrl}/sitemap.xml` };
}
