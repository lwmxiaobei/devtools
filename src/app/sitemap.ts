import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Homepage
    const routes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
    ];

    // All tool pages
    tools.forEach((tool) => {
        routes.push({
            url: `${siteUrl}${tool.path}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        });
    });

    return routes;
}
