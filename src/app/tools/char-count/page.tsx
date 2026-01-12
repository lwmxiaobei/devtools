'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface CharStat {
    char: string;
    count: number;
    percentage: number;
}

export default function CharCountPage() {
    const [input, setInput] = useState('');
    const [stats, setStats] = useState<CharStat[]>([]);
    const [totalChars, setTotalChars] = useState(0);
    const [uniqueChars, setUniqueChars] = useState(0);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input) {
            setStats([]);
            setTotalChars(0);
            setUniqueChars(0);
            return;
        }

        const chars = [...input];
        const charMap = new Map<string, number>();

        for (const char of chars) {
            charMap.set(char, (charMap.get(char) || 0) + 1);
        }

        const total = chars.length;
        const statsList: CharStat[] = Array.from(charMap.entries())
            .map(([char, count]) => ({
                char,
                count,
                percentage: (count / total) * 100,
            }))
            .sort((a, b) => b.count - a.count);

        setStats(statsList);
        setTotalChars(total);
        setUniqueChars(charMap.size);
    }, [input]);

    const getDisplayChar = (char: string): string => {
        if (char === ' ') return '␣';
        if (char === '\n') return '↵';
        if (char === '\t') return '→';
        return char;
    };

    const copyStats = async () => {
        const text = stats.map(s => `${getDisplayChar(s.char)}\t${s.count}\t${s.percentage.toFixed(2)}%`).join('\n');
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setStats([]);
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
                    <h1 className="tool-title">{t('toolPages.charCount.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.charCount.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.charCount.placeholder')}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.charCount.statistics')}</span>
                            <button className="editor-btn" onClick={copyStats} disabled={stats.length === 0}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <div style={{
                            flex: 1,
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {stats.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '12px 16px',
                                    background: 'var(--bg-secondary)',
                                    borderBottom: '1px solid var(--border-color)',
                                    fontSize: '0.9rem',
                                }}>
                                    <span>{t('toolPages.charCount.totalChars')}: <strong>{totalChars}</strong></span>
                                    <span>{t('toolPages.charCount.uniqueChars')}: <strong>{uniqueChars}</strong></span>
                                </div>
                            )}
                            <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                                {stats.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'left',
                                            }}>
                                                <th style={{ padding: '8px 12px' }}>{t('toolPages.charCount.character')}</th>
                                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('toolPages.charCount.occurrences')}</th>
                                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('toolPages.charCount.percentage')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.slice(0, 50).map((stat, i) => (
                                                <tr key={i} style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                }}>
                                                    <td style={{
                                                        padding: '8px 12px',
                                                        fontFamily: 'JetBrains Mono, monospace',
                                                        fontSize: '1.1rem',
                                                    }}>
                                                        {getDisplayChar(stat.char)}
                                                    </td>
                                                    <td style={{
                                                        padding: '8px 12px',
                                                        textAlign: 'right',
                                                        fontFamily: 'JetBrains Mono, monospace',
                                                    }}>
                                                        {stat.count}
                                                    </td>
                                                    <td style={{
                                                        padding: '8px 12px',
                                                        textAlign: 'right',
                                                        color: 'var(--text-secondary)',
                                                    }}>
                                                        {stat.percentage.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{
                                        color: 'var(--text-muted)',
                                        textAlign: 'center',
                                        padding: '40px',
                                    }}>
                                        {language === 'zh' ? '请输入要统计的文本...' : 'Enter text to analyze...'}
                                    </div>
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
