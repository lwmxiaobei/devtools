import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('text-shuffle');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
