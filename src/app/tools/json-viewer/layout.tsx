import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-viewer');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
