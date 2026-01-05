import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('image-watermark');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
