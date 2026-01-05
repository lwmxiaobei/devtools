'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, ChevronDown, Trash2, Copy } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface TreeNodeProps {
    keyName: string | null;
    value: unknown;
    depth: number;
    expandedPaths: Set<string>;
    togglePath: (path: string) => void;
    path: string;
}

function TreeNode({ keyName, value, depth, expandedPaths, togglePath, path }: TreeNodeProps) {
    const isExpanded = expandedPaths.has(path);
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);

    const getValueDisplay = () => {
        if (value === null) return <span style={{ color: '#9ca3af' }}>null</span>;
        if (typeof value === 'boolean') return <span style={{ color: '#f59e0b' }}>{value.toString()}</span>;
        if (typeof value === 'number') return <span style={{ color: '#10b981' }}>{value}</span>;
        if (typeof value === 'string') return <span style={{ color: '#3b82f6' }}>&quot;{value}&quot;</span>;
        if (isArray) return <span style={{ color: 'var(--text-muted)' }}>Array[{value.length}]</span>;
        return <span style={{ color: 'var(--text-muted)' }}>Object{`{${Object.keys(value as object).length}}`}</span>;
    };

    return (
        <div style={{ marginLeft: depth * 16 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    cursor: isObject ? 'pointer' : 'default',
                }}
                onClick={() => isObject && togglePath(path)}
            >
                {isObject ? (
                    isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                    <span style={{ width: 14 }} />
                )}
                {keyName !== null && (
                    <span style={{ color: '#a78bfa', fontWeight: 500 }}>{keyName}: </span>
                )}
                {(!isObject || !isExpanded) && getValueDisplay()}
                {isObject && isExpanded && (
                    <span style={{ color: 'var(--text-muted)' }}>{isArray ? '[' : '{'}</span>
                )}
            </div>
            {isObject && isExpanded && (
                <>
                    {isArray
                        ? (value as unknown[]).map((item, index) => (
                            <TreeNode
                                key={index}
                                keyName={String(index)}
                                value={item}
                                depth={depth + 1}
                                expandedPaths={expandedPaths}
                                togglePath={togglePath}
                                path={`${path}[${index}]`}
                            />
                        ))
                        : Object.entries(value as object).map(([k, v]) => (
                            <TreeNode
                                key={k}
                                keyName={k}
                                value={v}
                                depth={depth + 1}
                                expandedPaths={expandedPaths}
                                togglePath={togglePath}
                                path={`${path}.${k}`}
                            />
                        ))}
                    <div style={{ marginLeft: (depth + 1) * 16, color: 'var(--text-muted)' }}>
                        {isArray ? ']' : '}'}
                    </div>
                </>
            )}
        </div>
    );
}

export default function JsonViewerPage() {
    const [input, setInput] = useState('');
    const [parsedData, setParsedData] = useState<unknown>(null);
    const [error, setError] = useState('');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']));
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input.trim()) {
            setParsedData(null);
            setError('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setParsedData(parsed);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
            setParsedData(null);
        }
    }, [input]);

    const togglePath = (path: string) => {
        const newPaths = new Set(expandedPaths);
        if (newPaths.has(path)) {
            newPaths.delete(path);
        } else {
            newPaths.add(path);
        }
        setExpandedPaths(newPaths);
    };

    const expandAll = () => {
        const paths = new Set<string>();
        const collect = (value: unknown, path: string) => {
            paths.add(path);
            if (Array.isArray(value)) {
                value.forEach((item, i) => collect(item, `${path}[${i}]`));
            } else if (value && typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => collect(v, `${path}.${k}`));
            }
        };
        if (parsedData) {
            collect(parsedData, '$');
            setExpandedPaths(paths);
        }
    };

    const collapseAll = () => {
        setExpandedPaths(new Set(['$']));
    };

    const copyToClipboard = async () => {
        if (parsedData) {
            await navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setParsedData(null);
        setError('');
        setExpandedPaths(new Set(['$']));
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
                    <h1 className="tool-title">{t('toolPages.jsonViewer.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonViewer.inputJson')}</span>
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
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonViewer.treeView')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={expandAll} disabled={!parsedData}>
                                    {t('toolPages.jsonViewer.expandAll')}
                                </button>
                                <button className="editor-btn" onClick={collapseAll} disabled={!parsedData}>
                                    {t('toolPages.jsonViewer.collapseAll')}
                                </button>
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!parsedData}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                minHeight: '400px',
                                padding: '16px',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                overflow: 'auto',
                                background: 'var(--bg-primary)',
                            }}
                        >
                            {error ? (
                                <span style={{ color: '#ef4444' }}>{error}</span>
                            ) : parsedData !== null ? (
                                <TreeNode
                                    keyName={null}
                                    value={parsedData}
                                    depth={0}
                                    expandedPaths={expandedPaths}
                                    togglePath={togglePath}
                                    path="$"
                                />
                            ) : (
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {t('toolPages.jsonFormatter.emptyResult')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
