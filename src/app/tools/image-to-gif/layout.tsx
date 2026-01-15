import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('image-to-gif');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
