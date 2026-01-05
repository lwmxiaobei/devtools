'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

type SortOrder = 'asc' | 'desc';

function sortObject(obj: unknown, order: SortOrder, recursive: boolean): unknown {
    if (Array.isArray(obj)) {
        return recursive ? obj.map(item => sortObject(item, order, recursive)) : obj;
    }
    if (obj !== null && typeof obj === 'object') {
        const sortedKeys = Object.keys(obj).sort((a, b) => {
            return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        });
        const sortedObj: Record<string, unknown> = {};
        for (const key of sortedKeys) {
            sortedObj[key] = recursive
                ? sortObject((obj as Record<string, unknown>)[key], order, recursive)
                : (obj as Record<string, unknown>)[key];
        }
        return sortedObj;
    }
    return obj;
}

export default function JsonSortPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [recursive, setRecursive] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const sorted = sortObject(parsed, sortOrder, recursive);
            setOutput(JSON.stringify(sorted, null, 2));
            setError('');
        } catch (e) {
            setError(`JSON格式错误: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, sortOrder, recursive]);

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
                    <h1 className="tool-title">JSON 排序</h1>
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
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder='请输入 JSON，例如：{"b": 2, "a": 1, "c": 3}'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">排序结果</span>
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
                            {error || output || '排序后的结果将显示在这里'}
                        </pre>
                    </div>
                </div>

                <div className="action-row">
                    <button
                        className={`action-btn ${sortOrder === 'asc' ? 'primary' : 'secondary'}`}
                        onClick={() => setSortOrder('asc')}
                    >
                        <ArrowUp size={18} />
                        升序 A-Z
                    </button>
                    <button
                        className={`action-btn ${sortOrder === 'desc' ? 'primary' : 'secondary'}`}
                        onClick={() => setSortOrder('desc')}
                    >
                        <ArrowDown size={18} />
                        降序 Z-A
                    </button>
                    <button
                        className={`action-btn ${recursive ? 'primary' : 'secondary'}`}
                        onClick={() => setRecursive(!recursive)}
                    >
                        <ArrowUpDown size={18} />
                        {recursive ? '递归排序已开启' : '递归排序已关闭'}
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
