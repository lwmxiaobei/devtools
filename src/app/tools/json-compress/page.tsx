'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Minimize2, Maximize2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function JsonCompressPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const escapeJson = () => {
        try {
            // 先验证是否为有效JSON
            JSON.parse(input);
            // 转义：将JSON字符串转为转义后的字符串
            const escaped = JSON.stringify(input);
            setOutput(escaped);
            setError('');
        } catch {
            // 如果不是有效JSON，直接转义输入字符串
            const escaped = JSON.stringify(input);
            setOutput(escaped);
            setError('');
        }
    };

    const unescapeJson = () => {
        try {
            // 反转义：将转义后的字符串还原
            const unescaped = JSON.parse(input);
            if (typeof unescaped === 'string') {
                setOutput(unescaped);
            } else {
                setOutput(JSON.stringify(unescaped, null, 2));
            }
            setError('');
        } catch (e) {
            setError(`解析错误: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const compressJson = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError('');
        } catch (e) {
            setError(`JSON格式错误: ${(e as Error).message}`);
            setOutput('');
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

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">JSON 压缩转义</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输入</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder="请输入JSON或需要转义/反转义的字符串"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输出结果</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder="处理结果将显示在这里"
                            value={output}
                            readOnly
                        />
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
                    <button className="action-btn primary" onClick={compressJson}>
                        <Minimize2 size={18} />
                        压缩JSON
                    </button>
                    <button className="action-btn secondary" onClick={escapeJson}>
                        转义
                    </button>
                    <button className="action-btn secondary" onClick={unescapeJson}>
                        <Maximize2 size={18} />
                        反转义
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
