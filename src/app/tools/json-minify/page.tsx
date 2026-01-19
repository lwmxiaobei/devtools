'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Minimize2, FileJson, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface Stats {
    original: number;
    minified: number;
    saved: number;
    ratio: number;
}

export default function JsonMinifyPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState<Stats>({ original: 0, minified: 0, saved: 0, ratio: 0 });
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();
    
    const t = (key: string) => getTranslation(language, key);
    
    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            setStats({ original: 0, minified: 0, saved: 0, ratio: 0 });
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            
            const originalSize = new Blob([input]).size;
            const minifiedSize = new Blob([minified]).size;
            const saved = originalSize - minifiedSize;
            const ratio = originalSize > 0 ? parseFloat(((saved / originalSize) * 100).toFixed(1)) : 0;
            
            setOutput(minified);
            setError('');
            setStats({
                original: originalSize,
                minified: minifiedSize,
                saved: saved,
                ratio: ratio
            });
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
            setOutput('');
            setStats({ original: 0, minified: 0, saved: 0, ratio: 0 });
        }
    }, [input, language]);
    
    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };
    
    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
        setStats({ original: 0, minified: 0, saved: 0, ratio: 0 });
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
                    <h1 className="tool-title">{t('toolPages.jsonMinify.title')}</h1>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}>
                        {t('toolPages.common.realtime')}
                    </span>
                </div>
                
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonMinify.inputJson')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonMinify.inputPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '0 8px'
                    }}>
                        <ArrowRight size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                    
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonMinify.minifiedResult')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonMinify.outputPlaceholder')}
                            value={output}
                            readOnly
                        />
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                borderTop: '1px solid var(--border)',
                                fontSize: '0.85rem',
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>
                
                {stats.original > 0 && !error && (
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px 20px',
                        background: 'var(--card-bg)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        marginTop: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileJson size={18} style={{ color: 'var(--text-secondary)' }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {t('toolPages.jsonMinify.originalSize')}:
                            </span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                {formatBytes(stats.original)}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Minimize2 size={18} style={{ color: 'var(--primary)' }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {t('toolPages.jsonMinify.minifiedSize')}:
                            </span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>
                                {formatBytes(stats.minified)}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ArrowRight size={18} style={{ color: '#22c55e' }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {t('toolPages.jsonMinify.saved')}:
                            </span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#22c55e' }}>
                                {formatBytes(stats.saved)} ({stats.ratio}%)
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}