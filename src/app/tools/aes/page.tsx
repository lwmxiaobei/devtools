'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, RefreshCw, Lock, Unlock } from 'lucide-react';
import CryptoJS from 'crypto-js';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type AESMode = 'CBC' | 'ECB' | 'CTR' | 'CFB' | 'OFB';
type AESPadding = 'Pkcs7' | 'ZeroPadding' | 'NoPadding';
type OutputFormat = 'base64' | 'hex';

export default function AESPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [key, setKey] = useState('');
    const [iv, setIv] = useState('');
    const [aesMode, setAesMode] = useState<AESMode>('CBC');
    const [padding, setPadding] = useState<AESPadding>('Pkcs7');
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('base64');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const getModeConfig = (modeName: AESMode) => {
        const modes: Record<AESMode, typeof CryptoJS.mode.CBC> = {
            CBC: CryptoJS.mode.CBC,
            ECB: CryptoJS.mode.ECB,
            CTR: CryptoJS.mode.CTR,
            CFB: CryptoJS.mode.CFB,
            OFB: CryptoJS.mode.OFB,
        };
        return modes[modeName];
    };

    const getPaddingConfig = (paddingName: AESPadding) => {
        const paddings: Record<AESPadding, typeof CryptoJS.pad.Pkcs7> = {
            Pkcs7: CryptoJS.pad.Pkcs7,
            ZeroPadding: CryptoJS.pad.ZeroPadding,
            NoPadding: CryptoJS.pad.NoPadding,
        };
        return paddings[paddingName];
    };

    const generateRandomKey = () => {
        const randomBytes = CryptoJS.lib.WordArray.random(16);
        setKey(randomBytes.toString(CryptoJS.enc.Hex));
    };

    const generateRandomIV = () => {
        const randomBytes = CryptoJS.lib.WordArray.random(16);
        setIv(randomBytes.toString(CryptoJS.enc.Hex));
    };

    const encrypt = useCallback(() => {
        if (!input || !key) {
            setError(t('toolPages.aes.keyRequired'));
            setOutput('');
            return;
        }

        if (aesMode !== 'ECB' && !iv) {
            setError(t('toolPages.aes.ivRequired'));
            setOutput('');
            return;
        }

        try {
            const keyBytes = CryptoJS.enc.Utf8.parse(key.padEnd(16, '0').slice(0, 16));
            const ivBytes = CryptoJS.enc.Utf8.parse(iv.padEnd(16, '0').slice(0, 16));

            const encrypted = CryptoJS.AES.encrypt(input, keyBytes, {
                iv: ivBytes,
                mode: getModeConfig(aesMode),
                padding: getPaddingConfig(padding),
            });

            if (outputFormat === 'hex') {
                setOutput(encrypted.ciphertext.toString(CryptoJS.enc.Hex));
            } else {
                setOutput(encrypted.toString());
            }
            setError('');
        } catch (e) {
            setError(`${t('toolPages.aes.encryptError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, key, iv, aesMode, padding, outputFormat, language]);

    const decrypt = useCallback(() => {
        if (!input || !key) {
            setError(t('toolPages.aes.keyRequired'));
            setOutput('');
            return;
        }

        if (aesMode !== 'ECB' && !iv) {
            setError(t('toolPages.aes.ivRequired'));
            setOutput('');
            return;
        }

        try {
            const keyBytes = CryptoJS.enc.Utf8.parse(key.padEnd(16, '0').slice(0, 16));
            const ivBytes = CryptoJS.enc.Utf8.parse(iv.padEnd(16, '0').slice(0, 16));

            let cipherParams;
            if (outputFormat === 'hex') {
                const ciphertext = CryptoJS.enc.Hex.parse(input);
                cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
            } else {
                cipherParams = input;
            }

            const decrypted = CryptoJS.AES.decrypt(cipherParams, keyBytes, {
                iv: ivBytes,
                mode: getModeConfig(aesMode),
                padding: getPaddingConfig(padding),
            });

            const result = decrypted.toString(CryptoJS.enc.Utf8);
            if (!result) {
                throw new Error(t('toolPages.aes.decryptFailed'));
            }
            setOutput(result);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.aes.decryptError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, key, iv, aesMode, padding, outputFormat, language]);

    const handleProcess = () => {
        if (mode === 'encrypt') {
            encrypt();
        } else {
            decrypt();
        }
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
        setError('');
    };

    const needsIV = aesMode !== 'ECB';

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.aes.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '16px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${mode === 'encrypt' ? 'active' : ''}`}
                            onClick={() => setMode('encrypt')}
                        >
                            <Lock size={16} />
                            {t('toolPages.aes.encrypt')}
                        </button>
                        <button
                            className={`option-btn ${mode === 'decrypt' ? 'active' : ''}`}
                            onClick={() => setMode('decrypt')}
                        >
                            <Unlock size={16} />
                            {t('toolPages.aes.decrypt')}
                        </button>
                    </div>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px', 
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {t('toolPages.aes.mode')}
                        </label>
                        <select
                            value={aesMode}
                            onChange={(e) => setAesMode(e.target.value as AESMode)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <option value="CBC">CBC</option>
                            <option value="ECB">ECB</option>
                            <option value="CTR">CTR</option>
                            <option value="CFB">CFB</option>
                            <option value="OFB">OFB</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {t('toolPages.aes.padding')}
                        </label>
                        <select
                            value={padding}
                            onChange={(e) => setPadding(e.target.value as AESPadding)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <option value="Pkcs7">PKCS7</option>
                            <option value="ZeroPadding">Zero Padding</option>
                            <option value="NoPadding">No Padding</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {t('toolPages.aes.outputFormat')}
                        </label>
                        <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <option value="base64">Base64</option>
                            <option value="hex">Hex</option>
                        </select>
                    </div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: needsIV ? '1fr 1fr' : '1fr', 
                    gap: '16px', 
                    marginBottom: '16px' 
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {t('toolPages.aes.key')} (16 {t('toolPages.aes.chars')})
                            </label>
                            <button
                                onClick={generateRandomKey}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                }}
                            >
                                <RefreshCw size={12} />
                                {t('toolPages.aes.generate')}
                            </button>
                        </div>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder={t('toolPages.aes.keyPlaceholder')}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontFamily: 'monospace',
                            }}
                        />
                    </div>

                    {needsIV && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    IV (16 {t('toolPages.aes.chars')})
                                </label>
                                <button
                                    onClick={generateRandomIV}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        fontSize: '0.8rem',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <RefreshCw size={12} />
                                    {t('toolPages.aes.generate')}
                                </button>
                            </div>
                            <input
                                type="text"
                                value={iv}
                                onChange={(e) => setIv(e.target.value)}
                                placeholder={t('toolPages.aes.ivPlaceholder')}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'monospace',
                                }}
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.85rem',
                        marginBottom: '16px',
                    }}>
                        {error}
                    </div>
                )}

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encrypt' ? t('toolPages.aes.plaintext') : t('toolPages.aes.ciphertext')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'encrypt' ? t('toolPages.aes.plaintextPlaceholder') : t('toolPages.aes.ciphertextPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                        <button
                            className="action-btn primary"
                            onClick={handleProcess}
                            disabled={!input || !key || (needsIV && !iv)}
                            style={{ minWidth: '120px' }}
                        >
                            {mode === 'encrypt' ? (
                                <>
                                    <Lock size={18} />
                                    {t('toolPages.aes.encrypt')}
                                </>
                            ) : (
                                <>
                                    <Unlock size={18} />
                                    {t('toolPages.aes.decrypt')}
                                </>
                            )}
                        </button>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encrypt' ? t('toolPages.aes.ciphertext') : t('toolPages.aes.plaintext')}
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
                            placeholder={t('toolPages.aes.resultPlaceholder')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
