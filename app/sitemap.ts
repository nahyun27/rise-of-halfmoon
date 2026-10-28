import type { MetadataRoute } from 'next';
import { SITE_URL } from '../constants/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: 'daily', priority: 1 }];
}
