'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

interface JsonSchema {
    $schema?: string;
    type: string;
    properties?: Record<string, JsonSchema>;
    items?: JsonSchema;
    required?: string[];
    description?: string;
}

function getSchemaType(value: unknown): JsonSchema {
    if (value === null) {
        return { type: 'null' };
    }
    if (typeof value === 'boolean') {
        return { type: 'boolean' };
    }
    if (typeof value === 'number') {
        return Number.isInteger(value)
            ? { type: 'integer' }
            : { type: 'number' };
    }
    if (typeof value === 'string') {
        // 检测常见格式
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return { type: 'string', description: 'date-time format' };
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return { type: 'string', description: 'date format' };
        }
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            return { type: 'string', description: 'email format' };
        }
        if (/^https?:\/\//.test(value)) {
            return { type: 'string', description: 'uri format' };
        }
        return { type: 'string' };
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return { type: 'array', items: { type: 'object' } };
        }
        return {
            type: 'array',
            items: getSchemaType(value[0]),
        };
    }
    if (typeof value === 'object') {
        const properties: Record<string, JsonSchema> = {};
        const required: string[] = [];

        for (const [key, val] of Object.entries(value)) {
            properties[key] = getSchemaType(val);
            if (val !== null && val !== undefined) {
                required.push(key);
            }
        }

        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
        };
    }
    return { type: 'object' };
}

function jsonToSchema(json: unknown): JsonSchema {
    const schema = getSchemaType(json);
    return {
        $schema: 'http://json-schema.org/draft-07/schema#',
        ...schema,
    };
}

export default function JsonToSchemaPage() {
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
            const parsed = JSON.parse(input);
            const schema = jsonToSchema(parsed);
            setOutput(JSON.stringify(schema, null, 2));
            setError('');
        } catch (e) {
            setError(`JSON 格式错误: ${(e as Error).message}`);
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

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">JSON 转 JSON Schema</h1>
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
                            placeholder={'请输入 JSON，例如：\n{\n  "name": "张三",\n  "age": 25,\n  "email": "test@example.com",\n  "tags": ["developer", "designer"]\n}'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">JSON Schema</span>
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
                            {error || output || 'JSON Schema 将显示在这里'}
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
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>关于 JSON Schema</h3>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <li>JSON Schema 是用于验证 JSON 数据结构的规范</li>
                        <li>自动检测字符串格式（日期、邮箱、URL等）</li>
                        <li>支持嵌套对象和数组</li>
                        <li>生成的 Schema 遵循 draft-07 规范</li>
                    </ul>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
