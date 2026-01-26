'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tools, categories } from '@/lib/tools';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from './LanguageContext';

export default function ToolMenu() {
    const { tCategory, tTool } = useTranslation();
    const pathname = usePathname();
    const currentToolId = pathname.split('/').pop();
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // 按分类分组工具
    const toolsByCategory = categories
        .filter(cat => cat.id !== 'all')
        .map(category => ({
            ...category,
            tools: tools.filter(tool => tool.category === category.id)
        }))
        .filter(cat => cat.tools.length > 0);

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        setOpenCategory(openCategory === categoryId ? null : categoryId);
    };

    const handleToolClick = () => {
        setOpenCategory(null);
    };

    return (
        <div className="tool-menu" ref={menuRef}>
            <div className="tool-menu-inner">
                {toolsByCategory.map((category) => {
                    const CategoryIcon = category.icon;
                    const isOpen = openCategory === category.id;
                    const hasActiveTool = category.tools.some(tool => tool.id === currentToolId);

                    return (
                        <div key={category.id} className="tool-menu-category">
                            <button
                                className={`tool-menu-category-btn ${hasActiveTool ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <CategoryIcon size={16} />
                                <span>{tCategory(category.id)}</span>
                                <ChevronDown
                                    size={14}
                                    className={`chevron-icon ${isOpen ? 'open' : ''}`}
                                />
                            </button>

                            {isOpen && (
                                <div className="tool-menu-dropdown">
                                    {category.tools.map((tool) => {
                                        const ToolIcon = tool.icon;
                                        const isActive = tool.id === currentToolId;
                                        return (
                                            <Link
                                                key={tool.id}
                                                href={tool.path}
                                                className={`tool-menu-dropdown-item ${isActive ? 'active' : ''}`}
                                                onClick={handleToolClick}
                                            >
                                                <ToolIcon size={16} />
                                                <span>{tTool(tool.id, 'name')}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
