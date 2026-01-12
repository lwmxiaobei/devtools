'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Shuffle } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type ShuffleMode = 'lines' | 'chars' | 'words';

export default function TextShufflePage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [mode, setMode] = useState<ShuffleMode>('lines');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleShuffle = () => {
        if (!input) {
            setResult('');
            return;
        }

        let shuffled: string;
        switch (mode) {
            case 'lines':
                const lines = input.split('\n');
                shuffled = shuffleArray(lines).join('\n');
                break;
            case 'chars':
                const chars = [...input];
                shuffled = shuffleArray(chars).join('');
                break;
            case 'words':
                const words = input.split(/(\s+)/);
                const nonSpaceWords = words.filter(w => !/^\s+$/.test(w));
                const spaces = words.filter(w => /^\s+$/.test(w));
                const shuffledWords = shuffleArray(nonSpaceWords);
                // 重新组装，保持空格位置
                shuffled = '';
                let wordIndex = 0;
                let spaceIndex = 0;
                for (const part of words) {
                    if (/^\s+$/.test(part)) {
                        shuffled += spaces[spaceIndex++] || ' ';
                    } else {
                        shuffled += shuffledWords[wordIndex++] || '';
                    }
                }
                break;
        }

        setResult(shuffled);
    };

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
                    <h1 className="tool-title">{t('toolPages.textShuffle.title')}</h1>
                </div>

                <div className="options-grid" style={{ marginBottom: '20px' }}>
                    {(['lines', 'chars', 'words'] as ShuffleMode[]).map(m => (
                        <button
                            key={m}
                            className={`option-btn ${mode === m ? 'active' : ''}`}
                            onClick={() => setMode(m)}
                        >
                            {t(`toolPages.textShuffle.shuffle${m.charAt(0).toUpperCase() + m.slice(1)}`)}
                        </button>
                    ))}
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.textShuffle.inputText')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.textShuffle.placeholder')}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.textShuffle.result')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={result}
                            readOnly
                            placeholder={language === 'zh' ? '打乱结果将显示在这里...' : 'Shuffled result will appear here...'}
                        />
                    </div>
                </div>

                <div className="action-row">
                    <button className="action-btn primary" onClick={handleShuffle}>
                        <Shuffle size={18} />
                        {t('toolPages.textShuffle.shuffle')}
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
