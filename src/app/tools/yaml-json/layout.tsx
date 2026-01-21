import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('yaml-json');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
