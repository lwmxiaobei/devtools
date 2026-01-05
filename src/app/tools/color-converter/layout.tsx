import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('color-converter');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
