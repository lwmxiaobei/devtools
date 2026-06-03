import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: '服务条款 | Terms of Service',
    description: 'LocalTools.cc 服务条款：了解本地开发者工具集合的使用规则、免责声明和用户责任。',
    alternates: {
        canonical: `${SITE_URL}/terms`,
    },
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        url: `${SITE_URL}/terms`,
        siteName: 'LocalTools.cc - 本地开发者工具集合',
        title: '服务条款 | Terms of Service',
        description: '了解 LocalTools.cc 的使用规则、免责声明和用户责任。',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'LocalTools.cc 服务条款',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '服务条款 | Terms of Service',
        description: 'LocalTools.cc 使用规则、免责声明和用户责任。',
        images: ['/og-image.png'],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
