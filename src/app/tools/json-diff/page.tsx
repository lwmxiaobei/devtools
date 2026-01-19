'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, GitCompare, Check, X, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface DiffResult {
    path: string;
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    oldValue?: unknown;
    newValue?: unknown;
    children?: DiffResult[];
}

function deepEqual(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1 as Record<string, unknown>);
        const keys2 = Object.keys(obj2 as Record<string, unknown>);
        
        if (keys1.length !== keys2.length) return false;
        if (!keys1.every(key => keys2.includes(key))) return false;
        
        return keys1.every(key => deepEqual(
            (obj1 as Record<string, unknown>)[key],
            (obj2 as Record<string, unknown>)[key]
        ));
    }
    
    return obj1 === obj2;
}

function compareJson(obj1: unknown, obj2: unknown, path = '$'): DiffResult[] {
    const results: DiffResult[] = [];
    
    // 处理null情况
    if (obj1 == null && obj2 == null) {
        return results;
    }
    
    if (obj1 == null) {
        // obj2存在，obj1不存在 -> 新增
        if (Array.isArray(obj2)) {
            results.push({
                path: path,
                type: 'added',
                newValue: obj2
            });
        } else if (typeof obj2 === 'object' && obj2 !== null) {
            const obj2Record = obj2 as Record<string, unknown>;
            for (const key of Object.keys(obj2Record)) {
                results.push({
                    path: `${path}${path === '$' ? '' : '.'}${key}`,
                    type: 'added',
                    newValue: obj2Record[key]
                });
            }
        } else {
            results.push({
                path: path,
                type: 'added',
                newValue: obj2
            });
        }
        return results;
    }
    
    if (obj2 == null) {
        // obj1存在，obj2不存在 -> 删除
        if (Array.isArray(obj1)) {
            results.push({
                path: path,
                type: 'removed',
                oldValue: obj1
            });
        } else if (typeof obj1 === 'object' && obj1 !== null) {
            const obj1Record = obj1 as Record<string, unknown>;
            for (const key of Object.keys(obj1Record)) {
                results.push({
                    path: `${path}${path === '$' ? '' : '.'}${key}`,
                    type: 'removed',
                    oldValue: obj1Record[key]
                });
            }
        } else {
            results.push({
                path: path,
                type: 'removed',
                oldValue: obj1
            });
        }
        return results;
    }
    
    // 都是数组
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        const maxLen = Math.max(obj1.length, obj2.length);
        for (let i = 0; i < maxLen; i++) {
            if (i >= obj1.length) {
                results.push({
                    path: `${path}[${i}]`,
                    type: 'added',
                    newValue: obj2[i]
                });
            } else if (i >= obj2.length) {
                results.push({
                    path: `${path}[${i}]`,
                    type: 'removed',
                    oldValue: obj1[i]
                });
            } else if (!deepEqual(obj1[i], obj2[i])) {
                results.push({
                    path: `${path}[${i}]`,
                    type: 'modified',
                    oldValue: obj1[i],
                    newValue: obj2[i]
                });
            } else {
                results.push({
                    path: `${path}[${i}]`,
                    type: 'unchanged'
                });
            }
        }
        return results;
    }
    
    // 都是对象
    if (typeof obj1 === 'object' && typeof obj2 === 'object' && !Array.isArray(obj1) && !Array.isArray(obj2)) {
        const keys1 = Object.keys(obj1 as Record<string, unknown>);
        const keys2 = Object.keys(obj2 as Record<string, unknown>);
        const allKeys = [...new Set([...keys1, ...keys2])];
        
        for (const key of allKeys.sort()) {
            const value1 = (obj1 as Record<string, unknown>)[key];
            const value2 = (obj2 as Record<string, unknown>)[key];
            const currentPath = `${path}${path === '$' ? '' : '.'}${key}`;
            
            if (!keys1.includes(key)) {
                // 新增字段
                if (typeof value2 === 'object' && value2 !== null) {
                    results.push({
                        path: currentPath,
                        type: 'added',
                        newValue: value2
                    });
                } else {
                    results.push({
                        path: currentPath,
                        type: 'added',
                        newValue: value2
                    });
                }
            } else if (!keys2.includes(key)) {
                // 删除字段
                if (typeof value1 === 'object' && value1 !== null) {
                    results.push({
                        path: currentPath,
                        type: 'removed',
                        oldValue: value1
                    });
                } else {
                    results.push({
                        path: currentPath,
                        type: 'removed',
                        oldValue: value1
                    });
                }
            } else if (!deepEqual(value1, value2)) {
                // 修改字段
                results.push({
                    path: currentPath,
                    type: 'modified',
                    oldValue: value1,
                    newValue: value2
                });
            } else {
                // 无变化
                results.push({
                    path: currentPath,
                    type: 'unchanged'
                });
            }
        }
        return results;
    }
    
    // 基本类型比较
    if (!deepEqual(obj1, obj2)) {
        results.push({
            path: path,
            type: 'modified',
            oldValue: obj1,
            newValue: obj2
        });
    }
    
    return results;
}

