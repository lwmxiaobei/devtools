import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('jwt');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
