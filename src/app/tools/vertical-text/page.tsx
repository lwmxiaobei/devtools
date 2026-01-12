'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function VerticalTextPage() {
    const [input, setInput] = useState('');
    const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const getVerticalText = (): string[][] => {
        if (!input) return [];

        const lines = input.split('\n');
        const maxLength = Math.max(...lines.map(l => [...l].length));
        const result: string[][] = [];

        for (let i = 0; i < maxLength; i++) {
            const column: string[] = [];
            for (const line of lines) {
                const chars = [...line];
                column.push(chars[i] || '　'); // 全角空格
            }
            result.push(column);
        }

        return direction === 'rtl' ? result.reverse() : result;
    };

    const getVerticalTextString = (): string => {
        const columns = getVerticalText();
        if (columns.length === 0) return '';

        const maxRows = Math.max(...columns.map(c => c.length));
        const rows: string[] = [];

        for (let i = 0; i < maxRows; i++) {
            const row = columns.map(col => col[i] || '　').join('');
            rows.push(row);
        }

        return rows.join('\n');
    };

    const copyToClipboard = async () => {
        const text = getVerticalTextString();
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
    };

    const verticalColumns = getVerticalText();

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.verticalText.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.verticalText.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.verticalText.placeholder')}
                        />
                        <div className="input-group" style={{ marginTop: '16px', padding: '16px' }}>
                            <label className="input-label">{t('toolPages.verticalText.direction')}</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="direction"
                                        checked={direction === 'rtl'}
                                        onChange={() => setDirection('rtl')}
                                    />
                                    {t('toolPages.verticalText.rightToLeft')}
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="direction"
                                        checked={direction === 'ltr'}
                                        onChange={() => setDirection('ltr')}
                                    />
                                    {t('toolPages.verticalText.leftToRight')}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.verticalText.preview')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!input}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                gap: '4px',
                                padding: '16px',
                                background: 'var(--bg-primary)',
                                overflowX: 'auto',
                                minHeight: '300px',
                                fontFamily: 'inherit',
                                fontSize: '1.1rem',
                                lineHeight: 1.6,
                            }}
                        >
                            {verticalColumns.map((column, colIndex) => (
                                <div
                                    key={colIndex}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        writingMode: 'vertical-rl',
                                    }}
                                >
                                    {column.map((char, charIndex) => (
                                        <span key={charIndex}>{char}</span>
                                    ))}
                                </div>
                            ))}
                            {!input && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {language === 'zh' ? '竖排预览将显示在这里...' : 'Vertical preview will appear here...'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
