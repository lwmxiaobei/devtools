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

export default function Md5Page() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [uppercase, setUppercase] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const calculateMd5 = () => {
        const hash = CryptoJS.MD5(input).toString();
        setOutput(uppercase ? hash.toUpperCase() : hash);
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
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
                    <h1 className="tool-title">{t('toolPages.md5.title')}</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <label className="input-label">{t('toolPages.md5.textToEncrypt')}</label>
                        <textarea
                            className="editor-textarea"
                            style={{ minHeight: '150px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            placeholder={t('toolPages.md5.inputPlaceholder')}
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

                    <div className="action-row" style={{ marginBottom: '20px' }}>
                        <button className="action-btn primary" onClick={calculateMd5}>
                            <Hash size={18} />
                            {t('toolPages.md5.calculateMd5')}
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            {t('toolPages.common.clear')}
                        </button>
                    </div>

                    {output && (
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="input-label" style={{ margin: 0 }}>{t('toolPages.md5.md5Value32')}</label>
                                <button className="editor-btn" onClick={copyToClipboard}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                            <div className="result-box" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {output}
                            </div>
                            <div style={{ marginTop: '12px' }}>
                                <label className="input-label" style={{ marginBottom: '8px' }}>{t('toolPages.md5.md5Value16')}</label>
                                <div className="result-box" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                    {output.substring(8, 24)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
