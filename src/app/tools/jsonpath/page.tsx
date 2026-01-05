'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Search, Play } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

// 简单的 JSONPath 实现
function evaluateJSONPath(obj: unknown, path: string): unknown[] {
    const results: unknown[] = [];

    if (!path.startsWith('$')) {
        throw new Error('JSONPath 必须以 $ 开头');
    }

    const tokens = path.slice(1).split(/\.|\[/).filter(Boolean).map(t => t.replace(/\]$/, ''));

    function traverse(current: unknown, tokenIndex: number): void {
        if (tokenIndex >= tokens.length) {
            results.push(current);
            return;
        }

        const token = tokens[tokenIndex];

        if (token === '*') {
            if (Array.isArray(current)) {
                current.forEach(item => traverse(item, tokenIndex + 1));
            } else if (current && typeof current === 'object') {
                Object.values(current as object).forEach(val => traverse(val, tokenIndex + 1));
            }
        } else if (/^\d+$/.test(token)) {
            if (Array.isArray(current)) {
                const index = parseInt(token, 10);
                if (index < current.length) {
                    traverse(current[index], tokenIndex + 1);
                }
            }
        } else {
            if (current && typeof current === 'object' && token in current) {
                traverse((current as Record<string, unknown>)[token], tokenIndex + 1);
            }
        }
    }

    traverse(obj, 0);
    return results;
}

export default function JsonPathPage() {
    const [jsonInput, setJsonInput] = useState('');
    const [pathInput, setPathInput] = useState('$');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const executeQuery = () => {
        if (!jsonInput.trim()) {
            setError(t('toolPages.jsonFormatter.inputPlaceholder'));
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(jsonInput);
            const results = evaluateJSONPath(parsed, pathInput);
            setOutput(JSON.stringify(results, null, 2));
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.invalidInput')}: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setJsonInput('');
        setPathInput('$');
        setOutput('');
        setError('');
    };

    const examples = [
        { path: '$.store.book[*].title', desc: 'Book Titles' },
        { path: '$.store.book[0]', desc: 'First Book' },
        { path: '$.*', desc: 'Root Properties' },
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
                    <h1 className="tool-title">{t('toolPages.jsonpath.title')}</h1>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: '8px',
                    }}>
                        <Search size={16} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {t('toolPages.jsonpath.jsonpathExpression')}：
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={pathInput}
                            onChange={(e) => setPathInput(e.target.value)}
                            placeholder="$.store.book[*].title"
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.9rem',
                                fontFamily: "'JetBrains Mono', monospace",
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                            }}
                        />
                        <button className="action-btn primary" onClick={executeQuery}>
                            <Play size={18} />
                            {t('toolPages.jsonpath.query')}
                        </button>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '8px',
                        flexWrap: 'wrap',
                    }}>
                        {examples.map((ex) => (
                            <button
                                key={ex.path}
                                onClick={() => setPathInput(ex.path)}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '0.75rem',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {ex.desc}: <code>{ex.path}</code>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonpath.inputJson')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonFormatter.inputPlaceholder')}
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonpath.queryResult')}</span>
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
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
