import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('ascii-art');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
