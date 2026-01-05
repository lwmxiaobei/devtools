'use client';

import Link from 'next/link';
import { Tool } from '@/lib/tools';
import { useTranslation } from './LanguageContext';

interface ToolCardProps {
    tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
    const { tTool } = useTranslation();
    const Icon = tool.icon;

    return (
        <Link href={tool.path} className="tool-card">
            <div className={`tool-icon ${tool.iconType}`}>
                <Icon size={24} />
            </div>
            <div className="tool-content">
                <h3>{tTool(tool.id, 'name')}</h3>
                <p>{tTool(tool.id, 'description')}</p>
            </div>
        </Link>
    );
}
