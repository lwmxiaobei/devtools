import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('xml-to-json');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
