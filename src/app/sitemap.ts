import { MetadataRoute } from 'next';
import { tools } from '@/lib/tools';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Homepage with language alternates
    const routes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
            alternates: {
                languages: {
                    'zh-CN': siteUrl,
                    'en': siteUrl,
                },
            },
        },
        // Privacy and Terms pages
        {
            url: `${siteUrl}/privacy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${siteUrl}/terms`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // All tool pages with language alternates
    tools.forEach((tool) => {
        routes.push({
            url: `${siteUrl}${tool.path}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
            alternates: {
                languages: {
                    'zh-CN': `${siteUrl}${tool.path}`,
                    'en': `${siteUrl}${tool.path}`,
                },
            },
        });
    });

    return routes;
}
