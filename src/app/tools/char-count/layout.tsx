import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('char-count');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
