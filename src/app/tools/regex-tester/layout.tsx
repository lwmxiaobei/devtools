import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('regex-tester');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
