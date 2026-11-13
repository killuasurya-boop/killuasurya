import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/site';
import { services } from '@/content/services';
import { solutions } from '@/content/marketing';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/services', ...services.map((s) => `/services/${s.slug}`), ...solutions.map((s) => `/solusi/${s.slug}`), '/portfolio', '/case-studies', '/pricing', '/build-your-package', '/process', '/about', '/contact', '/faq', '/insights', '/privacy', '/terms'];
  return paths.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: p === '' ? 'weekly' : 'monthly', priority: p === '' ? 1 : p.startsWith('/services') ? 0.8 : 0.6 }));
}
