import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('case-converter');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
