import { getToolMetadata } from '@/lib/seo';
export const metadata = getToolMetadata('morse');
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
