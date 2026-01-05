'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Hash } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import CryptoJS from 'crypto-js';

export default function Md5Page() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [uppercase, setUppercase] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const calculateMd5 = () => {
        const hash = CryptoJS.MD5(input).toString();
        setOutput(uppercase ? hash.toUpperCase() : hash);
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast('已复制到剪贴板');
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
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
                    <h1 className="tool-title">MD5 加密</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <label className="input-label">待加密文本</label>
                        <textarea
                            className="editor-textarea"
                            style={{ minHeight: '150px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            placeholder="请输入要计算MD5的文本..."
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

                    <div className="action-row" style={{ marginBottom: '20px' }}>
                        <button className="action-btn primary" onClick={calculateMd5}>
                            <Hash size={18} />
                            计算MD5
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            清空
                        </button>
                    </div>

                    {output && (
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="input-label" style={{ margin: 0 }}>MD5值 (32位)</label>
                                <button className="editor-btn" onClick={copyToClipboard}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                            <div className="result-box" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {output}
                            </div>
                            <div style={{ marginTop: '12px' }}>
                                <label className="input-label" style={{ marginBottom: '8px' }}>MD5值 (16位)</label>
                                <div className="result-box" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                    {output.substring(8, 24)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
