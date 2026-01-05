import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('image-crop');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
