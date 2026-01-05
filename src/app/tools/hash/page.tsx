'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Hash } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import CryptoJS from 'crypto-js';

type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512';

export default function HashPage() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<Record<HashType, string>>({
        md5: '',
        sha1: '',
        sha256: '',
        sha512: '',
    });
    const [uppercase, setUppercase] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const calculateHashes = () => {
        const md5 = CryptoJS.MD5(input).toString();
        const sha1 = CryptoJS.SHA1(input).toString();
        const sha256 = CryptoJS.SHA256(input).toString();
        const sha512 = CryptoJS.SHA512(input).toString();

        const transform = (s: string) => (uppercase ? s.toUpperCase() : s);

        setResults({
            md5: transform(md5),
            sha1: transform(sha1),
            sha256: transform(sha256),
            sha512: transform(sha512),
        });
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    };

    const clearAll = () => {
        setInput('');
        setResults({ md5: '', sha1: '', sha256: '', sha512: '' });
    };

    const hashTypes: { id: HashType; name: string; bits: string }[] = [
        { id: 'md5', name: 'MD5', bits: '128位' },
        { id: 'sha1', name: 'SHA-1', bits: '160位' },
        { id: 'sha256', name: 'SHA-256', bits: '256位' },
        { id: 'sha512', name: 'SHA-512', bits: '512位' },
    ];

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">哈希计算</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <label className="input-label">待计算文本</label>
                        <textarea
                            className="editor-textarea"
                            style={{ minHeight: '150px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            placeholder="请输入要计算哈希值的文本..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="options-grid">
                        <button
                            className={`option-btn ${!uppercase ? 'active' : ''}`}
                            onClick={() => setUppercase(false)}
                        >
                            小写
                        </button>
                        <button
                            className={`option-btn ${uppercase ? 'active' : ''}`}
                            onClick={() => setUppercase(true)}
                        >
                            大写
                        </button>
                    </div>

                    <div className="action-row" style={{ marginBottom: '24px' }}>
                        <button className="action-btn primary" onClick={calculateHashes}>
                            <Hash size={18} />
                            计算哈希
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            清空
                        </button>
                    </div>

                    {results.md5 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {hashTypes.map((hash) => (
                                <div key={hash.id} className="input-group" style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="input-label" style={{ margin: 0 }}>
                                            {hash.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({hash.bits})</span>
                                        </label>
                                        <button className="editor-btn" onClick={() => copyToClipboard(results[hash.id])}>
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <div
                                        className="result-box"
                                        style={{
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {results[hash.id]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
