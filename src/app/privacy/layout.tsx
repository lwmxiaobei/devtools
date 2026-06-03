import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: '隐私政策 | Privacy Policy',
    description: 'LocalTools.cc 隐私政策：所有工具在浏览器本地处理数据，不上传文件内容，不在服务器保存你的输入。',
    alternates: {
        canonical: `${SITE_URL}/privacy`,
    },
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        url: `${SITE_URL}/privacy`,
        siteName: 'LocalTools.cc - 本地开发者工具集合',
        title: '隐私政策 | Privacy Policy',
        description: '了解 LocalTools.cc 如何保护隐私：数据本地处理，不上传文件内容。',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'LocalTools.cc 隐私政策',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '隐私政策 | Privacy Policy',
        description: 'LocalTools.cc 数据本地处理，不上传文件内容。',
        images: ['/og-image.png'],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
