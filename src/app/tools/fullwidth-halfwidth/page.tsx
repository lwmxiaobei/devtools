'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function FullwidthHalfwidthPage() {
    const [input, setInput] = useState('');
    const [fullwidthResult, setFullwidthResult] = useState('');
    const [halfwidthResult, setHalfwidthResult] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // 半角转全角
    const toFullwidth = (str: string): string => {
        return str.split('').map(char => {
            const code = char.charCodeAt(0);
            // 空格特殊处理
            if (code === 32) return String.fromCharCode(12288);
            // ASCII可打印字符范围 (33-126)
            if (code >= 33 && code <= 126) {
                return String.fromCharCode(code + 65248);
            }
            return char;
        }).join('');
    };

    // 全角转半角
    const toHalfwidth = (str: string): string => {
        return str.split('').map(char => {
            const code = char.charCodeAt(0);
            // 全角空格
            if (code === 12288) return String.fromCharCode(32);
            // 全角字符范围 (65281-65374)
            if (code >= 65281 && code <= 65374) {
                return String.fromCharCode(code - 65248);
            }
            return char;
        }).join('');
    };

    useEffect(() => {
        if (input) {
            setFullwidthResult(toFullwidth(input));
            setHalfwidthResult(toHalfwidth(input));
        } else {
            setFullwidthResult('');
            setHalfwidthResult('');
        }
    }, [input]);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setFullwidthResult('');
        setHalfwidthResult('');
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
                    <h1 className="tool-title">{t('toolPages.fullwidthHalfwidth.title')}</h1>
                </div>

                <div className="editor-container" style={{ flexDirection: 'column' }}>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.fullwidthHalfwidth.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={language === 'zh' ? '请输入文本，例如：Hello World 123' : 'Enter text, e.g.: Hello World 123'}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.fullwidthHalfwidth.fullwidthResult')}</span>
                            <button className="editor-btn" onClick={() => copyToClipboard(fullwidthResult)} disabled={!fullwidthResult}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={fullwidthResult}
                            readOnly
                            placeholder={language === 'zh' ? '全角结果：Ｈｅｌｌｏ　Ｗｏｒｌｄ　１２３' : 'Fullwidth: Ｈｅｌｌｏ　Ｗｏｒｌｄ　１２３'}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.fullwidthHalfwidth.halfwidthResult')}</span>
                            <button className="editor-btn" onClick={() => copyToClipboard(halfwidthResult)} disabled={!halfwidthResult}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={halfwidthResult}
                            readOnly
                            placeholder={language === 'zh' ? '半角结果：Hello World 123' : 'Halfwidth: Hello World 123'}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
