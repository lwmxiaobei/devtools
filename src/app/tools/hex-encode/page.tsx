'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type HexFormat = 'plain' | 'spaced' | 'prefixed';

export default function HexEncodePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [format, setFormat] = useState<HexFormat>('plain');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // 文本转 Hex
    const textToHex = (text: string, fmt: HexFormat): string => {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);
        const hexArray = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
        
        switch (fmt) {
            case 'spaced':
                return hexArray.join(' ');
            case 'prefixed':
                return hexArray.map(h => '0x' + h).join(' ');
            default:
                return hexArray.join('');
        }
    };

    // Hex 转文本
    const hexToText = (hex: string): string => {
        // 清理输入：移除 0x 前缀、空格、换行等
        const cleanHex = hex
            .replace(/0x/gi, '')
            .replace(/[\s\n\r,;]/g, '')
            .toLowerCase();
        
        // 验证是否为有效的十六进制字符串
        if (!/^[0-9a-f]*$/.test(cleanHex)) {
            throw new Error(t('toolPages.hexEncode.invalidHex'));
        }
        
        if (cleanHex.length % 2 !== 0) {
            throw new Error(t('toolPages.hexEncode.oddLength'));
        }
        
        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
        }
        
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    };

    // 实时编解码
    useEffect(() => {
        if (!input) {
            setOutput('');
            setError('');
            return;
        }

        try {
            if (mode === 'encode') {
                const result = textToHex(input, format);
                setOutput(result);
                setError('');
            } else {
                const result = hexToText(input);
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
                    <h1 className="tool-title">{t('toolPages.hexEncode.title')}</h1>
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
                            {t('toolPages.hexEncode.outputFormat')}:
                        </span>
                        <div className="options-grid" style={{ margin: 0 }}>
                            <button
                                className={`option-btn ${format === 'plain' ? 'active' : ''}`}
                                onClick={() => setFormat('plain')}
                            >
                                {t('toolPages.hexEncode.formatPlain')}
                            </button>
                            <button
                                className={`option-btn ${format === 'spaced' ? 'active' : ''}`}
                                onClick={() => setFormat('spaced')}
                            >
                                {t('toolPages.hexEncode.formatSpaced')}
                            </button>
                            <button
                                className={`option-btn ${format === 'prefixed' ? 'active' : ''}`}
                                onClick={() => setFormat('prefixed')}
                            >
                                {t('toolPages.hexEncode.formatPrefixed')}
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
                                {mode === 'encode' ? t('toolPages.hexEncode.textToEncode') : t('toolPages.hexEncode.hexToDecode')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'encode' ? t('toolPages.hexEncode.inputPlaceholder') : t('toolPages.hexEncode.hexPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encode' ? t('toolPages.hexEncode.encodedHex') : t('toolPages.hexEncode.decodedText')}
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
                            placeholder={t('toolPages.hexEncode.resultPlaceholder')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
