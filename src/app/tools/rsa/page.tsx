'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, RefreshCw, Lock, Unlock, Key } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type KeySize = 512 | 1024 | 2048 | 4096;

export default function RSAPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [publicKey, setPublicKey] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [keySize, setKeySize] = useState<KeySize>(2048);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const generateKeyPair = useCallback(async () => {
        setIsGenerating(true);
        setError('');
        
        try {
            const JSEncrypt = (await import('jsencrypt')).default;
            const crypt = new JSEncrypt({ default_key_size: keySize.toString() });
            
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    crypt.getKey();
                    resolve();
                }, 100);
            });
            
            const pubKey = crypt.getPublicKey();
            const privKey = crypt.getPrivateKey();
            
            setPublicKey(pubKey);
            setPrivateKey(privKey);
            showToast(t('toolPages.rsa.keyGenerated'));
        } catch (e) {
            setError(`${t('toolPages.rsa.generateError')}: ${(e as Error).message}`);
        } finally {
            setIsGenerating(false);
        }
    }, [keySize, language]);

    const encrypt = useCallback(async () => {
        if (!input) {
            setError(t('toolPages.rsa.inputRequired'));
            setOutput('');
            return;
        }

        if (!publicKey) {
            setError(t('toolPages.rsa.publicKeyRequired'));
            setOutput('');
            return;
        }

        try {
            const JSEncrypt = (await import('jsencrypt')).default;
            const crypt = new JSEncrypt();
            crypt.setPublicKey(publicKey);
            
            const encrypted = crypt.encrypt(input);
            if (!encrypted) {
                throw new Error(t('toolPages.rsa.encryptFailed'));
            }
            
            setOutput(encrypted);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.rsa.encryptError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, publicKey, language]);

    const decrypt = useCallback(async () => {
        if (!input) {
            setError(t('toolPages.rsa.inputRequired'));
            setOutput('');
            return;
        }

        if (!privateKey) {
            setError(t('toolPages.rsa.privateKeyRequired'));
            setOutput('');
            return;
        }

        try {
            const JSEncrypt = (await import('jsencrypt')).default;
            const crypt = new JSEncrypt();
            crypt.setPrivateKey(privateKey);
            
            const decrypted = crypt.decrypt(input);
            if (!decrypted) {
                throw new Error(t('toolPages.rsa.decryptFailed'));
            }
            
            setOutput(decrypted);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.rsa.decryptError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, privateKey, language]);

    useEffect(() => {
        if (mode === 'encrypt') {
            if (input && publicKey) {
                encrypt();
            } else {
                setOutput('');
                if (!input) setError('');
            }
        } else {
            if (input && privateKey) {
                decrypt();
            } else {
                setOutput('');
                if (!input) setError('');
            }
        }
    }, [input, mode, publicKey, privateKey]);

    const copyToClipboard = async (text: string, label: string) => {
        if (text) {
            await navigator.clipboard.writeText(text);
            showToast(`${label} ${t('toolPages.common.copied')}`);
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
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
                    <h1 className="tool-title">{t('toolPages.rsa.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '16px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${mode === 'encrypt' ? 'active' : ''}`}
                            onClick={() => setMode('encrypt')}
                        >
                            <Lock size={16} />
                            {t('toolPages.rsa.encrypt')}
                        </button>
                        <button
                            className={`option-btn ${mode === 'decrypt' ? 'active' : ''}`}
                            onClick={() => setMode('decrypt')}
                        >
                            <Unlock size={16} />
                            {t('toolPages.rsa.decrypt')}
                        </button>
                    </div>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                <div style={{ 
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {t('toolPages.rsa.keySize')}:
                            </label>
                            <select
                                value={keySize}
                                onChange={(e) => setKeySize(Number(e.target.value) as KeySize)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <option value={512}>512 bit</option>
                                <option value={1024}>1024 bit</option>
                                <option value={2048}>2048 bit</option>
                                <option value={4096}>4096 bit</option>
                            </select>
                        </div>
                        <button
                            className="action-btn primary"
                            onClick={generateKeyPair}
                            disabled={isGenerating}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {isGenerating ? (
                                <RefreshCw size={16} className="spin" />
                            ) : (
                                <Key size={16} />
                            )}
                            {isGenerating ? t('toolPages.rsa.generating') : t('toolPages.rsa.generateKeyPair')}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {t('toolPages.rsa.publicKey')}
                                </label>
                                <button
                                    onClick={() => copyToClipboard(publicKey, t('toolPages.rsa.publicKey'))}
                                    disabled={!publicKey}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        fontSize: '0.8rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--text-secondary)',
                                        cursor: publicKey ? 'pointer' : 'not-allowed',
                                        opacity: publicKey ? 1 : 0.5,
                                    }}
                                >
                                    <Copy size={12} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                            <textarea
                                value={publicKey}
                                onChange={(e) => setPublicKey(e.target.value)}
                                placeholder={t('toolPages.rsa.publicKeyPlaceholder')}
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '10px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {t('toolPages.rsa.privateKey')}
                                </label>
                                <button
                                    onClick={() => copyToClipboard(privateKey, t('toolPages.rsa.privateKey'))}
                                    disabled={!privateKey}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        fontSize: '0.8rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--text-secondary)',
                                        cursor: privateKey ? 'pointer' : 'not-allowed',
                                        opacity: privateKey ? 1 : 0.5,
                                    }}
                                >
                                    <Copy size={12} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                            <textarea
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                placeholder={t('toolPages.rsa.privateKeyPlaceholder')}
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '10px',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                    </div>
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
                                {mode === 'encrypt' ? t('toolPages.rsa.plaintext') : t('toolPages.rsa.ciphertext')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'encrypt' ? t('toolPages.rsa.plaintextPlaceholder') : t('toolPages.rsa.ciphertextPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'encrypt' ? t('toolPages.rsa.ciphertext') : t('toolPages.rsa.plaintext')}
                            </span>
                            <button className="editor-btn" onClick={() => copyToClipboard(output, '')} disabled={!output}>
                                <Copy size={14} />
                                {t('toolPages.common.copy')}
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            readOnly
                            value={output}
                            placeholder={t('toolPages.rsa.resultPlaceholder')}
                        />
                    </div>
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                }}>
                    <strong>{t('toolPages.rsa.note')}:</strong> {t('toolPages.rsa.noteContent')}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                :global(.spin) {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </>
    );
}
