'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, FileCode, Code } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function getTsType(value: unknown, depth = 0): string {
    if (depth > 5) return 'any'; // 防止无限递归
    
    if (value === null) return 'null';
    if (value === undefined) return 'unknown';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
        // 检测常见格式
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'Date';
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Date';
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'string'; // email
        if (/^https?:\/\//.test(value)) return 'string'; // url
        return 'string';
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        const types = new Set(value.map(v => getTsType(v, depth + 1)));
        if (types.size === 1) {
            return `${Array.from(types)[0]}[]`;
        }
        return `(${Array.from(types).join(' | ')})[]`;
    }
    if (typeof value === 'object') {
        return generateInterface(value as Record<string, unknown>, depth);
    }
    return 'unknown';
}

function toPascalCase(str: string): string {
    return str.replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
              .replace(/^[a-z]/, letter => letter.toUpperCase());
}

function generateInterface(obj: Record<string, unknown>, depth = 0, interfaceName = 'Root'): string {
    if (depth > 5) return 'any';
    
    let result = `interface ${interfaceName} {\n`;
    
    for (const [key, value] of Object.entries(obj)) {
        const pascalKey = toPascalCase(key);
        const tsType = getTsType(value, depth);
        
        // 添加可选标记（如果值为null或undefined）
        const isOptional = value === null || value === undefined;
        const optionalMark = isOptional ? '?' : '';
        
        result += `  ${key}${optionalMark}: ${tsType};\n`;
    }
    
    result += `}\n`;
    
    return result;
}

function analyzeJsonForInterfaces(json: unknown, baseName = 'MyType'): Record<string, string> {
    const interfaces: Record<string, string> = {};
    
    function processObject(obj: unknown, name: string, depth = 0) {
        if (depth > 5) return;
        if (obj === null || typeof obj !== 'object') return;
        
        if (Array.isArray(obj)) {
            if (obj.length > 0) {
                processObject(obj[0], name, depth);
            }
            return;
        }
        
        const typedObj = obj as Record<string, unknown>;
        let hasNested = false;
        const nestedInterfaces: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(typedObj)) {
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                const nestedName = toPascalCase(key);
                nestedInterfaces[nestedName] = value;
                hasNested = true;
            }
        }
        
        // 先生成嵌套接口
        if (hasNested) {
            for (const [nestedKey, nestedValue] of Object.entries(nestedInterfaces)) {
                processObject(nestedValue, nestedKey, depth + 1);
            }
        }
        
        // 生成当前接口
        let interfaceCode = `export interface ${name} {\n`;
        
        for (const [key, value] of Object.entries(typedObj)) {
            const tsType = getTsType(value, depth);
            const isOptional = value === null || value === undefined;
            const optionalMark = isOptional ? '?' : '';
            interfaceCode += `  ${key}${optionalMark}: ${tsType};\n`;
        }
        
        interfaceCode += `}\n`;
        interfaces[name] = interfaceCode;
    }
    
    processObject(json, baseName);
    return interfaces;
}

function jsonToTs(json: unknown, interfaceName: string): string {
    if (typeof json !== 'object' || json === null) {
        return '// Please enter a valid JSON object';
    }
    
    const interfaces = analyzeJsonForInterfaces(json, interfaceName);
    
    // 按依赖顺序排列（嵌套的在前，父级的在后）
    const sortedKeys = Object.keys(interfaces).sort((a, b) => {
        const aHasRef = interfaces[a].includes('interface');
        const bHasRef = interfaces[b].includes('interface');
        if (aHasRef && !bHasRef) return -1;
        if (!aHasRef && bHasRef) return 1;
        return a.localeCompare(b);
    });
    
    return sortedKeys.map(key => interfaces[key]).join('\n');
}

export default function JsonToTsPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [interfaceName, setInterfaceName] = useState('MyType');
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
            const parsed = JSON.parse(input);
            const result = jsonToTs(parsed, interfaceName);
            setOutput(result);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, interfaceName]);
    
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
    
    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.jsonToTs.title')}</h1>
                </div>
                
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.conversion.inputData')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonToTs.placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.conversion.conversionResult')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonToTs.outputPlaceholder')}
                            value={output}
                            readOnly
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                        />
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
                    <div className="action-item">
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary)'
                        }}>
                            {t('toolPages.conversion.className')}
                        </label>
                        <input
                            type="text"
                            value={interfaceName}
                            onChange={(e) => setInterfaceName(e.target.value)}
                            className="action-input"
                            placeholder="MyType"
                            style={{
                                width: '200px',
                                padding: '8px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.9rem',
                                background: 'var(--input-bg)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}