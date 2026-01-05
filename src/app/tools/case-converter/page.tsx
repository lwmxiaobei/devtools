'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, RotateCw } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

type CaseType = 'camel' | 'snake' | 'pascal' | 'kebab' | 'upper' | 'lower' | 'constant';

export default function CaseConverterPage() {
    const [input, setInput] = useState('');
    const [outputs, setOutputs] = useState<Record<CaseType, string>>({
        camel: '',
        snake: '',
        pascal: '',
        kebab: '',
        upper: '',
        lower: '',
        constant: '',
    });
    const { toast, showToast, hideToast } = useToast();

    const splitWords = (str: string): string[] => {
        // 处理各种格式的输入
        return str
            .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser -> XML Parser
            .replace(/[-_]/g, ' ') // snake_case, kebab-case -> space
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
    };

    const toCamelCase = (words: string[]): string => {
        return words
            .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
            .join('');
    };

    const toSnakeCase = (words: string[]): string => {
        return words.join('_');
    };

    const toPascalCase = (words: string[]): string => {
        return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    };

    const toKebabCase = (words: string[]): string => {
        return words.join('-');
    };

    const toConstantCase = (words: string[]): string => {
        return words.join('_').toUpperCase();
    };

    const convert = () => {
        const words = splitWords(input);
        if (words.length === 0) {
            setOutputs({
                camel: '',
                snake: '',
                pascal: '',
                kebab: '',
                upper: '',
                lower: '',
                constant: '',
            });
            return;
        }

        setOutputs({
            camel: toCamelCase(words),
            snake: toSnakeCase(words),
            pascal: toPascalCase(words),
            kebab: toKebabCase(words),
            upper: input.toUpperCase(),
            lower: input.toLowerCase(),
            constant: toConstantCase(words),
        });
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    };

    const clearAll = () => {
        setInput('');
        setOutputs({
            camel: '',
            snake: '',
            pascal: '',
            kebab: '',
            upper: '',
            lower: '',
            constant: '',
        });
    };

    const caseTypes: { id: CaseType; name: string; example: string }[] = [
        { id: 'camel', name: '驼峰命名', example: 'helloWorld' },
        { id: 'pascal', name: '帕斯卡命名', example: 'HelloWorld' },
        { id: 'snake', name: '下划线命名', example: 'hello_world' },
        { id: 'kebab', name: '短横线命名', example: 'hello-world' },
        { id: 'constant', name: '常量命名', example: 'HELLO_WORLD' },
        { id: 'upper', name: '全大写', example: 'HELLO WORLD' },
        { id: 'lower', name: '全小写', example: 'hello world' },
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
                    <h1 className="tool-title">大小写转换</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <label className="input-label">输入文本</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="例如: hello_world, helloWorld, HelloWorld..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="action-row" style={{ marginBottom: '24px' }}>
                        <button className="action-btn primary" onClick={convert}>
                            <RotateCw size={18} />
                            转换
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            清空
                        </button>
                    </div>

                    {outputs.camel && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {caseTypes.map((caseType) => (
                                <div
                                    key={caseType.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '12px 16px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius)',
                                    }}
                                >
                                    <div style={{ width: '120px' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{caseType.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{caseType.example}</div>
                                    </div>
                                    <code
                                        style={{
                                            flex: 1,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {outputs[caseType.id]}
                                    </code>
                                    <button
                                        className="editor-btn"
                                        onClick={() => copyToClipboard(outputs[caseType.id])}
                                    >
                                        <Copy size={14} />
                                    </button>
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
