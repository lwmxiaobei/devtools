import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-formatter');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
