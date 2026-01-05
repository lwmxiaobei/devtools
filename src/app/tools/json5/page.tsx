'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

// 简单的 JSON5 解析器
function parseJSON5(text: string): unknown {
    // 移除单行注释
    let cleaned = text.replace(/\/\/[^\n]*/g, '');
    // 移除多行注释
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    // 处理尾随逗号
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    // 处理未加引号的键名
    cleaned = cleaned.replace(/(\{|\,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    // 处理单引号字符串
    cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    // 处理十六进制数字
    cleaned = cleaned.replace(/:\s*0x([0-9a-fA-F]+)/g, (_, hex) => ': ' + parseInt(hex, 16));
    // 处理 Infinity 和 NaN
    cleaned = cleaned.replace(/:\s*Infinity\b/g, ': "Infinity"');
    cleaned = cleaned.replace(/:\s*-Infinity\b/g, ': "-Infinity"');
    cleaned = cleaned.replace(/:\s*NaN\b/g, ': "NaN"');

    return JSON.parse(cleaned);
}

export default function Json5Page() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }

        try {
            const parsed = parseJSON5(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError('');
        } catch (e) {
            setError(`JSON5 解析错误: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input]);

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

    const loadExample = () => {
        setInput(`{
  // 这是注释
  name: 'JSON5 示例',
  version: 5,
  features: [
    '无引号键名',
    '单引号字符串',
    '尾随逗号',
  ],
  /* 多行注释
     也支持 */
  hex: 0xFF,
}`);
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
                    <h1 className="tool-title">JSON5 解析</h1>
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
                            <span className="editor-title">输入 JSON5</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={loadExample}>
                                    示例
                                </button>
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={"请输入 JSON5，支持：\n- 无引号键名\n- 单引号字符串\n- 尾随逗号\n- 注释"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">标准 JSON 输出</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                        </div>
                        <pre
                            className="editor-textarea"
                            style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                color: error ? '#ef4444' : 'inherit',
                            }}
                        >
                            {error || output || '转换为标准 JSON 后将显示在这里'}
                        </pre>
                    </div>
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>JSON5 特性</h3>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <li>对象键名可以不加引号（如果是合法标识符）</li>
                        <li>字符串可以使用单引号</li>
                        <li>允许尾随逗号</li>
                        <li>支持单行和多行注释</li>
                        <li>支持十六进制数字</li>
                    </ul>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
