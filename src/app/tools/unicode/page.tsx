'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type UnicodeFormat = 'uHex' | 'uPlus' | 'html' | 'css';

export default function UnicodePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [format, setFormat] = useState<UnicodeFormat>('uHex');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const textToUnicode = (text: string, fmt: UnicodeFormat): string => {
        return Array.from(text).map(char => {
            const code = char.codePointAt(0) || 0;
            switch (fmt) {
                case 'uHex':
                    if (code > 0xFFFF) {
                        const high = Math.floor((code - 0x10000) / 0x400) + 0xD800;
                        const low = ((code - 0x10000) % 0x400) + 0xDC00;
                        return `\\u${high.toString(16).padStart(4, '0')}\\u${low.toString(16).padStart(4, '0')}`;
                    }
                    return `\\u${code.toString(16).padStart(4, '0')}`;
                case 'uPlus':
                    return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
                case 'html':
                    return `&#${code};`;
                case 'css':
                    return `\\${code.toString(16).toUpperCase()}`;
                default:
                    return char;
            }
        }).join(fmt === 'uPlus' || fmt === 'css' ? ' ' : '');
    };

    const unicodeToText = (unicode: string): string => {
        let result = unicode;
        
        result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });
        
        result = result.replace(/U\+([0-9a-fA-F]{4,6})/gi, (_, hex) => {
            return String.fromCodePoint(parseInt(hex, 16));
        });
        
        result = result.replace(/&#(\d+);/g, (_, dec) => {
            return String.fromCodePoint(parseInt(dec, 10));
        });
        
        result = result.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
            return String.fromCodePoint(parseInt(hex, 16));
        });
        
        result = result.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => {
            return String.fromCodePoint(parseInt(hex, 16));
        });
        
        return result;
    };

    useEffect(() => {
        if (!input) {
            setOutput('');
            setError('');
            return;
        }

        try {
            if (mode === 'encode') {
                const result = textToUnicode(input, format);
                setOutput(result);
                setError('');
            } else {
                const result = unicodeToText(input);
                setOutput(result);
                setError('');
            }
        } catch (e) {
            setError(`${t('toolPages.common.error')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, mode, format, language]);

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
                    <h1 className="tool-title">{t('toolPages.unicode.title')}</h1>
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
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}>
                        <ArrowRightLeft size={18} />
                        {t('toolPages.common.swap')}
                    </button>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                {mode === 'encode' && (
                    <div className="action-row" style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '12px' }}>
                            {t('toolPages.unicode.outputFormat')}:
                        </span>
                        <div className="options-grid" style={{ margin: 0 }}>
                            <button
                                className={`option-btn ${format === 'uHex' ? 'active' : ''}`}
                                onClick={() => setFormat('uHex')}
                            >
                                {t('toolPages.unicode.formatUHex')}
                            </button>
                            <button
                                className={`option-btn ${format === 'uPlus' ? 'active' : ''}`}
                                onClick={() => setFormat('uPlus')}
                            >
                                {t('toolPages.unicode.formatUPlus')}
                            </button>
                            <button
                                className={`option-btn ${format === 'html' ? 'active' : ''}`}
                                onClick={() => setFormat('html')}
                            >
                                {t('toolPages.unicode.formatHtml')}
                            </button>
                            <button
                                className={`option-btn ${format === 'css' ? 'active' : ''}`}
                                onClick={() => setFormat('css')}
                            >
                                {t('toolPages.unicode.formatCss')}
                            </button>
                        </div>
                    </div>
                )}

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
                                {mode === 'encode' ? t('toolPages.unicode.textToEncode') : t('toolPages.unicode.unicodeToDecode')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'encode' ? t('toolPages.unicode.inputPlaceholder') : t('toolPages.unicode.unicodePlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encode' ? t('toolPages.unicode.encodedUnicode') : t('toolPages.unicode.decodedText')}
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
                            placeholder={t('toolPages.unicode.resultPlaceholder')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
