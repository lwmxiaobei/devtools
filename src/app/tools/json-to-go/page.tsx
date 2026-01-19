'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, FileCode, Code } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function getGoType(value: unknown): string {
    if (value === null) return 'interface{}';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'int' : 'float64';
    }
    if (typeof value === 'string') {
        return 'string';
    }
    if (Array.isArray(value)) {
        if (value.length > 0) {
            return '[]' + getGoType(value[0]);
        }
        return '[]interface{}';
    }
    if (typeof value === 'object') {
        return 'map[string]interface{}';
    }
    return 'interface{}';
}

function toCamelCase(str: string): string {
    // 处理蛇形命名
    const snake = str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    // 处理短横线命名
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

interface FieldInfo {
    name: string;
    jsonName: string;
    type: string;
    value: unknown;
    comment?: string;
}

function analyzeJson(json: unknown, prefix = ''): FieldInfo[] {
    const fields: FieldInfo[] = [];
    
    if (json === null || typeof json !== 'object') {
        return fields;
    }
    
    if (Array.isArray(json)) {
        if (json.length > 0) {
            return analyzeJson(json[0], prefix);
        }
        return fields;
    }
    
    const obj = json as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
        const fieldName = toCamelCase(key);
        const pascalName = toPascalCase(key);
        const goType = getGoType(value);
        
        fields.push({
            name: fieldName,
            jsonName: key,
            type: goType,
            value: value,
            comment: `JSON field: ${key}`
        });
        
        // 如果值是复杂对象，递归分析
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            const nestedFields = analyzeJson(value, `${prefix}${pascalName}.`);
            // 这里可以进一步处理嵌套结构
        }
    }
    
    return fields;
}

function jsonToGo(json: unknown, structName: string): string {
    if (typeof json !== 'object' || json === null) {
        return '// Please enter a valid JSON object';
    }
    
    // 如果是数组，取第一个元素
    const obj = Array.isArray(json) ? (json[0] as Record<string, unknown>) : json;
    if (!obj || typeof obj !== 'object') {
        return '// Please enter a valid JSON object or array of objects';
    }
    
    const fields = analyzeJson(obj);
    
    let code = `package model\n\n`;
    code += `type ${structName} struct {\n`;
    
    for (const field of fields) {
        // 添加注释
        code += `    // ${field.comment}\n`;
        // 添加字段，使用json标签
        code += `    ${toPascalCase(field.name)} ${field.type} \`json:"${field.jsonName}"\`\n`;
    }
    
    code += `}\n`;
    
    return code;
}

export default function JsonToGoPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [structName, setStructName] = useState('MyStruct');
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
            const result = jsonToGo(parsed, structName);
            setOutput(result);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, structName]);
    
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
                    <h1 className="tool-title">{t('toolPages.jsonToGo.title')}</h1>
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
                            placeholder={t('toolPages.jsonToGo.placeholder')}
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
                            placeholder={t('toolPages.jsonToGo.outputPlaceholder')}
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
                            value={structName}
                            onChange={(e) => setStructName(e.target.value)}
                            className="action-input"
                            placeholder="MyStruct"
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