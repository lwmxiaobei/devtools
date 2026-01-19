'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function PunycodePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const encodePunycode = (domain: string): string => {
        try {
            const url = new URL(`http://${domain}`);
            return url.hostname;
        } catch {
            const parts = domain.split('.');
            return parts.map(part => {
                if (/^[\x00-\x7F]*$/.test(part)) return part;
                return 'xn--' + punyEncode(part);
            }).join('.');
        }
    };

    const decodePunycode = (domain: string): string => {
        const parts = domain.split('.');
        return parts.map(part => {
            if (part.toLowerCase().startsWith('xn--')) {
                return punyDecode(part.slice(4));
            }
            return part;
        }).join('.');
    };

    const punyEncode = (input: string): string => {
        const base = 36, tmin = 1, tmax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128;
        let n = initialN, delta = 0, bias = initialBias;
        const output: string[] = [];
        const basicChars = input.split('').filter(c => c.charCodeAt(0) < 128);
        output.push(...basicChars);
        let handled = basicChars.length;
        if (handled > 0) output.push('-');
        
        const inputCodes = Array.from(input).map(c => c.codePointAt(0) || 0);
        
        while (handled < inputCodes.length) {
            let m = Infinity;
            for (const code of inputCodes) {
                if (code >= n && code < m) m = code;
            }
            delta += (m - n) * (handled + 1);
            n = m;
            
            for (const code of inputCodes) {
                if (code < n) delta++;
                if (code === n) {
                    let q = delta;
                    for (let k = base; ; k += base) {
                        const t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
                        if (q < t) break;
                        output.push(String.fromCharCode(t + ((q - t) % (base - t)) < 26 ? 97 + t + ((q - t) % (base - t)) : 22 + t + ((q - t) % (base - t))));
                        q = Math.floor((q - t) / (base - t));
                    }
                    output.push(String.fromCharCode(q < 26 ? 97 + q : 22 + q));
                    bias = adapt(delta, handled + 1, handled === basicChars.length);
                    delta = 0;
                    handled++;
                }
            }
            delta++;
            n++;
        }
        return output.join('');
    };

    const punyDecode = (input: string): string => {
        const base = 36, tmin = 1, tmax = 26, initialBias = 72, initialN = 128;
        let n = initialN, i = 0, bias = initialBias;
        const output: number[] = [];
        
        let basic = input.lastIndexOf('-');
        if (basic < 0) basic = 0;
        
        for (let j = 0; j < basic; j++) {
            output.push(input.charCodeAt(j));
        }
        
        for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length;) {
            const oldi = i;
            let w = 1;
            for (let k = base; ; k += base) {
                const c = input.charCodeAt(idx++);
                const digit = c >= 97 ? c - 97 : c >= 48 ? c - 22 : 0;
                i += digit * w;
                const t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
                if (digit < t) break;
                w *= base - t;
            }
            bias = adapt(i - oldi, output.length + 1, oldi === 0);
            n += Math.floor(i / (output.length + 1));
            i %= output.length + 1;
            output.splice(i++, 0, n);
        }
        return String.fromCodePoint(...output);
    };

    const adapt = (delta: number, numPoints: number, firstTime: boolean): number => {
        delta = firstTime ? Math.floor(delta / 700) : delta >> 1;
        delta += Math.floor(delta / numPoints);
        let k = 0;
        while (delta > 455) { delta = Math.floor(delta / 35); k += 36; }
        return k + Math.floor(36 * delta / (delta + 38));
    };

    useEffect(() => {
        if (!input) { setOutput(''); setError(''); return; }
        try {
            const result = mode === 'encode' ? encodePunycode(input) : decodePunycode(input);
            setOutput(result); setError('');
        } catch (e) { setError(`${t('toolPages.common.error')}: ${(e as Error).message}`); setOutput(''); }
    }, [input, mode, language]);

    const copyToClipboard = async () => { if (output) { await navigator.clipboard.writeText(output); showToast(t('toolPages.common.copied')); } };
    const clearAll = () => { setInput(''); setOutput(''); setError(''); };
    const swapInputOutput = () => { setInput(output); setOutput(''); setMode(mode === 'encode' ? 'decode' : 'encode'); };

    return (
        <>
            <Header /><ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn"><ArrowLeft size={20} /></Link>
                    <h1 className="tool-title">{t('toolPages.punycode.title')}</h1>
                </div>
                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button className={`option-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => setMode('encode')}>{t('toolPages.common.encode')}</button>
                        <button className={`option-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => setMode('decode')}>{t('toolPages.common.decode')}</button>
                    </div>
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}><ArrowRightLeft size={18} />{t('toolPages.common.swap')}</button>
                    <button className="action-btn secondary" onClick={clearAll}><Trash2 size={18} />{t('toolPages.common.clear')}</button>
                </div>
                {error && <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</div>}
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header"><span className="editor-title">{mode === 'encode' ? t('toolPages.punycode.domainInput') : t('toolPages.punycode.punycodeInput')}</span></div>
                        <textarea className="editor-textarea" placeholder={mode === 'encode' ? t('toolPages.punycode.domainPlaceholder') : t('toolPages.punycode.punycodePlaceholder')} value={input} onChange={(e) => setInput(e.target.value)} />
                    </div>
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{mode === 'encode' ? t('toolPages.punycode.punycodeOutput') : t('toolPages.punycode.domainOutput')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}><Copy size={14} />{t('toolPages.common.copy')}</button>
                        </div>
                        <textarea className="editor-textarea" readOnly value={output} placeholder={t('toolPages.punycode.resultPlaceholder')} />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
