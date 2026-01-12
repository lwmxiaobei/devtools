'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Play } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function xmlToJson(xml: string): unknown {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error(parseError.textContent || 'XML parsing error');
    }

    function nodeToObject(node: Element): unknown {
        const result: Record<string, unknown> = {};

        // Handle attributes
        if (node.attributes.length > 0) {
            const attrs: Record<string, string> = {};
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                attrs[`@${attr.name}`] = attr.value;
            }
            Object.assign(result, attrs);
        }

        // Get child elements and text content
        const children = Array.from(node.childNodes);
        const elementChildren = children.filter(c => c.nodeType === Node.ELEMENT_NODE) as Element[];
        const textContent = children
            .filter(c => c.nodeType === Node.TEXT_NODE)
            .map(c => c.textContent?.trim())
            .filter(t => t)
            .join('');

        // If no element children, return text or primitive
        if (elementChildren.length === 0) {
            if (Object.keys(result).length > 0) {
                // Has attributes, add text as #text
                if (textContent) {
                    result['#text'] = textContent;
                }
                return result;
            }
            // Try to parse as number or boolean
            if (textContent === 'true') return true;
            if (textContent === 'false') return false;
            const num = Number(textContent);
            if (!isNaN(num) && textContent !== '') return num;
            return textContent;
        }

        // Group children by tag name
        const childGroups: Record<string, Element[]> = {};
        for (const child of elementChildren) {
            const tagName = child.tagName;
            if (!childGroups[tagName]) {
                childGroups[tagName] = [];
            }
            childGroups[tagName].push(child);
        }

        // Convert groups to object properties
        for (const [tagName, elements] of Object.entries(childGroups)) {
            if (elements.length === 1) {
                result[tagName] = nodeToObject(elements[0]);
            } else {
                result[tagName] = elements.map(el => nodeToObject(el));
            }
        }

        return result;
    }

    const root = doc.documentElement;
    const rootResult = nodeToObject(root);

    // Wrap in root element name
    return { [root.tagName]: rootResult };
}

export default function XmlToJsonPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
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
            const json = xmlToJson(input);
            setOutput(JSON.stringify(json, null, 2));
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.formatError')}: ${(e as Error).message}`);
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
        const example = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <name>张三</name>
  <age>25</age>
  <email>zhangsan@example.com</email>
  <address>
    <city>北京</city>
    <street>长安街</street>
  </address>
  <hobbies>
    <hobby>读书</hobby>
    <hobby>编程</hobby>
    <hobby>音乐</hobby>
  </hobbies>
</root>`;
        setInput(example);
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
                    <h1 className="tool-title">{t('toolPages.xmlToJson.title')}</h1>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <button className="action-btn secondary" onClick={loadExample}>
                        {t('toolPages.json5.example')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.xmlToJson.input')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.xmlToJson.placeholder')}
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
                            <span className="editor-title">{t('toolPages.xmlToJson.output')}</span>
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
                            {error || output || t('toolPages.xmlToJson.outputPlaceholder')}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
