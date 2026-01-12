'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Plus, Minus, RotateCw } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function StringConcatPage() {
    const [strings, setStrings] = useState<string[]>(['', '']);
    const [separator, setSeparator] = useState<string>('none');
    const [customSeparator, setCustomSeparator] = useState('');
    const [result, setResult] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const separators: { [key: string]: string } = {
        none: '',
        space: ' ',
        newline: '\n',
        comma: ',',
    };

    useEffect(() => {
        handleConcat();
    }, [strings, separator, customSeparator]);

    const handleConcat = () => {
        const sep = separator === 'custom' ? customSeparator : separators[separator];
        setResult(strings.filter(s => s).join(sep));
    };

    const addLine = () => {
        setStrings([...strings, '']);
    };

    const removeLine = (index: number) => {
        if (strings.length > 2) {
            setStrings(strings.filter((_, i) => i !== index));
        }
    };

    const updateString = (index: number, value: string) => {
        const newStrings = [...strings];
        newStrings[index] = value;
        setStrings(newStrings);
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(result);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setStrings(['', '']);
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
                    <h1 className="tool-title">{t('toolPages.stringConcat.title')}</h1>
                </div>

                <div className="dual-panel">
                    <div className="left-panel">
                        <div className="input-group" style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>{t('toolPages.stringConcat.inputStrings')}</label>
                                <button className="action-btn secondary" onClick={addLine} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                    <Plus size={16} />
                                    {t('toolPages.stringConcat.addLine')}
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {strings.map((str, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={str}
                                            onChange={(e) => updateString(index, e.target.value)}
                                            placeholder={`${language === 'zh' ? '字符串' : 'String'} ${index + 1}`}
                                        />
                                        {strings.length > 2 && (
                                            <button
                                                className="editor-btn"
                                                onClick={() => removeLine(index)}
                                                title={t('toolPages.stringConcat.removeLine')}
                                            >
                                                <Minus size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">{t('toolPages.stringConcat.separator')}</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <label className="radio-label">
                                    <input type="radio" name="separator" checked={separator === 'none'} onChange={() => setSeparator('none')} />
                                    {t('toolPages.stringConcat.separatorNone')}
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="separator" checked={separator === 'space'} onChange={() => setSeparator('space')} />
                                    {t('toolPages.stringConcat.separatorSpace')}
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="separator" checked={separator === 'newline'} onChange={() => setSeparator('newline')} />
                                    {t('toolPages.stringConcat.separatorNewline')}
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="separator" checked={separator === 'comma'} onChange={() => setSeparator('comma')} />
                                    {t('toolPages.stringConcat.separatorComma')}
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="separator" checked={separator === 'custom'} onChange={() => setSeparator('custom')} />
                                    {t('toolPages.stringConcat.separatorCustom')}
                                </label>
                            </div>
                            {separator === 'custom' && (
                                <input
                                    type="text"
                                    className="input-field"
                                    value={customSeparator}
                                    onChange={(e) => setCustomSeparator(e.target.value)}
                                    placeholder={t('toolPages.stringConcat.customSeparator')}
                                    style={{ marginTop: '8px', maxWidth: '200px' }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="right-panel">
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>{t('toolPages.stringConcat.result')}</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                        <Copy size={16} />
                                    </button>
                                    <button className="editor-btn" onClick={clearAll}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="editor-textarea"
                                value={result}
                                readOnly
                                placeholder={language === 'zh' ? '拼接结果将显示在这里...' : 'Concat result will appear here...'}
                                style={{ minHeight: '200px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
