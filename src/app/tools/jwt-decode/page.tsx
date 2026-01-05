'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return atob(base64);
}

interface DecodedJwt {
    header: {
        raw: string;
        decoded: unknown;
    };
    payload: {
        raw: string;
        decoded: unknown;
        claims: {
            name: string;
            value: string;
            description: string;
        }[];
    };
    signature: string;
    isValid: boolean;
}

const claimDescriptions: Record<string, string> = {
    iss: '签发者 (Issuer)',
    sub: '主题 (Subject)',
    aud: '受众 (Audience)',
    exp: '过期时间 (Expiration Time)',
    nbf: '生效时间 (Not Before)',
    iat: '签发时间 (Issued At)',
    jti: 'JWT ID',
    name: '名称',
    email: '邮箱',
    role: '角色',
    admin: '管理员',
};

function formatTimestamp(value: number): string {
    const date = new Date(value * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function decodeJwtDetailed(token: string): DecodedJwt | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }

    try {
        const headerRaw = base64UrlDecode(parts[0]);
        const payloadRaw = base64UrlDecode(parts[1]);
        const headerDecoded = JSON.parse(headerRaw);
        const payloadDecoded = JSON.parse(payloadRaw);

        const claims: { name: string; value: string; description: string }[] = [];
        for (const [key, value] of Object.entries(payloadDecoded)) {
            let displayValue = String(value);
            if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
                displayValue = `${value} (${formatTimestamp(value)})`;
            }
            claims.push({
                name: key,
                value: displayValue,
                description: claimDescriptions[key] || '自定义字段',
            });
        }

        // 检查是否过期
        let isValid = true;
        if (payloadDecoded.exp) {
            isValid = payloadDecoded.exp * 1000 > Date.now();
        }

        return {
            header: { raw: parts[0], decoded: headerDecoded },
            payload: { raw: parts[1], decoded: payloadDecoded, claims },
            signature: parts[2],
            isValid,
        };
    } catch {
        return null;
    }
}

export default function JwtDecodePage() {
    const [input, setInput] = useState('');
    const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!input.trim()) {
            setDecoded(null);
            setError('');
            return;
        }

        const result = decodeJwtDetailed(input.trim());
        if (result) {
            setDecoded(result);
            setError('');
        } else {
            setError('无效的 JWT Token 格式');
            setDecoded(null);
        }
    }, [input]);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    };

    const clearAll = () => {
        setInput('');
        setDecoded(null);
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
                    <h1 className="tool-title">JWT 解密 高精度版</h1>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}>
                        实时
                    </span>
                </div>

                <div className="editor-container" style={{ flexDirection: 'column' }}>
                    <div className="editor-panel" style={{ flex: 'none' }}>
                        <div className="editor-header">
                            <span className="editor-title">JWT Token</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder="请输入 JWT Token"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    {error ? (
                        <div style={{
                            padding: '16px',
                            color: '#ef4444',
                            textAlign: 'center',
                        }}>
                            {error}
                        </div>
                    ) : decoded ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
                            {/* Status */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                background: decoded.isValid ? '#dcfce7' : '#fef2f2',
                                borderRadius: '8px',
                                color: decoded.isValid ? '#16a34a' : '#dc2626',
                            }}>
                                <span style={{ fontWeight: 600 }}>
                                    {decoded.isValid ? '✓ Token 有效' : '✗ Token 已过期'}
                                </span>
                            </div>

                            {/* Header */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: '#fef2f2',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontWeight: 600, color: '#ef4444' }}>Header (头部)</span>
                                    <button className="editor-btn" onClick={() => copyToClipboard(JSON.stringify(decoded.header.decoded, null, 2))}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <pre style={{
                                    margin: 0,
                                    padding: '16px',
                                    fontSize: '0.85rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    overflow: 'auto',
                                }}>
                                    {JSON.stringify(decoded.header.decoded, null, 2)}
                                </pre>
                            </div>

                            {/* Payload */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: '#f3e8ff',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontWeight: 600, color: '#a855f7' }}>Payload (载荷)</span>
                                    <button className="editor-btn" onClick={() => copyToClipboard(JSON.stringify(decoded.payload.decoded, null, 2))}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>字段</th>
                                                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>值</th>
                                                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>说明</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {decoded.payload.claims.map((claim) => (
                                                <tr key={claim.name} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '8px', fontFamily: "'JetBrains Mono', monospace", color: '#a855f7' }}>
                                                        {claim.name}
                                                    </td>
                                                    <td style={{ padding: '8px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
                                                        {claim.value}
                                                    </td>
                                                    <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                                                        {claim.description}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Signature */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    background: '#dbeafe',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontWeight: 600, color: '#3b82f6' }}>Signature (签名)</span>
                                </div>
                                <pre style={{
                                    margin: 0,
                                    padding: '16px',
                                    fontSize: '0.85rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    wordBreak: 'break-all',
                                }}>
                                    {decoded.signature}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '32px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                        }}>
                            输入 JWT Token 后将显示详细解析结果
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
