'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type ColorScheme = 'rainbow' | 'sunset' | 'ocean' | 'forest' | 'fire' | 'custom';

const colorSchemes: Record<string, string[]> = {
    rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    sunset: ['#ff6b6b', '#ffa07a', '#ffd700', '#ff8c00', '#ff4500'],
    ocean: ['#00ffff', '#00bfff', '#1e90ff', '#0000cd', '#00008b'],
    forest: ['#228b22', '#32cd32', '#90ee90', '#98fb98', '#006400'],
    fire: ['#ff0000', '#ff4500', '#ff8c00', '#ffa500', '#ffd700'],
};

export default function ColorfulTextPage() {
    const [input, setInput] = useState('');
    const [scheme, setScheme] = useState<ColorScheme>('rainbow');
    const [startColor, setStartColor] = useState('#ff0000');
    const [endColor, setEndColor] = useState('#0000ff');
    const [htmlResult, setHtmlResult] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const interpolateColor = (color1: string, color2: string, factor: number): string => {
        const hex = (c: string) => parseInt(c, 16);
        const r1 = hex(color1.slice(1, 3)), g1 = hex(color1.slice(3, 5)), b1 = hex(color1.slice(5, 7));
        const r2 = hex(color2.slice(1, 3)), g2 = hex(color2.slice(3, 5)), b2 = hex(color2.slice(5, 7));

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const getColorForIndex = (index: number, total: number): string => {
        if (scheme === 'custom') {
            return interpolateColor(startColor, endColor, index / Math.max(total - 1, 1));
        }

        const colors = colorSchemes[scheme];
        const position = (index / Math.max(total - 1, 1)) * (colors.length - 1);
        const lowerIndex = Math.floor(position);
        const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
        const factor = position - lowerIndex;

        return interpolateColor(colors[lowerIndex], colors[upperIndex], factor);
    };

    useEffect(() => {
        if (!input) {
            setHtmlResult('');
            return;
        }

        const chars = [...input];
        const nonSpaceChars = chars.filter(c => c !== ' ' && c !== '\n');
        let colorIndex = 0;
        const html = chars.map((char) => {
            if (char === ' ') return ' ';
            if (char === '\n') return '<br>';
            const color = getColorForIndex(colorIndex++, nonSpaceChars.length);
            return `<span style="color:${color}">${char}</span>`;
        }).join('');

        setHtmlResult(html);
    }, [input, scheme, startColor, endColor]);

    const copyHtml = async () => {
        await navigator.clipboard.writeText(htmlResult);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setHtmlResult('');
    };

    const renderPreview = () => {
        if (!input) return null;

        const chars = [...input];
        const nonSpaceChars = chars.filter(c => c !== ' ' && c !== '\n');
        let colorIndex = 0;

        return chars.map((char, i) => {
            if (char === ' ') return <span key={i}>&nbsp;</span>;
            if (char === '\n') return <br key={i} />;
            const color = getColorForIndex(colorIndex++, nonSpaceChars.length);
            return <span key={i} style={{ color }}>{char}</span>;
        });
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
                    <h1 className="tool-title">{t('toolPages.colorfulText.title')}</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.colorfulText.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.colorfulText.placeholder')}
                            style={{ minHeight: '120px' }}
                        />
                        <div className="input-group" style={{ marginTop: '16px', padding: '16px' }}>
                            <label className="input-label">{t('toolPages.colorfulText.colorScheme')}</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {(['rainbow', 'sunset', 'ocean', 'forest', 'fire', 'custom'] as ColorScheme[]).map(s => (
                                    <button
                                        key={s}
                                        className={`action-btn ${scheme === s ? 'primary' : 'secondary'}`}
                                        onClick={() => setScheme(s)}
                                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                    >
                                        {t(`toolPages.colorfulText.${s}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {scheme === 'custom' && (
                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', padding: '0 16px 16px' }}>
                                <div className="input-group">
                                    <label className="input-label">{t('toolPages.colorfulText.startColor')}</label>
                                    <input
                                        type="color"
                                        value={startColor}
                                        onChange={(e) => setStartColor(e.target.value)}
                                        style={{ width: '60px', height: '36px', cursor: 'pointer' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('toolPages.colorfulText.endColor')}</label>
                                    <input
                                        type="color"
                                        value={endColor}
                                        onChange={(e) => setEndColor(e.target.value)}
                                        style={{ width: '60px', height: '36px', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.colorfulText.preview')}</span>
                            <button className="editor-btn" onClick={copyHtml} disabled={!htmlResult}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: 'var(--bg-primary)',
                                minHeight: '200px',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                lineHeight: 1.6,
                                wordBreak: 'break-word',
                            }}
                        >
                            {renderPreview() || (
                                <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 'normal' }}>
                                    {language === 'zh' ? '效果预览将显示在这里...' : 'Effect preview will appear here...'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
