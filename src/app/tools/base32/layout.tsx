import { getToolMetadata } from '@/lib/seo';
export const metadata = getToolMetadata('base32');
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
