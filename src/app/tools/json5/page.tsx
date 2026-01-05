'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

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
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

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
            setError(`JSON5 ${t('toolPages.common.formatError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input]);

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
    };

    const loadExample = () => {
        setInput(`{
  // This is a comment
  name: 'JSON5 Example',
  version: 5,
  features: [
    'Unquoted keys',
    'Single quoted strings',
    'Trailing commas',
  ],
  /* Multi-line comments
     are also supported */
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
                    <h1 className="tool-title">{t('toolPages.json5.title')}</h1>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}>
                        {t('toolPages.common.realtime')}
                    </span>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.json5.inputJson5')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={loadExample}>
                                    Example
                                </button>
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={"Enter JSON5, supports:\n- Unquoted keys\n- Single quoted strings\n- Trailing commas\n- Comments"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.json5.parseResult')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
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
                            {error || output || t('toolPages.jsonFormatter.emptyResult')}
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
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>JSON5 Features</h3>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <li>Object keys can be unquoted if they are valid identifiers</li>
                        <li>Strings can use single quotes</li>
                        <li>Trailing commas are allowed</li>
                        <li>Single and multi-line comments are allowed</li>
                        <li>Hexadecimal numbers are allowed</li>
                    </ul>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
