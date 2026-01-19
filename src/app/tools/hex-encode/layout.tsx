import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('hex-encode');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
