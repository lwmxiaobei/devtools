'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

type BaseFormat = 'base32' | 'base58';

export default function Base32Page() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [format, setFormat] = useState<BaseFormat>('base32');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const base32Encode = (str: string): string => {
        const bytes = new TextEncoder().encode(str);
        let bits = '', result = '';
        for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
        while (bits.length % 5 !== 0) bits += '0';
        for (let i = 0; i < bits.length; i += 5) result += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
        while (result.length % 8 !== 0) result += '=';
        return result;
    };

    const base32Decode = (str: string): string => {
        const cleaned = str.replace(/=+$/, '').toUpperCase();
        let bits = '';
        for (const char of cleaned) {
            const idx = BASE32_ALPHABET.indexOf(char);
            if (idx === -1) throw new Error(`Invalid Base32 character: ${char}`);
            bits += idx.toString(2).padStart(5, '0');
        }
        const bytes: number[] = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
        return new TextDecoder().decode(new Uint8Array(bytes));
    };

    const base58Encode = (str: string): string => {
        const bytes = new TextEncoder().encode(str);
        let num = BigInt(0);
        for (const byte of bytes) num = num * BigInt(256) + BigInt(byte);
        let result = '';
        while (num > 0) { result = BASE58_ALPHABET[Number(num % BigInt(58))] + result; num = num / BigInt(58); }
        for (const byte of bytes) { if (byte === 0) result = '1' + result; else break; }
        return result || '1';
    };

    const base58Decode = (str: string): string => {
        let num = BigInt(0);
        for (const char of str) {
            const idx = BASE58_ALPHABET.indexOf(char);
            if (idx === -1) throw new Error(`Invalid Base58 character: ${char}`);
            num = num * BigInt(58) + BigInt(idx);
        }
        const bytes: number[] = [];
        while (num > 0) { bytes.unshift(Number(num % BigInt(256))); num = num / BigInt(256); }
        for (const char of str) { if (char === '1') bytes.unshift(0); else break; }
        return new TextDecoder().decode(new Uint8Array(bytes));
    };

    useEffect(() => {
        if (!input) { setOutput(''); setError(''); return; }
        try {
            let result: string;
            if (mode === 'encode') {
                result = format === 'base32' ? base32Encode(input) : base58Encode(input);
            } else {
                result = format === 'base32' ? base32Decode(input) : base58Decode(input);
            }
            setOutput(result); setError('');
        } catch (e) { setError(`${t('toolPages.common.error')}: ${(e as Error).message}`); setOutput(''); }
    }, [input, mode, format, language]);

    const copyToClipboard = async () => { if (output) { await navigator.clipboard.writeText(output); showToast(t('toolPages.common.copied')); } };
    const clearAll = () => { setInput(''); setOutput(''); setError(''); };
    const swapInputOutput = () => { setInput(output); setOutput(''); setMode(mode === 'encode' ? 'decode' : 'encode'); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.base32.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button className={`option-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => setMode('encode')}>{t('toolPages.common.encode')}</button>
                        <button className={`option-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => setMode('decode')}>{t('toolPages.common.decode')}</button>
                    </div>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button className={`option-btn ${format === 'base32' ? 'active' : ''}`} onClick={() => setFormat('base32')}>Base32</button>
                        <button className={`option-btn ${format === 'base58' ? 'active' : ''}`} onClick={() => setFormat('base58')}>Base58</button>
                    </div>
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}><ArrowRightLeft size={18} />{t('toolPages.common.swap')}</button>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                {error && <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</div>}
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header"><span className="editor-title">{mode === 'encode' ? t('toolPages.base32.textInput') : t('toolPages.base32.encodedInput')}</span></div>
                        <textarea className="editor-textarea" placeholder={mode === 'encode' ? t('toolPages.base32.textPlaceholder') : t('toolPages.base32.encodedPlaceholder')} value={input} onChange={(e) => setInput(e.target.value)} />
                    </div>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{mode === 'encode' ? t('toolPages.base32.encodedOutput') : t('toolPages.base32.textOutput')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}><Copy size={14} />{t('toolPages.common.copy')}</button>
                        </div>
                        <textarea className="editor-textarea" readOnly value={output} placeholder={t('toolPages.base32.resultPlaceholder')} />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
