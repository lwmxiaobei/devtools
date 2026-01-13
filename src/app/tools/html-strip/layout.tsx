import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('html-strip');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
