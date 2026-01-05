import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('pdf-to-image');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
