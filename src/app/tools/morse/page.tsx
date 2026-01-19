'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft, Volume2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

const MORSE_CODE: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k]));

export default function MorsePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const textToMorse = (text: string): string => {
        return text.toUpperCase().split('').map(char => MORSE_CODE[char] || char).join(' ');
    };

    const morseToText = (morse: string): string => {
        return morse.split(' ').map(code => {
            if (code === '/') return ' ';
            return REVERSE_MORSE[code] || code;
        }).join('');
    };

    useEffect(() => {
        if (!input) { setOutput(''); setError(''); return; }
        try {
            const result = mode === 'encode' ? textToMorse(input) : morseToText(input);
            setOutput(result); setError('');
        } catch (e) { setError(`${t('toolPages.common.error')}: ${(e as Error).message}`); setOutput(''); }
    }, [input, mode, language]);

    const playMorse = () => {
        if (!output || mode !== 'encode') return;
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        let time = audioCtx.currentTime;
        const dot = 0.1, dash = 0.3, gap = 0.1, letterGap = 0.3, wordGap = 0.7;
        
        output.split('').forEach(char => {
            if (char === '.') {
                const osc = audioCtx.createOscillator(); osc.frequency.value = 600;
                osc.connect(audioCtx.destination); osc.start(time); osc.stop(time + dot); time += dot + gap;
            } else if (char === '-') {
                const osc = audioCtx.createOscillator(); osc.frequency.value = 600;
                osc.connect(audioCtx.destination); osc.start(time); osc.stop(time + dash); time += dash + gap;
            } else if (char === ' ') { time += letterGap; }
            else if (char === '/') { time += wordGap; }
        });
    };

    const copyToClipboard = async () => { if (output) { await navigator.clipboard.writeText(output); showToast(t('toolPages.common.copied')); } };
    const clearAll = () => { setInput(''); setOutput(''); setError(''); };
    const swapInputOutput = () => { setInput(output); setOutput(''); setMode(mode === 'encode' ? 'decode' : 'encode'); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.morse.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button className={`option-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => setMode('encode')}>{t('toolPages.morse.textToMorse')}</button>
                        <button className={`option-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => setMode('decode')}>{t('toolPages.morse.morseToText')}</button>
                    </div>
                    {mode === 'encode' && output && <button className="action-btn secondary" onClick={playMorse}><Volume2 size={18} />{t('toolPages.morse.play')}</button>}
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}><ArrowRightLeft size={18} />{t('toolPages.common.swap')}</button>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                {error && <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</div>}
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header"><span className="editor-title">{mode === 'encode' ? t('toolPages.morse.textInput') : t('toolPages.morse.morseInput')}</span></div>
                        <textarea className="editor-textarea" placeholder={mode === 'encode' ? t('toolPages.morse.textPlaceholder') : t('toolPages.morse.morsePlaceholder')} value={input} onChange={(e) => setInput(e.target.value)} />
                    </div>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{mode === 'encode' ? t('toolPages.morse.morseOutput') : t('toolPages.morse.textOutput')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}><Copy size={14} />{t('toolPages.common.copy')}</button>
                        </div>
                        <textarea className="editor-textarea" readOnly value={output} placeholder={t('toolPages.morse.resultPlaceholder')} />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
