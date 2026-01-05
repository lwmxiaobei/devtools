import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageContext";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DevTools - 开发者在线工具集合",
    template: "%s | DevTools",
  },
  description: "一站式开发者工具箱：JSON格式化、Base64编解码、时间戳转换、UUID生成器、图片处理、二维码生成等100+常用开发工具，免费在线使用，无需安装。",
  keywords: [
    "开发者工具",
    "在线工具",
    "JSON格式化",
    "Base64编解码",
    "时间戳转换",
    "UUID生成器",
    "MD5加密",
    "URL编解码",
    "代码格式化",
    "图片压缩",
    "二维码生成",
    "JWT解密",
    "哈希计算",
    "文本对比",
    "developer tools",
    "online tools",
    "JSON formatter",
    "DevTools",
  ],
  authors: [{ name: "DevTools Team" }],
  creator: "DevTools",
  publisher: "DevTools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "DevTools - 开发者在线工具集合",
    title: "DevTools - 开发者在线工具集合",
    description: "一站式开发者工具箱：JSON格式化、Base64编解码、时间戳转换、UUID生成器等40+常用开发工具，免费在线使用。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevTools - 开发者在线工具集合",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTools - 开发者在线工具集合",
    description: "一站式开发者工具箱：JSON格式化、Base64编解码、时间戳转换、UUID生成器等40+常用开发工具。",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
  classification: "Developer Tools",
  other: {
    "google-site-verification": "your-google-verification-code",
    "baidu-site-verification": "your-baidu-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DevTools" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <LanguageProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              {children}
              <Footer />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
