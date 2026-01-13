import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('password-generator');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
