import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('md5');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
