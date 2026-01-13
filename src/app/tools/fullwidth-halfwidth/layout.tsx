import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('fullwidth-halfwidth');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
