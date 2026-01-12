'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { pinyin } from 'pinyin-pro';

type ToneType = 'symbol' | 'num' | 'none';

export default function ChinesePinyinPage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [toneType, setToneType] = useState<ToneType>('symbol');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (input) {
            const options: { toneType: ToneType } = { toneType };
            setResult(pinyin(input, options));
        } else {
            setResult('');
        }
    }, [input, toneType]);

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
                    <h1 className="tool-title">{t('toolPages.chinesePinyin.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.chinesePinyin.inputChinese')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.chinesePinyin.placeholder')}
                        />
                        <div className="input-group" style={{ marginTop: '16px', padding: '16px' }}>
                            <label className="input-label">{t('toolPages.chinesePinyin.toneType')}</label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="toneType"
                                        checked={toneType === 'symbol'}
                                        onChange={() => setToneType('symbol')}
                                    />
                                    {t('toolPages.chinesePinyin.toneSymbol')} (zhōng guó)
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="toneType"
                                        checked={toneType === 'num'}
                                        onChange={() => setToneType('num')}
                                    />
                                    {t('toolPages.chinesePinyin.toneNumber')} (zhong1 guo2)
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="toneType"
                                        checked={toneType === 'none'}
                                        onChange={() => setToneType('none')}
                                    />
                                    {t('toolPages.chinesePinyin.toneNone')} (zhong guo)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.chinesePinyin.pinyinResult')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={result}
                            readOnly
                            placeholder={language === 'zh' ? '拼音结果将显示在这里...' : 'Pinyin result will appear here...'}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
