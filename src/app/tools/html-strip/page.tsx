'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function HtmlStripPage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const stripHtml = (html: string): string => {
        // 创建临时DOM元素来解析HTML
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    useEffect(() => {
        if (input) {
            setResult(stripHtml(input));
        } else {
            setResult('');
        }
    }, [input]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(result);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setResult('');
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
                    <h1 className="tool-title">{t('toolPages.htmlStrip.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.htmlStrip.inputHtml')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.htmlStrip.placeholder')}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.htmlStrip.plainText')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={result}
                            readOnly
                            placeholder={language === 'zh' ? '纯文本结果将显示在这里...' : 'Plain text result will appear here...'}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
