'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function Base64Page() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const encode = () => {
        try {
            const encoded = btoa(unescape(encodeURIComponent(input)));
            setOutput(encoded);
            setError('');
        } catch (e) {
            setError(`编码错误: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const decode = () => {
        try {
            const decoded = decodeURIComponent(escape(atob(input)));
            setOutput(decoded);
            setError('');
        } catch (e) {
            setError(`解码错误: 无效的Base64字符串`);
            setOutput('');
        }
    };

    const handleAction = () => {
        if (mode === 'encode') {
            encode();
        } else {
            decode();
        }
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
                    <h1 className="tool-title">Base64 编解码</h1>
                </div>

                <div className="single-panel">
                    <div className="options-grid">
                        <button
                            className={`option-btn ${mode === 'encode' ? 'active' : ''}`}
                            onClick={() => setMode('encode')}
                        >
                            编码
                        </button>
                        <button
                            className={`option-btn ${mode === 'decode' ? 'active' : ''}`}
                            onClick={() => setMode('decode')}
                        >
                            解码
                        </button>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            {mode === 'encode' ? '待编码文本' : '待解码的Base64'}
                        </label>
                        <textarea
                            className="editor-textarea"
                            style={{ minHeight: '150px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入Base64字符串...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="action-row" style={{ marginBottom: '20px' }}>
                        <button className="action-btn primary" onClick={handleAction}>
                            {mode === 'encode' ? '编码' : '解码'}
                        </button>
                        <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}>
                            <ArrowRightLeft size={18} />
                            交换
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            清空
                        </button>
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

                    {output && (
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="input-label" style={{ margin: 0 }}>结果</label>
                                <button className="editor-btn" onClick={copyToClipboard}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                            <div className="result-box">{output}</div>
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
