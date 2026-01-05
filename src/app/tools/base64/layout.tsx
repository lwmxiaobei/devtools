import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('base64');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
