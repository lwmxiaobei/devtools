'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function UrlEncodePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [encodeType, setEncodeType] = useState<'component' | 'uri'>('component');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const encode = () => {
        try {
            if (encodeType === 'component') {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(encodeURI(input));
            }
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.encodeError')}: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const decode = () => {
        try {
            if (encodeType === 'component') {
                setOutput(decodeURIComponent(input));
            } else {
                setOutput(decodeURI(input));
            }
            setError('');
        } catch {
            setError(t('toolPages.urlEncode.decodeFailed'));
            setOutput('');
        }
    };

    // 实时编解码
    useEffect(() => {
        if (!input) {
            setOutput('');
            setError('');
            return;
        }
        if (mode === 'encode') {
            encode();
        } else {
            decode();
        }
    }, [input, mode, encodeType]);

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
    };

    const swapInputOutput = () => {
        setInput(output);
        setOutput('');
        setMode(mode === 'encode' ? 'decode' : 'encode');
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
                    <h1 className="tool-title">{t('toolPages.urlEncode.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${mode === 'encode' ? 'active' : ''}`}
                            onClick={() => setMode('encode')}
                        >
                            {t('toolPages.common.encode')}
                        </button>
                        <button
                            className={`option-btn ${mode === 'decode' ? 'active' : ''}`}
                            onClick={() => setMode('decode')}
                        >
                            {t('toolPages.common.decode')}
                        </button>
                    </div>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${encodeType === 'component' ? 'active' : ''}`}
                            onClick={() => setEncodeType('component')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            encodeURIComponent
                        </button>
                        <button
                            className={`option-btn ${encodeType === 'uri' ? 'active' : ''}`}
                            onClick={() => setEncodeType('uri')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            encodeURI
                        </button>
                    </div>
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}>
                        <ArrowRightLeft size={18} />
                        {t('toolPages.common.swap')}
                    </button>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encode' ? t('toolPages.urlEncode.urlToEncode') : t('toolPages.urlEncode.urlToDecode')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'encode' ? t('toolPages.urlEncode.encodePlaceholder') : t('toolPages.urlEncode.decodePlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encode' ? t('toolPages.urlEncode.encodedResult') : t('toolPages.urlEncode.decodedResult')}
                            </span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                <Copy size={14} />
                                {t('toolPages.common.copy')}
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            readOnly
                            value={output}
                            placeholder={t('toolPages.common.result')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
