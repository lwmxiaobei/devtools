import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('vertical-text');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
