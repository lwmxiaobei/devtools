'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Play } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function jsonToXml(json: unknown, rootName: string = 'root', indent: string = ''): string {
    const newIndent = indent + '  ';

    if (json === null) {
        return `${indent}<${rootName}></${rootName}>`;
    }

    if (Array.isArray(json)) {
        if (json.length === 0) {
            return `${indent}<${rootName}></${rootName}>`;
        }
        return json.map((item, index) => {
            const itemName = rootName.endsWith('s') ? rootName.slice(0, -1) : 'item';
            return jsonToXml(item, itemName, indent);
        }).join('\n');
    }

    if (typeof json === 'object') {
        const entries = Object.entries(json as object);
        if (entries.length === 0) {
            return `${indent}<${rootName}></${rootName}>`;
        }
        const content = entries.map(([key, value]) => {
            if (Array.isArray(value)) {
                const arrayContent = value.map(item => jsonToXml(item, key.endsWith('s') ? key.slice(0, -1) : key, newIndent)).join('\n');
                return `${newIndent}<${key}>\n${arrayContent}\n${newIndent}</${key}>`;
            }
            return jsonToXml(value, key, newIndent);
        }).join('\n');
        return `${indent}<${rootName}>\n${content}\n${indent}</${rootName}>`;
    }

    // Primitive values
    const escapedValue = String(json)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    return `${indent}<${rootName}>${escapedValue}</${rootName}>`;
}

export default function JsonToXmlPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [rootElement, setRootElement] = useState('root');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const convert = () => {
        if (!input.trim()) {
            setError(t('toolPages.common.invalidInput'));
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(parsed, rootElement);
            setOutput(xml);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.formatError')}: ${(e as Error).message}`);
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
        setInput('');
        setOutput('');
        setError('');
    };

    const loadExample = () => {
        const example = {
            "name": "张三",
            "age": 25,
            "email": "zhangsan@example.com",
            "address": {
                "city": "北京",
                "street": "长安街"
            },
            "hobbies": ["读书", "编程", "音乐"]
        };
        setInput(JSON.stringify(example, null, 2));
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
                    <h1 className="tool-title">{t('toolPages.jsonToXml.title')}</h1>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('toolPages.jsonToXml.rootElement')}:</label>
                        <input
                            type="text"
                            value={rootElement}
                            onChange={(e) => setRootElement(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>
                    <button className="action-btn secondary" onClick={loadExample}>
                        {t('toolPages.json5.example')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonToXml.input')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonToXml.placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <div style={{ padding: '16px' }}>
                            <button className="action-btn primary" onClick={convert}>
                                <Play size={18} />
                                {t('toolPages.common.convert')}
                            </button>
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonToXml.output')}</span>
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
                            {error || output || t('toolPages.jsonToXml.outputPlaceholder')}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
