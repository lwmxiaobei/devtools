import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('image-grid');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
