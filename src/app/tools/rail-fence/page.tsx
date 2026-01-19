'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function RailFencePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [rails, setRails] = useState(3);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const railFenceEncode = (text: string, numRails: number): string => {
        if (numRails <= 1 || text.length <= numRails) return text;
        const fence: string[][] = Array.from({ length: numRails }, () => []);
        let rail = 0, direction = 1;
        for (const char of text) {
            fence[rail].push(char);
            rail += direction;
            if (rail === 0 || rail === numRails - 1) direction = -direction;
        }
        return fence.flat().join('');
    };

    const railFenceDecode = (text: string, numRails: number): string => {
        if (numRails <= 1 || text.length <= numRails) return text;
        const len = text.length;
        const pattern: number[] = [];
        let rail = 0, direction = 1;
        for (let i = 0; i < len; i++) {
            pattern.push(rail);
            rail += direction;
            if (rail === 0 || rail === numRails - 1) direction = -direction;
        }
        const counts = Array(numRails).fill(0);
        pattern.forEach(r => counts[r]++);
        const starts: number[] = [0];
        for (let i = 1; i < numRails; i++) starts.push(starts[i - 1] + counts[i - 1]);
        const positions = [...starts];
        const result: string[] = Array(len);
        for (let i = 0; i < len; i++) {
            const r = pattern[i];
            result[i] = text[positions[r]++];
        }
        return result.join('');
    };

    useEffect(() => {
        if (!input) { setOutput(''); setError(''); return; }
        try {
            const result = mode === 'encode' ? railFenceEncode(input, rails) : railFenceDecode(input, rails);
            setOutput(result); setError('');
        } catch (e) { setError(`${t('toolPages.common.error')}: ${(e as Error).message}`); setOutput(''); }
    }, [input, mode, rails, language]);

    const copyToClipboard = async () => { if (output) { await navigator.clipboard.writeText(output); showToast(t('toolPages.common.copied')); } };
    const clearAll = () => { setInput(''); setOutput(''); setError(''); };
    const swapInputOutput = () => { setInput(output); setOutput(''); setMode(mode === 'encode' ? 'decode' : 'encode'); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.railFence.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button className={`option-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => setMode('encode')}>{t('toolPages.common.encode')}</button>
                        <button className={`option-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => setMode('decode')}>{t('toolPages.common.decode')}</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('toolPages.railFence.rails')}:</span>
                        <select value={rails} onChange={(e) => setRails(parseInt(e.target.value))} style={{ padding: '6px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}><ArrowRightLeft size={18} />{t('toolPages.common.swap')}</button>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                {error && <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</div>}
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header"><span className="editor-title">{t('toolPages.railFence.input')}</span></div>
                        <textarea className="editor-textarea" placeholder={t('toolPages.railFence.inputPlaceholder')} value={input} onChange={(e) => setInput(e.target.value)} />
                    </div>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.railFence.output')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}><Copy size={14} />{t('toolPages.common.copy')}</button>
                        </div>
                        <textarea className="editor-textarea" readOnly value={output} placeholder={t('toolPages.railFence.resultPlaceholder')} />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
