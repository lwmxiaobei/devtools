import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('qrcode-generate');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
