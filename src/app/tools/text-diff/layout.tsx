import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('text-diff');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
