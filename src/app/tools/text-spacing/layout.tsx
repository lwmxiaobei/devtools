import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('text-spacing');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
