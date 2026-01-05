import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('id-photo-bg');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
