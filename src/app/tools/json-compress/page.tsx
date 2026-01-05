'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Minimize2, Maximize2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function JsonCompressPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const escapeJson = () => {
        try {
            // 先验证是否为有效JSON
            JSON.parse(input);
            // 转义：将JSON字符串转为转义后的字符串
            const escaped = JSON.stringify(input);
            setOutput(escaped);
            setError('');
        } catch {
            // 如果不是有效JSON，直接转义输入字符串
            const escaped = JSON.stringify(input);
            setOutput(escaped);
            setError('');
        }
    };

    const unescapeJson = () => {
        try {
            // 反转义：将转义后的字符串还原
            const unescaped = JSON.parse(input);
            if (typeof unescaped === 'string') {
                setOutput(unescaped);
            } else {
                setOutput(JSON.stringify(unescaped, null, 2));
            }
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.decodeError')}: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const compressJson = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.jsonError')}: ${(e as Error).message}`);
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

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.jsonCompress.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonCompress.inputJson')}</span>
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
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.common.outputResult')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonFormatter.emptyResult')}
                            value={output}
                            readOnly
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
                    <button className="action-btn primary" onClick={compressJson}>
                        <Minimize2 size={18} />
                        {t('toolPages.jsonCompress.compress')}
                    </button>
                    <button className="action-btn secondary" onClick={escapeJson}>
                        {t('toolPages.jsonCompress.escape')}
                    </button>
                    <button className="action-btn secondary" onClick={unescapeJson}>
                        <Maximize2 size={18} />
                        {t('toolPages.jsonCompress.unescape')}
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
