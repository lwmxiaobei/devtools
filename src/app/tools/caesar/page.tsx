'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function CaesarPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [shift, setShift] = useState(13);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const caesarCipher = (text: string, shiftAmount: number): string => {
        return text.split('').map(char => {
            if (/[a-z]/.test(char)) {
                return String.fromCharCode(((char.charCodeAt(0) - 97 + shiftAmount + 26) % 26) + 97);
            }
            if (/[A-Z]/.test(char)) {
                return String.fromCharCode(((char.charCodeAt(0) - 65 + shiftAmount + 26) % 26) + 65);
            }
            return char;
        }).join('');
    };

    useEffect(() => {
        if (!input) { setOutput(''); return; }
        setOutput(caesarCipher(input, shift));
    }, [input, shift]);

    const copyToClipboard = async () => { if (output) { await navigator.clipboard.writeText(output); showToast(t('toolPages.common.copied')); } };
    const clearAll = () => { setInput(''); setOutput(''); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.caesar.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('toolPages.caesar.shift')}:</span>
                        <input type="range" min="-25" max="25" value={shift} onChange={(e) => setShift(parseInt(e.target.value))} style={{ width: '150px' }} />
                        <span style={{ fontWeight: 600, minWidth: '30px' }}>{shift}</span>
                        <button className={`option-btn ${shift === 13 ? 'active' : ''}`} onClick={() => setShift(13)}>ROT13</button>
                    </div>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[1, 3, 5, 7, 13, -1, -3, -13].map(s => (
                        <button key={s} className={`option-btn ${shift === s ? 'active' : ''}`} onClick={() => setShift(s)} style={{ minWidth: '50px' }}>{s > 0 ? `+${s}` : s}</button>
                    ))}
                </div>
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header"><span className="editor-title">{t('toolPages.caesar.input')}</span></div>
                        <textarea className="editor-textarea" placeholder={t('toolPages.caesar.inputPlaceholder')} value={input} onChange={(e) => setInput(e.target.value)} />
                    </div>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.caesar.output')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}><Copy size={14} />{t('toolPages.common.copy')}</button>
                        </div>
                        <textarea className="editor-textarea" readOnly value={output} placeholder={t('toolPages.caesar.resultPlaceholder')} />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
