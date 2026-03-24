import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('csv-json');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
