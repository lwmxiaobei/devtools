'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function TextSpacingPage() {
    const [input, setInput] = useState('');
    const [spacingType, setSpacingType] = useState<'space' | 'custom'>('space');
    const [customChar, setCustomChar] = useState('');
    const [result, setResult] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input) {
            setResult('');
            return;
        }

        const spacer = spacingType === 'space' ? ' ' : customChar;
        const chars = [...input];
        const spacedResult = chars.map((char, i) => {
            if (char === '\n') return char;
            if (i === chars.length - 1) return char;
            if (chars[i + 1] === '\n') return char;
            return char + spacer;
        }).join('');

        setResult(spacedResult);
    }, [input, spacingType, customChar]);

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
                    <h1 className="tool-title">{t('toolPages.textSpacing.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.textSpacing.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.textSpacing.placeholder')}
                        />
                        <div className="input-group" style={{ marginTop: '16px', padding: '16px' }}>
                            <label className="input-label">{t('toolPages.textSpacing.spacingChar')}</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="spacingType"
                                        checked={spacingType === 'space'}
                                        onChange={() => setSpacingType('space')}
                                    />
                                    {t('toolPages.textSpacing.spaceChar')}
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="spacingType"
                                        checked={spacingType === 'custom'}
                                        onChange={() => setSpacingType('custom')}
                                    />
                                    {t('toolPages.textSpacing.customChar')}
                                </label>
                                {spacingType === 'custom' && (
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={customChar}
                                        onChange={(e) => setCustomChar(e.target.value)}
                                        placeholder={t('toolPages.textSpacing.customPlaceholder')}
                                        style={{ width: '100px' }}
                                        maxLength={5}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.textSpacing.result')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={result}
                            readOnly
                            placeholder={language === 'zh' ? '间隔结果将显示在这里...' : 'Spaced result will appear here...'}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
