import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('url-encode');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
