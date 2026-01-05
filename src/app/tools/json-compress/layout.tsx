import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-compress');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
