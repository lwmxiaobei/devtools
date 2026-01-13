import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('html-escape');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
