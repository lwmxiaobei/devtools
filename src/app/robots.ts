import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/sw.js', '/manifest.json'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
