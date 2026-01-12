'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function HtmlEscapePage() {
    const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const escapeHtml = (str: string): string => {
        const escapeMap: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return str.replace(/[&<>"']/g, char => escapeMap[char]);
    };

    const unescapeHtml = (str: string): string => {
        const unescapeMap: { [key: string]: string } = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&#x27;': "'",
            '&apos;': "'",
        };
        return str.replace(/&(amp|lt|gt|quot|#39|#x27|apos);/g, match => unescapeMap[match] || match);
    };

    const handleConvert = () => {
        if (mode === 'escape') {
            setResult(escapeHtml(input));
        } else {
            setResult(unescapeHtml(input));
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        if (mode === 'escape') {
            setResult(escapeHtml(value));
        } else {
            setResult(unescapeHtml(value));
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(result);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setResult('');
    };

    const switchMode = () => {
        const newMode = mode === 'escape' ? 'unescape' : 'escape';
        setMode(newMode);
        // 交换输入输出
        setInput(result);
        setResult(input);
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
                    <h1 className="tool-title">{t('toolPages.htmlEscape.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '16px' }}>
                    <button
                        className={`action-btn ${mode === 'escape' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('escape')}
                    >
                        {t('toolPages.htmlEscape.escape')}
                    </button>
                    <button
                        className="action-btn secondary"
                        onClick={switchMode}
                    >
                        <ArrowRightLeft size={16} />
                    </button>
                    <button
                        className={`action-btn ${mode === 'unescape' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('unescape')}
                    >
                        {t('toolPages.htmlEscape.unescape')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.htmlEscape.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={mode === 'escape'
                                ? t('toolPages.htmlEscape.escapePlaceholder')
                                : t('toolPages.htmlEscape.unescapePlaceholder')}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'escape'
                                    ? t('toolPages.htmlEscape.escapedResult')
                                    : t('toolPages.htmlEscape.unescapedResult')}
                            </span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={result}
                            readOnly
                            placeholder={language === 'zh' ? '结果将显示在这里...' : 'Result will appear here...'}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
