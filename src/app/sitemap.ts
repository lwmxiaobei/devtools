import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { tools } from '@/lib/tools';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Homepage
    const routes: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        // Privacy and Terms pages
        {
            url: `${SITE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // All tool pages
    tools.forEach((tool) => {
        routes.push({
            url: `${SITE_URL}${tool.path}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        });
    });

    return routes;
}
