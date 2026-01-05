import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('code-formatter');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
