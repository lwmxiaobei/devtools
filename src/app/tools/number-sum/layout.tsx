import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('number-sum');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
