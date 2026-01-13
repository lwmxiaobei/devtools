import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('string-count');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
