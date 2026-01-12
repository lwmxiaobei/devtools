'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import figlet from 'figlet';

// 导入字体
import standard from 'figlet/fonts/Standard';
import big from 'figlet/fonts/Big';
import banner from 'figlet/fonts/Banner';
import slant from 'figlet/fonts/Slant';
import small from 'figlet/fonts/Small';
import block from 'figlet/fonts/Block';
import bubble from 'figlet/fonts/Bubble';
import digital from 'figlet/fonts/Digital';
import ivrit from 'figlet/fonts/Ivrit';
import lean from 'figlet/fonts/Lean';
import mini from 'figlet/fonts/Mini';
import script from 'figlet/fonts/Script';
import shadow from 'figlet/fonts/Shadow';
import speed from 'figlet/fonts/Speed';

// 可用的字体列表
const fontList = [
    { name: 'Standard', font: 'Standard', data: standard },
    { name: 'Big', font: 'Big', data: big },
    { name: 'Banner', font: 'Banner', data: banner },
    { name: 'Slant', font: 'Slant', data: slant },
    { name: 'Small', font: 'Small', data: small },
    { name: 'Block', font: 'Block', data: block },
    { name: 'Bubble', font: 'Bubble', data: bubble },
    { name: 'Digital', font: 'Digital', data: digital },
    { name: 'Ivrit', font: 'Ivrit', data: ivrit },
    { name: 'Lean', font: 'Lean', data: lean },
    { name: 'Mini', font: 'Mini', data: mini },
    { name: 'Script', font: 'Script', data: script },
    { name: 'Shadow', font: 'Shadow', data: shadow },
    { name: 'Speed', font: 'Speed', data: speed },
] as const;

export default function AsciiArtPage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [font, setFont] = useState('Standard');
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // 初始化时加载所有字体
    useEffect(() => {
        fontList.forEach(f => {
            figlet.parseFont(f.font, f.data);
        });
        setFontsLoaded(true);
    }, []);

    const generateAsciiArt = useCallback((text: string, fontName: string) => {
        if (!text || !fontsLoaded) {
            setResult('');
            return;
        }

        try {
            const asciiArt = figlet.textSync(text, {
                font: fontName as figlet.Fonts,
            });
            setResult(asciiArt);
        } catch (error) {
            console.error('Figlet error:', error);
            setResult('Error generating ASCII art');
        }
    }, [fontsLoaded]);

    useEffect(() => {
        generateAsciiArt(input, font);
    }, [input, font, generateAsciiArt]);

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
                    <h1 className="tool-title">{t('toolPages.asciiArt.title')}</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label">{t('toolPages.asciiArt.inputText')}</label>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.asciiArt.placeholder')}
                            maxLength={30}
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: '16px' }}>
                        <label className="input-label">{t('toolPages.asciiArt.fontStyle')}</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {fontList.map(f => (
                                <button
                                    key={f.font}
                                    className={`action-btn ${font === f.font ? 'primary' : 'secondary'}`}
                                    onClick={() => setFont(f.font)}
                                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label">{t('toolPages.asciiArt.result')}</label>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <pre
                            style={{
                                background: 'var(--bg-tertiary)',
                                padding: '16px',
                                borderRadius: 'var(--radius)',
                                overflow: 'auto',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.7rem',
                                lineHeight: 1.1,
                                minHeight: '150px',
                                whiteSpace: 'pre',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {result || (language === 'zh' ? 'ASCII艺术字将显示在这里...' : 'ASCII art will appear here...')}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
