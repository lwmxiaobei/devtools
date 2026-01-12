'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Search } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function StringCountPage() {
    const [input, setInput] = useState('');
    const [searchString, setSearchString] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(true);
    const [count, setCount] = useState<number | null>(null);
    const [positions, setPositions] = useState<number[]>([]);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const handleSearch = () => {
        if (!input || !searchString) {
            setCount(null);
            setPositions([]);
            return;
        }

        const text = caseSensitive ? input : input.toLowerCase();
        const search = caseSensitive ? searchString : searchString.toLowerCase();

        const foundPositions: number[] = [];
        let pos = text.indexOf(search);

        while (pos !== -1) {
            foundPositions.push(pos);
            pos = text.indexOf(search, pos + 1);
        }

        setCount(foundPositions.length);
        setPositions(foundPositions);
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setSearchString('');
        setCount(null);
        setPositions([]);
    };

    const highlightText = () => {
        if (!searchString || count === 0 || count === null) return input;

        const text = input;
        const search = caseSensitive ? searchString : searchString.toLowerCase();
        const parts: React.ReactElement[] = [];
        let lastIndex = 0;

        for (const pos of positions) {
            if (pos > lastIndex) {
                parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, pos)}</span>);
            }
            parts.push(
                <mark key={`mark-${pos}`} style={{
                    background: 'var(--accent-color)',
                    color: 'white',
                    padding: '0 2px',
                    borderRadius: '2px',
                }}>
                    {text.slice(pos, pos + searchString.length)}
                </mark>
            );
            lastIndex = pos + searchString.length;
        }

        if (lastIndex < text.length) {
            parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
        }

        return parts;
    };

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.stringCount.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.stringCount.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.stringCount.placeholder')}
                        />
                        <div className="input-group" style={{ marginTop: '16px', padding: '16px' }}>
                            <label className="input-label">{t('toolPages.stringCount.searchString')}</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ flex: 1, minWidth: '150px' }}
                                    value={searchString}
                                    onChange={(e) => setSearchString(e.target.value)}
                                    placeholder={t('toolPages.stringCount.searchPlaceholder')}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    padding: '8px 12px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    transition: 'var(--transition)',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={caseSensitive}
                                        onChange={(e) => setCaseSensitive(e.target.checked)}
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            accentColor: 'var(--primary)',
                                            cursor: 'pointer',
                                        }}
                                    />
                                    {t('toolPages.stringCount.caseSensitive')}
                                </label>
                                <button className="action-btn primary" onClick={handleSearch} style={{ whiteSpace: 'nowrap' }}>
                                    <Search size={16} />
                                    {t('toolPages.stringCount.search')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.stringCount.result')}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            flex: 1,
                        }}>
                            {count !== null && (
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '16px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius)',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                            {t('toolPages.stringCount.occurrences')}
                                        </div>
                                        <div style={{
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            color: count > 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                                        }}>
                                            {count}
                                        </div>
                                    </div>
                                    {positions.length > 0 && (
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                {t('toolPages.stringCount.positions')}
                                            </div>
                                            <div style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-primary)',
                                            }}>
                                                {positions.slice(0, 10).join(', ')}
                                                {positions.length > 10 && `... +${positions.length - 10}`}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div style={{
                                flex: 1,
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius)',
                                padding: '16px',
                                overflow: 'auto',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}>
                                {count !== null ? (
                                    highlightText()
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {language === 'zh' ? '输入搜索字符串后点击搜索...' : 'Enter search string and click search...'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
