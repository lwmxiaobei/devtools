import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('ascii');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
