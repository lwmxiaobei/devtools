'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Wand2, Minimize2, Hash } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function JsonFormatterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'format' | 'compress'>('format');
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    // 实时格式化
    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            if (mode === 'format') {
                setOutput(JSON.stringify(parsed, null, 2));
            } else {
                setOutput(JSON.stringify(parsed));
            }
            setError('');
        } catch (e) {
            setError(`JSON格式错误: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, mode]);

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

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">JSON 格式化</h1>
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

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输入 JSON</span>
                            <div className="editor-actions">
                                <button
                                    className={`editor-btn ${showLineNumbers ? 'active' : ''}`}
                                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                                    title={showLineNumbers ? '隐藏行号' : '显示行号'}
                                    style={showLineNumbers ? {
                                        background: 'var(--primary-light)',
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    } : {}}
                                >
                                    <Hash size={14} />
                                    行号
                                </button>
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <div
                            className="editor-input-wrapper"
                            style={{
                                flex: 1,
                                minHeight: '400px',
                                display: 'flex',
                                overflow: 'hidden',
                                background: 'var(--bg-primary)',
                            }}
                        >
                            {showLineNumbers && (
                                <div
                                    className="line-numbers-input"
                                    style={{
                                        padding: '16px 0',
                                        paddingRight: '12px',
                                        paddingLeft: '12px',
                                        background: 'var(--bg-tertiary)',
                                        borderRight: '1px solid var(--border)',
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        color: 'var(--text-muted)',
                                        textAlign: 'right',
                                        userSelect: 'none',
                                        flexShrink: 0,
                                        overflowY: 'hidden',
                                    }}
                                    id="input-line-numbers"
                                >
                                    {(input || ' ').split('\n').map((_, index) => (
                                        <div key={index}>{index + 1}</div>
                                    ))}
                                </div>
                            )}
                            <textarea
                                className="editor-textarea"
                                placeholder='请输入 JSON，例如：{"name": "张三", "age": 25}'
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onScroll={(e) => {
                                    const lineNumbers = document.getElementById('input-line-numbers');
                                    if (lineNumbers) {
                                        lineNumbers.scrollTop = e.currentTarget.scrollTop;
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    minHeight: 'unset',
                                    resize: 'none',
                                }}
                            />
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输出结果</span>
                            <div className="editor-actions">
                                <button
                                    className={`editor-btn ${showLineNumbers ? 'active' : ''}`}
                                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                                    title={showLineNumbers ? '隐藏行号' : '显示行号'}
                                    style={showLineNumbers ? {
                                        background: 'var(--primary-light)',
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    } : {}}
                                >
                                    <Hash size={14} />
                                    行号
                                </button>
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                        </div>
                        <div
                            className="editor-output-wrapper"
                            style={{
                                flex: 1,
                                minHeight: '400px',
                                display: 'flex',
                                overflow: 'auto',
                                background: 'var(--bg-primary)',
                            }}
                        >
                            {showLineNumbers && output && (
                                <div
                                    className="line-numbers"
                                    style={{
                                        padding: '16px 0',
                                        paddingRight: '12px',
                                        paddingLeft: '12px',
                                        background: 'var(--bg-tertiary)',
                                        borderRight: '1px solid var(--border)',
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        color: 'var(--text-muted)',
                                        textAlign: 'right',
                                        userSelect: 'none',
                                        flexShrink: 0,
                                    }}
                                >
                                    {output.split('\n').map((_, index) => (
                                        <div key={index}>{index + 1}</div>
                                    ))}
                                </div>
                            )}
                            <pre
                                style={{
                                    flex: 1,
                                    margin: 0,
                                    padding: '16px',
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    color: error ? '#ef4444' : 'var(--text-primary)',
                                    whiteSpace: 'pre',
                                    overflow: 'visible',
                                    background: 'transparent',
                                }}
                            >
                                {output || <span style={{ color: 'var(--text-muted)' }}>格式化或压缩后的结果将显示在这里</span>}
                            </pre>
                        </div>
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                borderTop: '1px solid var(--border)',
                                fontSize: '0.85rem',
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-row">
                    <button
                        className={`action-btn ${mode === 'format' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('format')}
                    >
                        <Wand2 size={18} />
                        格式化
                    </button>
                    <button
                        className={`action-btn ${mode === 'compress' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('compress')}
                    >
                        <Minimize2 size={18} />
                        压缩
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
