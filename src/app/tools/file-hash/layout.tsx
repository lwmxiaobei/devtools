import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('file-hash');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
