import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('jwt-decode');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
