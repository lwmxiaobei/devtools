'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, GitCompare } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function TextDiffPage() {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const diff = useMemo(() => {
        if (!text1 && !text2) return [];

        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const maxLines = Math.max(lines1.length, lines2.length);
        const result: Array<{ type: 'same' | 'added' | 'removed' | 'changed'; line1: string; line2: string; lineNum: number }> = [];

        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] ?? '';
            const line2 = lines2[i] ?? '';

            if (line1 === line2) {
                result.push({ type: 'same', line1, line2, lineNum: i + 1 });
            } else if (!line1 && line2) {
                result.push({ type: 'added', line1, line2, lineNum: i + 1 });
            } else if (line1 && !line2) {
                result.push({ type: 'removed', line1, line2, lineNum: i + 1 });
            } else {
                result.push({ type: 'changed', line1, line2, lineNum: i + 1 });
            }
        }

        return result;
    }, [text1, text2]);

    const stats = useMemo(() => {
        return {
            same: diff.filter((d) => d.type === 'same').length,
            added: diff.filter((d) => d.type === 'added').length,
            removed: diff.filter((d) => d.type === 'removed').length,
            changed: diff.filter((d) => d.type === 'changed').length,
        };
    }, [diff]);

    const clearAll = () => {
        setText1('');
        setText2('');
    };

    const getLineStyle = (type: string) => {
        switch (type) {
            case 'added':
                return {
                    background: 'rgba(34, 197, 94, 0.15)',
                    borderLeft: '3px solid #22c55e',
                    color: '#22c55e',
                };
            case 'removed':
                return {
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderLeft: '3px solid #ef4444',
                    color: '#ef4444',
                };
            case 'changed':
                return {
                    background: 'rgba(245, 158, 11, 0.15)',
                    borderLeft: '3px solid #f59e0b',
                    color: '#f59e0b',
                };
            default:
                return {};
        }
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
                    <h1 className="tool-title">{t('toolPages.textDiff.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.textDiff.originalText')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={language === 'zh' ? '请输入原始文本...' : 'Enter original text...'}
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.textDiff.modifiedText')}</span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={language === 'zh' ? '请输入要对比的文本...' : 'Enter text to compare...'}
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                        />
                    </div>
                </div>

                {diff.length > 0 && (
                    <>
                        {/* 统计信息 */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            padding: '16px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: '20px',
                            flexWrap: 'wrap',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <GitCompare size={20} color="var(--primary)" />
                                <span style={{ fontWeight: 600 }}>{t('toolPages.textDiff.diffResult')}:</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {t('toolPages.textDiff.unchanged')} <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stats.same}</span> {language === 'zh' ? '行' : 'lines'}
                            </div>
                            <div style={{ color: '#22c55e' }}>
                                {t('toolPages.textDiff.added')} <span style={{ fontWeight: 600 }}>{stats.added}</span> {language === 'zh' ? '行' : 'lines'}
                            </div>
                            <div style={{ color: '#ef4444' }}>
                                {t('toolPages.textDiff.removed')} <span style={{ fontWeight: 600 }}>{stats.removed}</span> {language === 'zh' ? '行' : 'lines'}
                            </div>
                            <div style={{ color: '#f59e0b' }}>
                                {language === 'zh' ? '修改' : 'Changed'} <span style={{ fontWeight: 600 }}>{stats.changed}</span> {language === 'zh' ? '行' : 'lines'}
                            </div>
                        </div>

                        {/* 对比结果 */}
                        <div style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                borderBottom: '1px solid var(--border)',
                                padding: '12px 16px',
                                background: 'var(--bg-tertiary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                            }}>
                                <div>{t('toolPages.textDiff.originalText')}</div>
                                <div>{t('toolPages.textDiff.modifiedText')}</div>
                            </div>
                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                                {diff.map((d, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            borderBottom: '1px solid var(--border)',
                                            fontSize: '0.85rem',
                                            fontFamily: 'JetBrains Mono, monospace',
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: '8px 16px',
                                                ...getLineStyle(d.type === 'removed' || d.type === 'changed' ? d.type : 'same'),
                                                ...d.type === 'added' ? { background: 'var(--bg-tertiary)' } : {},
                                            }}
                                        >
                                            <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>{d.lineNum}</span>
                                            {d.line1}
                                        </div>
                                        <div
                                            style={{
                                                padding: '8px 16px',
                                                borderLeft: '1px solid var(--border)',
                                                ...getLineStyle(d.type === 'added' || d.type === 'changed' ? d.type : 'same'),
                                                ...d.type === 'removed' ? { background: 'var(--bg-tertiary)' } : {},
                                            }}
                                        >
                                            <span style={{ color: 'var(--text-muted)', marginRight: '12px' }}>{d.lineNum}</span>
                                            {d.line2}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
