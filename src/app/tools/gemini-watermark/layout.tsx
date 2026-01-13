import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('gemini-watermark');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
