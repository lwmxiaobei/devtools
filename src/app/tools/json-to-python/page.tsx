'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function getPythonType(value: unknown): string {
    if (value === null) return 'Optional[Any]';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'int' : 'float';
    }
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'datetime';
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
        return 'str';
    }
    if (Array.isArray(value)) {
        if (value.length > 0) {
            return `List[${getPythonType(value[0])}]`;
        }
        return 'List[Any]';
    }
    if (typeof value === 'object') {
        return 'Dict[str, Any]';
    }
    return 'Any';
}

function toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function jsonToPython(json: unknown, className: string, useDataclass: boolean): string {
    if (typeof json !== 'object' || json === null) {
        return '# 请输入 JSON 对象';
    }

    const obj = Array.isArray(json) ? json[0] : json;
    if (!obj || typeof obj !== 'object') {
        return '# 请输入有效的 JSON 对象或对象数组';
    }

    const imports = new Set<string>();
    const fields: { name: string; type: string; value: unknown }[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const pythonType = getPythonType(value);

        if (pythonType.includes('List')) imports.add('from typing import List');
        if (pythonType.includes('Dict')) imports.add('from typing import Dict');
        if (pythonType.includes('Optional')) imports.add('from typing import Optional');
        if (pythonType.includes('Any')) imports.add('from typing import Any');
        if (pythonType === 'datetime') imports.add('from datetime import datetime');
        if (pythonType === 'date') imports.add('from datetime import date');

        fields.push({
            name: toSnakeCase(key),
            type: pythonType,
            value,
        });
    }

    let code = '';

    if (useDataclass) {
        imports.add('from dataclasses import dataclass');
    }

    // 合并 typing imports
    const typingImports: string[] = [];
    const otherImports: string[] = [];
    imports.forEach(imp => {
        if (imp.startsWith('from typing')) {
            const types = imp.replace('from typing import ', '').split(', ');
            typingImports.push(...types);
        } else {
            otherImports.push(imp);
        }
    });

    if (typingImports.length > 0) {
        code += `from typing import ${Array.from(new Set(typingImports)).join(', ')}\n`;
    }
    otherImports.forEach(imp => {
        code += `${imp}\n`;
    });

    code += '\n';

    if (useDataclass) {
        code += '@dataclass\n';
        code += `class ${className}:\n`;
        fields.forEach(field => {
            code += `    ${field.name}: ${field.type}\n`;
        });
    } else {
        code += `class ${className}:\n`;
        code += '    def __init__(self';
        fields.forEach(field => {
            code += `, ${field.name}: ${field.type}`;
        });
        code += '):\n';
        fields.forEach(field => {
            code += `        self.${field.name} = ${field.name}\n`;
        });
        code += '\n';
        code += '    def to_dict(self) -> dict:\n';
        code += '        return {\n';
        fields.forEach(field => {
            code += `            "${field.name}": self.${field.name},\n`;
        });
        code += '        }\n';
        code += '\n';
        code += '    @classmethod\n';
        code += `    def from_dict(cls, data: dict) -> "${className}":\n`;
        code += '        return cls(\n';
        fields.forEach(field => {
            code += `            ${field.name}=data.get("${field.name}"),\n`;
        });
        code += '        )\n';
    }

    return code;
}

export default function JsonToPythonPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [className, setClassName] = useState('Model');
    const [useDataclass, setUseDataclass] = useState(true);
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
            const parsed = JSON.parse(input);
            const python = jsonToPython(parsed, className, useDataclass);
            setOutput(python);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.formatError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, className, useDataclass, language]);

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
                    <h1 className="tool-title">{t('toolPages.jsonToPython.title')}</h1>
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

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('toolPages.common.className')}:</label>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                background: 'var(--bg-primary)',
                            }}
                        />
                    </div>
                    <button
                        className={`action-btn ${useDataclass ? 'primary' : 'secondary'}`}
                        onClick={() => setUseDataclass(!useDataclass)}
                    >
                        {useDataclass ? t('toolPages.jsonToPython.dataclassMode') : t('toolPages.jsonToPython.normalClassMode')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonToPython.input')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonToPython.placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonToPython.output')}</span>
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
                            {error || output || t('toolPages.jsonToPython.outputPlaceholder')}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
