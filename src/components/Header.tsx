'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { tools, categories } from '@/lib/tools';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from './LanguageContext';

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export default function Header({ searchQuery: externalQuery, onSearchChange }: HeaderProps) {
    const { t, tTool, tCategory } = useTranslation();
    const [internalQuery, setInternalQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Use external query if provided, otherwise use internal state
    const searchQuery = externalQuery !== undefined ? externalQuery : internalQuery;
    const handleSearchChange = onSearchChange || setInternalQuery;

    // Filter tools based on search query
    const filteredTools = tools.filter((tool) => {
        if (!searchQuery.trim()) return false;
        const query = searchQuery.toLowerCase();
        return tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Group tools by category
    const groupedTools = filteredTools.reduce((acc, tool) => {
        if (!acc[tool.category]) {
            acc[tool.category] = [];
        }
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, typeof tools>);

    const getCategoryName = (categoryId: string) => {
        return tCategory(categoryId);
    };

    const handleInputChange = useCallback((value: string) => {
        handleSearchChange(value);
        setIsOpen(value.trim().length > 0);
    }, [handleSearchChange]);

    const clearSearch = useCallback(() => {
        handleSearchChange('');
        setIsOpen(false);
    }, [handleSearchChange]);

    const handleLinkClick = useCallback(() => {
        setIsOpen(false);
        setInternalQuery('');
    }, []);

    return (
        <header className="header">
            <div className="header-container">
                <Link href="/" className="logo">
                    <div className="logo-icon">
                        <Image src="/logo.png" alt="LocalTools" width={48} height={48} style={{ borderRadius: '6px' }} />
                    </div>
                    <span>LocalTools.cc</span>
                </Link>

                <nav className="nav-links">
                    <Link href="/" className="nav-link active">{t('nav.tools')}</Link>
                    {/* <Link href="#" className="nav-link">教程</Link> */}
                    {/* <Link href="#" className="nav-link">博客</Link> */}
                </nav>

                <div className="header-actions">
                    <div className="search-box-wrapper" ref={searchRef}>
                        <div className={`search-box ${isOpen && filteredTools.length > 0 ? 'has-results' : ''}`}>
                            <Search size={18} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={searchQuery}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onFocus={() => searchQuery.trim() && setIsOpen(true)}
                            />
                            {searchQuery && (
                                <button className="search-clear-btn" onClick={clearSearch}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {isOpen && filteredTools.length > 0 && (
                            <div className="search-dropdown">
                                {Object.entries(groupedTools).map(([categoryId, categoryTools]) => (
                                    <div key={categoryId} className="search-category">
                                        <div className="search-category-title">
                                            {getCategoryName(categoryId)}
                                        </div>
                                        {categoryTools.map((tool) => {
                                            const Icon = tool.icon;
                                            return (
                                                <Link
                                                    key={tool.id}
                                                    href={tool.path}
                                                    className="search-result-item"
                                                    onClick={handleLinkClick}
                                                >
                                                    <div className={`search-result-icon ${tool.category}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="search-result-info">
                                                        <span className="search-result-name">{tTool(tool.id, 'name')}</span>
                                                        <span className="search-result-desc">{tTool(tool.id, 'description')}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isOpen && searchQuery.trim() && filteredTools.length === 0 && (
                            <div className="search-dropdown">
                                <div className="search-no-results">
                                    <p>{t('search.noResults')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
