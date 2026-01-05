'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Palette } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function ColorConverterPage() {
    const [hex, setHex] = useState('#10b981');
    const [rgb, setRgb] = useState({ r: 16, g: 185, b: 129 });
    const [hsl, setHsl] = useState({ h: 160, s: 84, l: 39 });
    const { toast, showToast, hideToast } = useToast();

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    };

    const hslToRgb = (h: number, s: number, l: number) => {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    };

    const updateFromHex = (newHex: string) => {
        setHex(newHex);
        const rgbVal = hexToRgb(newHex);
        if (rgbVal) {
            setRgb(rgbVal);
            setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
        }
    };

    const updateFromRgb = (newRgb: { r: number; g: number; b: number }) => {
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    };

    const updateFromHsl = (newHsl: { h: number; s: number; l: number }) => {
        setHsl(newHsl);
        const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        setRgb(rgbVal);
        setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
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
                    <h1 className="tool-title">颜色转换</h1>
                </div>

                <div className="single-panel">
                    {/* 颜色预览 */}
                    <div style={{
                        height: '120px',
                        borderRadius: 'var(--radius)',
                        background: hex,
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Palette size={48} color="white" style={{ opacity: 0.8 }} />
                    </div>

                    {/* 颜色选择器 */}
                    <div className="input-group">
                        <label className="input-label">颜色选择器</label>
                        <input
                            type="color"
                            value={hex}
                            onChange={(e) => updateFromHex(e.target.value)}
                            style={{
                                width: '80px',
                                height: '48px',
                                padding: '4px',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                            }}
                        />
                    </div>

                    {/* HEX */}
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label" style={{ margin: 0 }}>HEX</label>
                            <button className="editor-btn" onClick={() => copyToClipboard(hex)}>
                                <Copy size={14} />
                            </button>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            value={hex}
                            onChange={(e) => updateFromHex(e.target.value)}
                            placeholder="#000000"
                        />
                    </div>

                    {/* RGB */}
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label" style={{ margin: 0 }}>RGB</label>
                            <button className="editor-btn" onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
                                <Copy size={14} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>R</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="255"
                                    value={rgb.r}
                                    onChange={(e) => updateFromRgb({ ...rgb, r: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>G</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="255"
                                    value={rgb.g}
                                    onChange={(e) => updateFromRgb({ ...rgb, g: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>B</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="255"
                                    value={rgb.b}
                                    onChange={(e) => updateFromRgb({ ...rgb, b: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* HSL */}
                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label" style={{ margin: 0 }}>HSL</label>
                            <button className="editor-btn" onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>
                                <Copy size={14} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>H</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="360"
                                    value={hsl.h}
                                    onChange={(e) => updateFromHsl({ ...hsl, h: Math.min(360, Math.max(0, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>S%</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="100"
                                    value={hsl.s}
                                    onChange={(e) => updateFromHsl({ ...hsl, s: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>L%</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="0"
                                    max="100"
                                    value={hsl.l}
                                    onChange={(e) => updateFromHsl({ ...hsl, l: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
