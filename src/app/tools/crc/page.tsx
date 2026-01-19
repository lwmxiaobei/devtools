'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

const CRC16_TABLE = (() => {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) crc = crc & 1 ? (crc >>> 1) ^ 0xA001 : crc >>> 1;
        table.push(crc);
    }
    return table;
})();

const CRC32_TABLE = (() => {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) crc = crc & 1 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1;
        table.push(crc >>> 0);
    }
    return table;
})();

export default function CrcPage() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState({ crc16: '', crc32: '' });
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const calculateCrc16 = (str: string): string => {
        const bytes = new TextEncoder().encode(str);
        let crc = 0xFFFF;
        for (const byte of bytes) crc = (crc >>> 8) ^ CRC16_TABLE[(crc ^ byte) & 0xFF];
        return crc.toString(16).toUpperCase().padStart(4, '0');
    };

    const calculateCrc32 = (str: string): string => {
        const bytes = new TextEncoder().encode(str);
        let crc = 0xFFFFFFFF;
        for (const byte of bytes) crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xFF];
        return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase().padStart(8, '0');
    };

    const calculate = useCallback(() => {
        if (!input) { setResults({ crc16: '', crc32: '' }); return; }
        setResults({ crc16: calculateCrc16(input), crc32: calculateCrc32(input) });
    }, [input]);

    const copyToClipboard = async (text: string, label: string) => {
        if (text) { await navigator.clipboard.writeText(text); showToast(`${label} ${t('toolPages.common.copied')}`); }
    };

    const clearAll = () => { setInput(''); setResults({ crc16: '', crc32: '' }); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.crc.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('toolPages.crc.input')}</label>
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('toolPages.crc.inputPlaceholder')}
                        style={{ width: '100%', height: '120px', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace', resize: 'vertical' }} />
                </div>
                <button className="action-btn primary" onClick={calculate} disabled={!input} style={{ marginBottom: '20px' }}>{t('toolPages.crc.calculate')}</button>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {[{ key: 'crc16', label: 'CRC-16' }, { key: 'crc32', label: 'CRC-32' }].map(({ key, label }) => (
                        <div key={key} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                                <button onClick={() => copyToClipboard(results[key as keyof typeof results], label)} disabled={!results[key as keyof typeof results]}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: results[key as keyof typeof results] ? 'pointer' : 'not-allowed', opacity: results[key as keyof typeof results] ? 1 : 0.5 }}>
                                    <Copy size={12} />{t('toolPages.common.copy')}
                                </button>
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', wordBreak: 'break-all', color: 'var(--text-secondary)', minHeight: '24px' }}>{results[key as keyof typeof results] || '-'}</div>
                        </div>
                    ))}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
