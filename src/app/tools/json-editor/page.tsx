'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Copy, Save } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface EditNodeProps {
    keyName: string;
    value: unknown;
    path: string;
    onUpdate: (path: string, key: string, value: unknown) => void;
    onDelete: (path: string, key: string) => void;
    onAdd: (path: string) => void;
    depth: number;
}

function EditNode({ keyName, value, path, onUpdate, onDelete, onAdd, depth }: EditNodeProps) {
    const [editingValue, setEditingValue] = useState(
        typeof value === 'object' ? '' : String(value)
    );
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);

    // Update editingValue when value prop changes from outside (e.g. initial load or parent update)
    useEffect(() => {
        setEditingValue(typeof value === 'object' ? '' : String(value));
    }, [value]);

    const handleValueChange = (newValue: string) => {
        setEditingValue(newValue);
        try {
            // Try parsing as JSON first (for numbers, booleans, null)
            const parsed = JSON.parse(newValue);
            onUpdate(path, keyName, parsed);
        } catch {
            // Keep as string if parsing fails, but check for specific keywords
            if (newValue === 'true') onUpdate(path, keyName, true);
            else if (newValue === 'false') onUpdate(path, keyName, false);
            else if (newValue === 'null') onUpdate(path, keyName, null);
            else if (!isNaN(Number(newValue)) && newValue.trim() !== '') onUpdate(path, keyName, Number(newValue));
            else onUpdate(path, keyName, newValue);
        }
    };

    return (
        <div style={{
            marginLeft: depth * 20,
            marginBottom: '4px',
            padding: '4px 0',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <span style={{
                    color: '#a78bfa',
                    fontWeight: 500,
                    minWidth: '80px',
                }}>
                    {keyName}:
                </span>
                {!isObject && !isArray ? (
                    <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => handleValueChange(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '4px 8px',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontFamily: "'JetBrains Mono', monospace",
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                        }}
                    />
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {isArray ? `Array[${(value as unknown[]).length}]` : `Object{${Object.keys(value as object).length}}`}
                    </span>
                )}
                <button
                    onClick={() => onDelete(path, keyName)}
                    style={{
                        padding: '4px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                    }}
                >
                    <Trash2 size={14} />
                </button>
                {(isObject || isArray) && (
                    <button
                        onClick={() => onAdd(`${path}.${keyName}`)}
                        style={{
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#10b981',
                        }}
                    >
                        <Plus size={14} />
                    </button>
                )}
            </div>
            {isObject && Object.entries(value as object).map(([k, v]) => (
                <EditNode
                    key={k}
                    keyName={k}
                    value={v}
                    path={`${path}.${keyName}`}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAdd={onAdd}
                    depth={depth + 1}
                />
            ))}
            {isArray && (value as unknown[]).map((item, index) => (
                <EditNode
                    key={index}
                    keyName={String(index)}
                    value={item}
                    path={`${path}.${keyName}`}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAdd={onAdd}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}

export default function JsonEditorPage() {
    const [input, setInput] = useState('');
    const [data, setData] = useState<Record<string, unknown> | null>(null);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input.trim()) {
            setData(null);
            setError('');
            return;
        }
        try {
            const parsed = JSON.parse(input);
            if (typeof parsed === 'object' && parsed !== null) {
                setData(parsed);
                setError('');
            } else {
                setError(t('toolPages.common.invalidInput'));
            }
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
        }
    }, [input]);

    const updateValue = (path: string, key: string, value: unknown) => {
        if (!data) return;
        const newData = JSON.parse(JSON.stringify(data));
        // Simple path traversal - assumes path is like $.key1.key2
        // Note: This basic implementation might fail for complex paths in this specific recursion structure
        // But for this simple editor it should suffice given the structure

        // Re-implementing a safer deep update
        const traverseAndUpdate = (current: any, targetPath: string[], targetKey: string, newValue: any) => {
            if (targetPath.length === 0) {
                current[targetKey] = newValue;
                return;
            }
            const nextKey = targetPath[0];
            traverseAndUpdate(current[nextKey], targetPath.slice(1), targetKey, newValue);
        };

        const pathParts = path.split('.').filter(Boolean).slice(1); // Remove '$' and initial empty
        // The path passed from EditNode is like $.keyName.childKey
        // But this structure in EditNode recursion passes path as `${path}.${keyName}`
        // So for root we get $.keyName.

        // Let's rely on the fact that we can just update the root data because input changes trigger setData
        // Wait, input changes trigger setData, but here we are updating data directly.
        // We need to sync back to input eventually or just update data.

        // Correct approach for this recursion:
        // We need to find the parent object of the key we want to update.
        // The path arguments in EditNode are constructed as parentPath.currentKey

        // Let's simplify: direct mutation of a clone is fine.
        let current: any = newData;
        for (const part of pathParts) {
            current = current[part];
        }
        current[key] = value;
        setData(newData);
    };

    const deleteKey = (path: string, key: string) => {
        if (!data) return;
        const newData = JSON.parse(JSON.stringify(data));
        const pathParts = path.split('.').filter(Boolean).slice(1);
        let current: any = newData;
        for (const part of pathParts) {
            current = current[part];
        }
        if (Array.isArray(current)) {
            current.splice(Number(key), 1);
        } else {
            delete current[key];
        }
        setData(newData);
    };

    const addKey = (path: string) => {
        if (!data) return;
        const newData = JSON.parse(JSON.stringify(data));
        const pathParts = path.split('.').filter(Boolean).slice(1);
        let current: any = newData;
        if (path !== '$') {
            for (const part of pathParts) {
                current = current[part];
            }
        }

        if (Array.isArray(current)) {
            current.push('');
        } else {
            const newKey = `newKey${Object.keys(current).length}`;
            current[newKey] = '';
        }
        setData(newData);
    };

    const copyToClipboard = async () => {
        if (data) {
            await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            showToast(t('toolPages.common.copied'));
        }
    };

    const applyChanges = () => {
        if (data) {
            setInput(JSON.stringify(data, null, 2));
            showToast(t('toolPages.common.saved'));
        }
    };

    const clearAll = () => {
        setInput('');
        setData(null);
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
                    <h1 className="tool-title">{t('toolPages.jsonEditor.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonEditor.inputJson')}</span>
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
                        {error && (
                            <div style={{
                                padding: '8px 16px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '0.85rem',
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonEditor.editJson')}</span>
                            <div className="editor-actions">
                                {data && (
                                    <button
                                        className="editor-btn"
                                        onClick={() => addKey('$')}
                                    >
                                        <Plus size={14} />
                                        {t('toolPages.jsonEditor.addField')}
                                    </button>
                                )}
                                <button className="editor-btn" onClick={applyChanges} disabled={!data}>
                                    <Save size={14} />
                                    {t('toolPages.common.convert')}
                                </button>
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!data}>
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
                                overflow: 'auto',
                                background: 'var(--bg-primary)',
                            }}
                        >
                            {data ? (
                                Object.entries(data).map(([key, value]) => (
                                    <EditNode
                                        key={key}
                                        keyName={key}
                                        value={value}
                                        path="$"
                                        onUpdate={updateValue}
                                        onDelete={deleteKey}
                                        onAdd={addKey}
                                        depth={0}
                                    />
                                ))
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
