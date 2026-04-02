'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Wand2, Minimize2, Hash, ChevronsUpDown, ChevronRight, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

// 收集所有可折叠路径
function collectPaths(value: unknown, path: string, paths: Set<string>) {
    if (value !== null && typeof value === 'object') {
        paths.add(path);
        if (Array.isArray(value)) {
            value.forEach((item, index) => collectPaths(item, `${path}[${index}]`, paths));
        } else {
            Object.entries(value as Record<string, unknown>).forEach(([k, v]) => collectPaths(v, `${path}.${k}`, paths));
        }
    }
}

// 计算一个值格式化后占的行数
function countLines(value: unknown, indent: number): number {
    if (value === null || typeof value !== 'object') return 1;
    if (Array.isArray(value)) {
        if (value.length === 0) return 1;
        let lines = 2; // [ and ]
        value.forEach(item => { lines += countLines(item, indent + 1); });
        return lines;
    }
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return 1;
    let lines = 2; // { and }
    entries.forEach(([, v]) => { lines += countLines(v, indent + 1); });
    return lines;
}

interface CollapsibleJsonProps {
    value: unknown;
    keyName?: string | null;
    depth: number;
    collapsedPaths: Set<string>;
    togglePath: (path: string) => void;
    path: string;
    isLast: boolean;
}

function CollapsibleJson({ value, keyName, depth, collapsedPaths, togglePath, path, isLast }: CollapsibleJsonProps) {
    const indent = '  '.repeat(depth);
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const isCollapsed = collapsedPaths.has(path);
    const comma = isLast ? '' : ',';
    const prefix = keyName != null ? `${indent}"${keyName}": ` : indent;

    // 基本值
    if (!isObject) {
        let display: string;
        if (typeof value === 'string') display = `"${value}"`;
        else if (value === null) display = 'null';
        else display = String(value);
        return <div>{prefix}{display}{comma}</div>;
    }

    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';
    const entries = isArray ? value : Object.entries(value as Record<string, unknown>);
    const count = isArray ? value.length : (entries as [string, unknown][]).length;

    // 空对象/数组
    if (count === 0) {
        return <div>{prefix}{openBracket}{closeBracket}{comma}</div>;
    }

    // 折叠状态
    if (isCollapsed) {
        const summary = isArray ? `${count} items` : `${count} keys`;
        return (
            <div style={{ position: 'relative' }}>
                <span
                    onClick={() => togglePath(path)}
                    style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                    }}
                >
                    <ChevronRight size={12} style={{ marginRight: '2px', flexShrink: 0, color: 'var(--text-muted)' }} />
                    {prefix}{openBracket}
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}> {summary} </span>
                    {closeBracket}{comma}
                </span>
            </div>
        );
    }

    // 展开状态
    return (
        <>
            <div style={{ position: 'relative' }}>
                <span
                    onClick={() => togglePath(path)}
                    style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                    }}
                >
                    <ChevronDown size={12} style={{ marginRight: '2px', flexShrink: 0, color: 'var(--text-muted)' }} />
                    {prefix}{openBracket}
                </span>
            </div>
            {isArray
                ? (value as unknown[]).map((item, index) => (
                    <CollapsibleJson
                        key={index}
                        value={item}
                        depth={depth + 1}
                        collapsedPaths={collapsedPaths}
                        togglePath={togglePath}
                        path={`${path}[${index}]`}
                        isLast={index === value.length - 1}
                    />
                ))
                : (entries as [string, unknown][]).map(([k, v], index) => (
                    <CollapsibleJson
                        key={k}
                        value={v}
                        keyName={k}
                        depth={depth + 1}
                        collapsedPaths={collapsedPaths}
                        togglePath={togglePath}
                        path={`${path}.${k}`}
                        isLast={index === (entries as [string, unknown][]).length - 1}
                    />
                ))
            }
            <div>{indent}{closeBracket}{comma}</div>
        </>
    );
}

// 计算可见行数（考虑折叠）
function countVisibleLines(value: unknown, collapsedPaths: Set<string>, path: string): number {
    if (value === null || typeof value !== 'object') return 1;
    const isArray = Array.isArray(value);
    const entries = isArray ? value : Object.entries(value as Record<string, unknown>);
    const count = isArray ? value.length : (entries as [string, unknown][]).length;

    if (count === 0) return 1;
    if (collapsedPaths.has(path)) return 1;

    let lines = 2; // open + close brackets
    if (isArray) {
        (value as unknown[]).forEach((item, index) => {
            lines += countVisibleLines(item, collapsedPaths, `${path}[${index}]`);
        });
    } else {
        (entries as [string, unknown][]).forEach(([k, v]) => {
            lines += countVisibleLines(v, collapsedPaths, `${path}.${k}`);
        });
    }
    return lines;
}

