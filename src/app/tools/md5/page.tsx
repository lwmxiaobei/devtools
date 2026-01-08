'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
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

    // 实时计算MD5
    useEffect(() => {
        if (!input) {
            setOutput('');
            return;
        }
        const hash = CryptoJS.MD5(input).toString();
        setOutput(uppercase ? hash.toUpperCase() : hash);
    }, [input, uppercase]);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
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

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
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
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.md5.textToEncrypt')}</span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.md5.inputPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.md5.md5Value32')}</span>
                            <button className="editor-btn" onClick={() => copyToClipboard(output)} disabled={!output}>
                                <Copy size={14} />
                                {t('toolPages.common.copy')}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', flex: 1 }}>
                            <div className="result-box" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {output || t('toolPages.md5.md5Value32')}
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="input-label" style={{ margin: 0 }}>{t('toolPages.md5.md5Value16')}</label>
                                    <button className="editor-btn" onClick={() => copyToClipboard(output.substring(8, 24))} disabled={!output}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <div className="result-box" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                    {output ? output.substring(8, 24) : t('toolPages.md5.md5Value16')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
