import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-to-go');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}