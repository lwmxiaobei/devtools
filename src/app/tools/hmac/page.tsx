'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import CryptoJS from 'crypto-js';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type HmacAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

export default function HmacPage() {
    const [message, setMessage] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [results, setResults] = useState<Record<HmacAlgorithm, string>>({ MD5: '', SHA1: '', SHA256: '', SHA512: '' });
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const calculateHmac = useCallback(() => {
        if (!message || !secretKey) {
            setResults({ MD5: '', SHA1: '', SHA256: '', SHA512: '' });
            return;
        }
        setResults({
            MD5: CryptoJS.HmacMD5(message, secretKey).toString(),
            SHA1: CryptoJS.HmacSHA1(message, secretKey).toString(),
            SHA256: CryptoJS.HmacSHA256(message, secretKey).toString(),
            SHA512: CryptoJS.HmacSHA512(message, secretKey).toString(),
        });
    }, [message, secretKey]);

    const copyToClipboard = async (text: string, label: string) => {
        if (text) { await navigator.clipboard.writeText(text); showToast(`${label} ${t('toolPages.common.copied')}`); }
    };

    const clearAll = () => { setMessage(''); setSecretKey(''); setResults({ MD5: '', SHA1: '', SHA256: '', SHA512: '' }); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.hmac.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('toolPages.hmac.secretKey')}</label>
                    <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder={t('toolPages.hmac.keyPlaceholder')}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('toolPages.hmac.message')}</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('toolPages.hmac.messagePlaceholder')}
                        style={{ width: '100%', height: '120px', padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace', resize: 'vertical' }} />
                </div>
                <button className="action-btn primary" onClick={calculateHmac} disabled={!message || !secretKey} style={{ marginBottom: '20px' }}>{t('toolPages.hmac.calculate')}</button>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {(['MD5', 'SHA1', 'SHA256', 'SHA512'] as HmacAlgorithm[]).map(algo => (
                        <div key={algo} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>HMAC-{algo}</span>
                                <button onClick={() => copyToClipboard(results[algo], `HMAC-${algo}`)} disabled={!results[algo]}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: results[algo] ? 'pointer' : 'not-allowed', opacity: results[algo] ? 1 : 0.5 }}>
                                    <Copy size={12} />{t('toolPages.common.copy')}
                                </button>
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: 'var(--text-secondary)', minHeight: '20px' }}>{results[algo] || '-'}</div>
                        </div>
                    ))}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
