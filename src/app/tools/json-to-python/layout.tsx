import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-to-python');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
