import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('lottie-preview');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
