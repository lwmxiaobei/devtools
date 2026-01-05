import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('json-editor');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
