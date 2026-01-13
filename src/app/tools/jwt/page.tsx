'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Lock, Unlock } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function base64UrlEncode(str: string): string {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return atob(base64);
}

interface JwtParts {
    header: string;
    payload: string;
    signature: string;
}

function decodeJwt(token: string): JwtParts | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }
    try {
        return {
            header: JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2),
            payload: JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2),
            signature: parts[2],
        };
    } catch {
        return null;
    }
}

function encodeJwt(header: string, payload: string, secret: string): string {
    try {
        const headerObj = JSON.parse(header);
        const payloadObj = JSON.parse(payload);
        const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
        const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
        // 简单签名（实际应用中应使用真正的 HMAC）
        const signature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${secret}`);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch {
        return '';
    }
}

export default function JwtPage() {
    const [mode, setMode] = useState<'decode' | 'encode'>('decode');
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "User",\n  "iat": 1516239022\n}');
    const [secret, setSecret] = useState('your-secret-key');
    const [decodedParts, setDecodedParts] = useState<JwtParts | null>(null);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const handleDecode = () => {
        if (!token.trim()) {
            setError(t('toolPages.jwt.inputToken'));
            return;
        }
        const parts = decodeJwt(token);
        if (parts) {
            setDecodedParts(parts);
            setError('');
        } else {
            setError(t('toolPages.jwt.invalidToken'));
            setDecodedParts(null);
        }
    };

    const handleEncode = () => {
        const result = encodeJwt(header, payload, secret);
        if (result) {
            setToken(result);
            setError('');
            showToast(t('toolPages.jwt.generated'));
        } else {
            setError(t('toolPages.jwt.formatError'));
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setToken('');
        setDecodedParts(null);
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
                    <h1 className="tool-title">{t('toolPages.jwt.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '16px' }}>
                    <button
                        className={`action-btn ${mode === 'decode' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('decode')}
                    >
                        <Unlock size={18} />
                        {t('toolPages.jwt.decode')}
                    </button>
                    <button
                        className={`action-btn ${mode === 'encode' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('encode')}
                    >
                        <Lock size={18} />
                        {t('toolPages.jwt.generate')}
                    </button>
                </div>

                {mode === 'decode' ? (
                    <div className="editor-container">
                        <div className="editor-panel">
                            <div className="editor-header">
                                <span className="editor-title">JWT Token</span>
                                <div className="editor-actions">
                                    <button className="editor-btn" onClick={clearAll}>
                                        <Trash2 size={14} />
                                        {t('toolPages.common.clear')}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="editor-textarea"
                                placeholder={t('toolPages.jwt.inputToken')}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                            <div style={{ padding: '16px' }}>
                                <button className="action-btn primary" onClick={handleDecode}>
                                    {t('toolPages.jwt.decodeToken')}
                                </button>
                            </div>
                        </div>

                        <div className="editor-panel">
                            <div className="editor-header">
                                <span className="editor-title">{t('toolPages.jwt.decodeResult')}</span>
                            </div>
                            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                                {error ? (
                                    <div style={{ color: '#ef4444' }}>{error}</div>
                                ) : decodedParts ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px',
                                            }}>
                                                <span style={{ fontWeight: 600, color: '#ef4444' }}>Header</span>
                                                <button className="editor-btn" onClick={() => copyToClipboard(decodedParts.header)}>
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <pre style={{
                                                margin: 0,
                                                padding: '12px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}>
                                                {decodedParts.header}
                                            </pre>
                                        </div>
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px',
                                            }}>
                                                <span style={{ fontWeight: 600, color: '#a855f7' }}>Payload</span>
                                                <button className="editor-btn" onClick={() => copyToClipboard(decodedParts.payload)}>
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <pre style={{
                                                margin: 0,
                                                padding: '12px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontFamily: "'JetBrains Mono', monospace",
                                            }}>
                                                {decodedParts.payload}
                                            </pre>
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 600, color: '#3b82f6' }}>Signature</span>
                                            <pre style={{
                                                margin: '8px 0 0',
                                                padding: '12px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontFamily: "'JetBrains Mono', monospace",
                                                wordBreak: 'break-all',
                                            }}>
                                                {decodedParts.signature}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {t('toolPages.jsonFormatter.emptyResult')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="editor-container">
                        <div className="editor-panel">
                            <div className="editor-header">
                                <span className="editor-title">Header</span>
                            </div>
                            <textarea
                                className="editor-textarea"
                                value={header}
                                onChange={(e) => setHeader(e.target.value)}
                                style={{ flex: 0.5, minHeight: '120px' }}
                            />
                            <div className="editor-header">
                                <span className="editor-title">Payload</span>
                            </div>
                            <textarea
                                className="editor-textarea"
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <div style={{ padding: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
                                    {t('toolPages.jwt.secret')}
                                </label>
                                <input
                                    type="text"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        background: 'var(--bg-primary)',
                                    }}
                                />
                            </div>
                            <div style={{ padding: '0 16px 16px' }}>
                                <button className="action-btn primary" onClick={handleEncode}>
                                    {t('toolPages.jwt.confirmGenerate')}
                                </button>
                            </div>
                        </div>

                        <div className="editor-panel">
                            <div className="editor-header">
                                <span className="editor-title">{t('toolPages.jwt.generatedToken')}</span>
                                <div className="editor-actions">
                                    <button className="editor-btn" onClick={() => copyToClipboard(token)} disabled={!token}>
                                        <Copy size={14} />
                                        {t('toolPages.common.copy')}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="editor-textarea"
                                value={token}
                                readOnly
                                placeholder={t('toolPages.jwt.generatedDisplay')}
                            />
                            {error && (
                                <div style={{
                                    padding: '8px 16px',
                                    color: '#ef4444',
                                    fontSize: '0.85rem',
                                }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