export default function JsonFormatterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [parsedData, setParsedData] = useState<unknown>(null);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'format' | 'compress'>('format');
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();
    const outputWrapperRef = useRef<HTMLDivElement>(null);

    const t = (key: string) => getTranslation(language, key);

    // 实时格式化
    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setParsedData(null);
            setError('');
            setCollapsedPaths(new Set());
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setParsedData(parsed);
            if (mode === 'format') {
                setOutput(JSON.stringify(parsed, null, 2));
            } else {
                setOutput(JSON.stringify(parsed));
            }
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
            setOutput('');
            setParsedData(null);
        }
    }, [input, mode]);

    const togglePath = useCallback((path: string) => {
        setCollapsedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        setCollapsedPaths(new Set());
    }, []);

    const collapseAll = useCallback(() => {
        if (parsedData === null || typeof parsedData !== 'object') return;
        const paths = new Set<string>();
        collectPaths(parsedData, '$', paths);
        setCollapsedPaths(paths);
    }, [parsedData]);

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setParsedData(null);
        setError('');
        setCollapsedPaths(new Set());
    };

    const visibleLineCount = parsedData !== null && typeof parsedData === 'object' && mode === 'format'
        ? countVisibleLines(parsedData, collapsedPaths, '$')
        : output ? output.split('\n').length : 0;

    const useCollapsible = mode === 'format' && parsedData !== null && typeof parsedData === 'object';

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.jsonFormatter.title')}</h1>
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
                            <span className="editor-title">{t('toolPages.jsonFormatter.inputJson')}</span>
                            <div className="editor-actions">
                                <button
                                    className={`editor-btn ${showLineNumbers ? 'active' : ''}`}
                                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                                    title={showLineNumbers ? t('toolPages.common.hideLineNumbers') : t('toolPages.common.showLineNumbers')}
                                    style={showLineNumbers ? {
                                        background: 'var(--primary-light)',
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    } : {}}
                                >
                                    <Hash size={14} />
                                    {t('toolPages.common.lineNumbers')}
                                </button>
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
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
                                placeholder={t('toolPages.jsonFormatter.inputPlaceholder')}
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
                            <span className="editor-title">{t('toolPages.jsonFormatter.outputResult')}</span>
                            <div className="editor-actions">
                                {useCollapsible && (
                                    <>
                                        <button
                                            className="editor-btn"
                                            onClick={expandAll}
                                            title={t('toolPages.jsonFormatter.expandAll')}
                                        >
                                            <ChevronsUpDown size={14} />
                                            {t('toolPages.jsonFormatter.expandAll')}
                                        </button>
                                        <button
                                            className="editor-btn"
                                            onClick={collapseAll}
                                            title={t('toolPages.jsonFormatter.collapseAll')}
                                        >
                                            <ChevronsUpDown size={14} style={{ transform: 'rotate(90deg)' }} />
                                            {t('toolPages.jsonFormatter.collapseAll')}
                                        </button>
                                    </>
                                )}
                                <button
                                    className={`editor-btn ${showLineNumbers ? 'active' : ''}`}
                                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                                    title={showLineNumbers ? t('toolPages.common.hideLineNumbers') : t('toolPages.common.showLineNumbers')}
                                    style={showLineNumbers ? {
                                        background: 'var(--primary-light)',
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    } : {}}
                                >
                                    <Hash size={14} />
                                    {t('toolPages.common.lineNumbers')}
                                </button>
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <div
                            ref={outputWrapperRef}
                            className="editor-output-wrapper"
                            style={{
                                flex: 1,
                                minHeight: '400px',
                                display: 'flex',
                                overflow: 'auto',
                                background: 'var(--bg-primary)',
                            }}
                        >
                            {showLineNumbers && (output || useCollapsible) && (
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
                                    {Array.from({ length: visibleLineCount }, (_, index) => (
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
                                {useCollapsible ? (
                                    <CollapsibleJson
                                        value={parsedData}
                                        depth={0}
                                        collapsedPaths={collapsedPaths}
                                        togglePath={togglePath}
                                        path="$"
                                        isLast={true}
                                    />
                                ) : (
                                    output || <span style={{ color: 'var(--text-muted)' }}>{t('toolPages.jsonFormatter.emptyResult')}</span>
                                )}
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
                        {t('toolPages.jsonFormatter.format')}
                    </button>
                    <button
                        className={`action-btn ${mode === 'compress' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('compress')}
                    >
                        <Minimize2 size={18} />
                        {t('toolPages.jsonFormatter.compress')}
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
