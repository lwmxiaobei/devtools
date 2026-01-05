import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-to-objc');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
