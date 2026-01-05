import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('hash');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
