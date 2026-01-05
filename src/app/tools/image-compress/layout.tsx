import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('image-compress');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
