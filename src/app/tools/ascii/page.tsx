'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type AsciiFormat = 'decimal' | 'hex' | 'binary' | 'octal';

export default function AsciiPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [format, setFormat] = useState<AsciiFormat>('decimal');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const textToAscii = (text: string, fmt: AsciiFormat): string => {
        return Array.from(text).map(char => {
            const code = char.charCodeAt(0);
            switch (fmt) {
                case 'decimal':
                    return code.toString();
                case 'hex':
                    return code.toString(16).toUpperCase().padStart(2, '0');
                case 'binary':
                    return code.toString(2).padStart(8, '0');
                case 'octal':
                    return code.toString(8).padStart(3, '0');
                default:
                    return code.toString();
            }
        }).join(' ');
    };

    const asciiToText = (ascii: string, fmt: AsciiFormat): string => {
        const parts = ascii.trim().split(/[\s,;]+/).filter(p => p);
        
        return parts.map(part => {
            let code: number;
            switch (fmt) {
                case 'decimal':
                    code = parseInt(part, 10);
                    break;
                case 'hex':
                    code = parseInt(part.replace(/^0x/i, ''), 16);
                    break;
                case 'binary':
                    code = parseInt(part.replace(/^0b/i, ''), 2);
                    break;
                case 'octal':
                    code = parseInt(part.replace(/^0o/i, ''), 8);
                    break;
                default:
                    code = parseInt(part, 10);
            }
            
            if (isNaN(code) || code < 0 || code > 0x10FFFF) {
                throw new Error(`${t('toolPages.ascii.invalidCode')}: ${part}`);
            }
            
            return String.fromCodePoint(code);
        }).join('');
    };

    useEffect(() => {
        if (!input) {
            setOutput('');
            setError('');
            return;
        }

        try {
            if (mode === 'encode') {
                const result = textToAscii(input, format);
                setOutput(result);
                setError('');
            } else {
                const result = asciiToText(input, format);
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
                    <h1 className="tool-title">{t('toolPages.ascii.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${mode === 'encode' ? 'active' : ''}`}
                            onClick={() => setMode('encode')}
                        >
                            {t('toolPages.ascii.textToCode')}
                        </button>
                        <button
                            className={`option-btn ${mode === 'decode' ? 'active' : ''}`}
                            onClick={() => setMode('decode')}
                        >
                            {t('toolPages.ascii.codeToText')}
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

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '12px' }}>
                        {t('toolPages.ascii.codeFormat')}:
                    </span>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${format === 'decimal' ? 'active' : ''}`}
                            onClick={() => setFormat('decimal')}
                        >
                            {t('toolPages.ascii.decimal')}
                        </button>
                        <button
                            className={`option-btn ${format === 'hex' ? 'active' : ''}`}
                            onClick={() => setFormat('hex')}
                        >
                            {t('toolPages.ascii.hex')}
                        </button>
                        <button
                            className={`option-btn ${format === 'binary' ? 'active' : ''}`}
                            onClick={() => setFormat('binary')}
                        >
                            {t('toolPages.ascii.binary')}
                        </button>
                        <button
                            className={`option-btn ${format === 'octal' ? 'active' : ''}`}
                            onClick={() => setFormat('octal')}
                        >
                            {t('toolPages.ascii.octal')}
                        </button>
                    </div>
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
                                {mode === 'encode' ? t('toolPages.ascii.textInput') : t('toolPages.ascii.codeInput')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'encode' ? t('toolPages.ascii.textPlaceholder') : t('toolPages.ascii.codePlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encode' ? t('toolPages.ascii.codeOutput') : t('toolPages.ascii.textOutput')}
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
                            placeholder={t('toolPages.ascii.resultPlaceholder')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
