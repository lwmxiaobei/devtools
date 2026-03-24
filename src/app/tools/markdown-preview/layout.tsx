import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('markdown-preview');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
