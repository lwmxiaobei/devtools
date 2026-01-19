import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('unicode');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
