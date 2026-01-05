import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('timestamp');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
