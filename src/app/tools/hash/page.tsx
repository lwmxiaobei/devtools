'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Hash } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import CryptoJS from 'crypto-js';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512';

export default function HashPage() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<Record<HashType, string>>({
        md5: '',
        sha1: '',
        sha256: '',
        sha512: '',
    });
    const [uppercase, setUppercase] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const calculateHashes = () => {
        const md5 = CryptoJS.MD5(input).toString();
        const sha1 = CryptoJS.SHA1(input).toString();
        const sha256 = CryptoJS.SHA256(input).toString();
        const sha512 = CryptoJS.SHA512(input).toString();

        const transform = (s: string) => (uppercase ? s.toUpperCase() : s);

        setResults({
            md5: transform(md5),
            sha1: transform(sha1),
            sha256: transform(sha256),
            sha512: transform(sha512),
        });
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setResults({ md5: '', sha1: '', sha256: '', sha512: '' });
    };

    const hashTypes: { id: HashType; name: string; bits: string }[] = [
        { id: 'md5', name: 'MD5', bits: `128${t('toolPages.hash.bits')}` },
        { id: 'sha1', name: 'SHA-1', bits: `160${t('toolPages.hash.bits')}` },
        { id: 'sha256', name: 'SHA-256', bits: `256${t('toolPages.hash.bits')}` },
        { id: 'sha512', name: 'SHA-512', bits: `512${t('toolPages.hash.bits')}` },
    ];

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.hash.title')}</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <label className="input-label">{t('toolPages.hash.textToCalculate')}</label>
                        <textarea
                            className="editor-textarea"
                            style={{ minHeight: '150px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            placeholder={t('toolPages.hash.inputPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="options-grid">
                        <button
                            className={`option-btn ${!uppercase ? 'active' : ''}`}
                            onClick={() => setUppercase(false)}
                        >
                            {t('toolPages.common.lowercase')}
                        </button>
                        <button
                            className={`option-btn ${uppercase ? 'active' : ''}`}
                            onClick={() => setUppercase(true)}
                        >
                            {t('toolPages.common.uppercase')}
                        </button>
                    </div>

                    <div className="action-row" style={{ marginBottom: '24px' }}>
                        <button className="action-btn primary" onClick={calculateHashes}>
                            <Hash size={18} />
                            {t('toolPages.hash.calculateHash')}
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            {t('toolPages.common.clear')}
                        </button>
                    </div>

                    {results.md5 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {hashTypes.map((hash) => (
                                <div key={hash.id} className="input-group" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="input-label" style={{ margin: 0 }}>
                                            {hash.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({hash.bits})</span>
                                        </label>
                                        <button className="editor-btn" onClick={() => copyToClipboard(results[hash.id])}>
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <div
                                        className="result-box"
                                        style={{
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {results[hash.id]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