function DiffItem({ diff, depth = 0 }: { diff: DiffResult; depth?: number }) {
    const [expanded, setExpanded] = useState(diff.type !== 'unchanged');
    
    const hasChildren = diff.children && diff.children.length > 0;
    const isComplexValue = (diff.oldValue || diff.newValue) !== undefined && 
                          typeof (diff.oldValue || diff.newValue) === 'object' && 
                          (diff.oldValue || diff.newValue) !== null;
    
    const typeColors = {
        added: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
        removed: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
        modified: { bg: '#fef9c3', border: '#eab308', text: '#854d0e' },
        unchanged: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' }
    };
    
    const colors = typeColors[diff.type];
    
    const formatValue = (value: unknown): string => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };
    
    return (
        <div style={{
            marginLeft: `${depth * 20}px`,
            marginBottom: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                background: colors.bg,
                borderLeft: `3px solid ${colors.border}`,
                borderRadius: '4px',
                cursor: hasChildren || isComplexValue ? 'pointer' : 'default',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
            onClick={() => {
                if (hasChildren || isComplexValue) {
                    setExpanded(!expanded);
                }
            }}
            >
                {((hasChildren || isComplexValue) && (
                    <span style={{
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        fontSize: '0.75rem'
                    }}>
                        ▶
                    </span>
                )) || <span style={{ width: '16px' }} />}
                
                <span style={{ 
                    color: colors.text,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    minWidth: '70px'
                }}>
                    {diff.type === 'added' && '新增'}
                    {diff.type === 'removed' && '删除'}
                    {diff.type === 'modified' && '修改'}
                    {diff.type === 'unchanged' && '未变'}
                </span>
                
                <span style={{ 
                    color: '#1f2937',
                    fontWeight: 600,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {diff.path}
                </span>
                
                {diff.type === 'modified' && (
                    <span style={{ 
                        color: '#dc2626',
                        background: '#fee2e2',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {formatValue(diff.oldValue)}
                    </span>
                )}
                
                {diff.type === 'modified' && (
                    <span style={{ color: '#6b7280' }}>→</span>
                )}
                
                {diff.type === 'modified' && (
                    <span style={{ 
                        color: '#16a34a',
                        background: '#dcfce7',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {formatValue(diff.newValue)}
                    </span>
                )}
                
                {diff.type === 'added' && (
                    <span style={{ 
                        color: '#16a34a',
                        background: '#dcfce7',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {formatValue(diff.newValue)}
                    </span>
                )}
                
                {diff.type === 'removed' && (
                    <span style={{ 
                        color: '#dc2626',
                        background: '#fee2e2',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {formatValue(diff.oldValue)}
                    </span>
                )}
            </div>
            
            {expanded && diff.children && diff.children.length > 0 && (
                <div style={{
                    marginTop: '4px',
                    borderLeft: '2px solid #e5e7eb',
                    marginLeft: '9px'
                }}>
                    {diff.children.map((child, index) => (
                        <DiffItem key={index} diff={child} depth={depth + 1} />
                    ))}
                </div>
            )}
            
            {expanded && isComplexValue && diff.type === 'modified' && (
                <div style={{
                    marginTop: '4px',
                    marginLeft: '29px',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ marginBottom: '4px', color: '#dc2626' }}>
                        <strong>原值：</strong>
                        <pre style={{ margin: '4px 0', overflow: 'auto' }}>
                            {JSON.stringify(diff.oldValue, null, 2)}
                        </pre>
                    </div>
                    <div style={{ color: '#16a34a' }}>
                        <strong>新值：</strong>
                        <pre style={{ margin: '4px 0', overflow: 'auto' }}>
                            {JSON.stringify(diff.newValue, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function JsonDiffPage() {
    const [leftInput, setLeftInput] = useState('');
    const [rightInput, setRightInput] = useState('');
    const [diffResult, setDiffResult] = useState<DiffResult[]>([]);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ added: 0, removed: 0, modified: 0, unchanged: 0 });
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();
    
    const t = (key: string) => getTranslation(language, key);
    
    useEffect(() => {
        if (!leftInput.trim() || !rightInput.trim()) {
            setDiffResult([]);
            setError('');
            setStats({ added: 0, removed: 0, modified: 0, unchanged: 0 });
            return;
        }
        
        try {
            const leftJson = JSON.parse(leftInput);
            const rightJson = JSON.parse(rightInput);
            
            const result = compareJson(leftJson, rightJson);
            setDiffResult(result);
            setError('');
            
            const newStats = {
                added: result.filter(r => r.type === 'added').length,
                removed: result.filter(r => r.type === 'removed').length,
                modified: result.filter(r => r.type === 'modified').length,
                unchanged: result.filter(r => r.type === 'unchanged').length
            };
            setStats(newStats);
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
            setDiffResult([]);
            setStats({ added: 0, removed: 0, modified: 0, unchanged: 0 });
        }
    }, [leftInput, rightInput]);
    
    const clearAll = () => {
        setLeftInput('');
        setRightInput('');
        setDiffResult([]);
        setError('');
        setStats({ added: 0, removed: 0, modified: 0, unchanged: 0 });
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
                    <h1 className="tool-title">{t('toolPages.jsonDiff.title')}</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {stats.added > 0 && (
                            <span style={{
                                padding: '4px 12px',
                                background: '#dcfce7',
                                color: '#16a34a',
                                borderRadius: 'var(--radius-xl)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                +{stats.added}
                            </span>
                        )}
                        {stats.removed > 0 && (
                            <span style={{
                                padding: '4px 12px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                borderRadius: 'var(--radius-xl)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                -{stats.removed}
                            </span>
                        )}
                        {stats.modified > 0 && (
                            <span style={{
                                padding: '4px 12px',
                                background: '#fef9c3',
                                color: '#ca8a04',
                                borderRadius: 'var(--radius-xl)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}>
                                ~{stats.modified}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="editor-container" style={{ height: 'calc(100vh - 220px)' }}>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonDiff.originalJson')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonDiff.originalPlaceholder')}
                            value={leftInput}
                            onChange={(e) => setLeftInput(e.target.value)}
                            style={{ borderBottomLeftRadius: 0 }}
                        />
                    </div>
                    
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonDiff.modifiedJson')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonDiff.modifiedPlaceholder')}
                            value={rightInput}
                            onChange={(e) => setRightInput(e.target.value)}
                            style={{ borderBottomRightRadius: 0 }}
                        />
                    </div>
                </div>
                
                {error && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
                
                {!error && diffResult.length > 0 && (
                    <div style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: 'var(--card-bg)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        maxHeight: '300px',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                            paddingBottom: '12px',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <GitCompare size={18} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontWeight: 600 }}>{t('toolPages.jsonDiff.diffResult')}</span>
                                <span style={{ 
                                    color: 'var(--text-secondary)', 
                                    fontSize: '0.85rem',
                                    marginLeft: 'auto'
                                }}>
                                    {t('toolPages.jsonDiff.totalChanges')}: {stats.added + stats.removed + stats.modified}
                                </span>
                        </div>
                        
                        {diffResult.length > 0 ? (
                            diffResult.map((diff, index) => (
                                <DiffItem key={index} diff={diff} />
                            ))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px',
                                color: 'var(--text-secondary)'
                            }}>
                                <Check size={48} style={{ color: '#22c55e', marginBottom: '12px' }} />
                                <p>{t('toolPages.jsonDiff.noDifferences')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}