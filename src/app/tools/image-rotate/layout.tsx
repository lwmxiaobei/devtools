import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('image-rotate');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
