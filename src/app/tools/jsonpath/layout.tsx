import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('jsonpath');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
