import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('cron-parser');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
