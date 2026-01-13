import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('chinese-pinyin');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
