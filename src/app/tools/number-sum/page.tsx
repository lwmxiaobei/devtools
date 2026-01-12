'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Calculator } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface Statistics {
    sum: number;
    average: number;
    max: number;
    min: number;
    count: number;
}

export default function NumberSumPage() {
    const [input, setInput] = useState('');
    const [stats, setStats] = useState<Statistics | null>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input.trim()) {
            setStats(null);
            return;
        }

        const lines = input.split('\n');
        const numbers: number[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // 支持多种数字格式
            const num = parseFloat(trimmed.replace(/,/g, ''));
            if (!isNaN(num)) {
                numbers.push(num);
            }
        }

        if (numbers.length === 0) {
            setStats(null);
            return;
        }

        const sum = numbers.reduce((a, b) => a + b, 0);
        setStats({
            sum,
            average: sum / numbers.length,
            max: Math.max(...numbers),
            min: Math.min(...numbers),
            count: numbers.length,
        });
    }, [input]);

    const formatNumber = (num: number): string => {
        return num.toLocaleString(undefined, {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0
        });
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setStats(null);
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
                    <h1 className="tool-title">{t('toolPages.numberSum.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.numberSum.inputNumbers')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.numberSum.placeholder')}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.numberSum.statistics')}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '16px',
                            background: 'var(--bg-primary)',
                            flex: 1,
                        }}>
                            {stats ? (
                                <>
                                    {[
                                        { key: 'sum', value: stats.sum },
                                        { key: 'average', value: stats.average },
                                        { key: 'max', value: stats.max },
                                        { key: 'min', value: stats.min },
                                        { key: 'count', value: stats.count },
                                    ].map(({ key, value }) => (
                                        <div
                                            key={key}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius)',
                                            }}
                                        >
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {t(`toolPages.numberSum.${key}`)}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontFamily: 'JetBrains Mono, monospace',
                                                    fontWeight: 600,
                                                    fontSize: '1.1rem',
                                                }}>
                                                    {formatNumber(value)}
                                                </span>
                                                <button
                                                    className="editor-btn"
                                                    onClick={() => copyToClipboard(value.toString())}
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div style={{
                                    color: 'var(--text-muted)',
                                    textAlign: 'center',
                                    padding: '40px',
                                }}>
                                    {language === 'zh' ? '请输入数值列表...' : 'Enter number list...'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
