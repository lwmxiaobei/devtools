'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Copy, QrCode, Settings, Palette } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import QRCode from 'qrcode';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function QRCodeGeneratePage() {
    const [text, setText] = useState('https://example.com');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [size, setSize] = useState(256);
    const [darkColor, setDarkColor] = useState('#000000');
    const [lightColor, setLightColor] = useState('#FFFFFF');
    const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const generateQRCode = useCallback(async () => {
        if (!text.trim()) {
            setQrCodeUrl('');
            return;
        }
        try {
            const url = await QRCode.toDataURL(text, {
                width: size,
                margin: 2,
                color: {
                    dark: darkColor,
                    light: lightColor,
                },
                errorCorrectionLevel: errorLevel,
            });
            setQrCodeUrl(url);
        } catch {
            showToast(t('toolPages.qrCodeGenerate.generateError'));
        }
    }, [text, size, darkColor, lightColor, errorLevel, showToast, language]);

    useEffect(() => {
        generateQRCode();
    }, [generateQRCode]);

    const downloadQRCode = useCallback(() => {
        if (!qrCodeUrl) return;
        const link = document.createElement('a');
        link.download = `qrcode_${Date.now()}.png`;
        link.href = qrCodeUrl;
        link.click();
        showToast(t('toolPages.common.downloaded').replace('{name}', 'QR code'));
    }, [qrCodeUrl, showToast, language]);

    const copyQRCode = useCallback(async () => {
        if (!qrCodeUrl) return;
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            showToast(t('toolPages.common.copied'));
        } catch {
            showToast(t('toolPages.common.copyError'));
        }
    }, [qrCodeUrl, showToast, language]);

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page image-tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.qrCodeGenerate.title')}</h1>
                </div>

                <div className="image-tool-layout">
                    {/* 左侧控制面板 */}
                    <div className="image-tool-panel">
                        <div className="image-tool-panel-header qrcode">
                            <h3>
                                <Settings size={20} />
                                {t('toolPages.qrCodeGenerate.settings')}
                            </h3>
                        </div>
                        <div className="image-tool-panel-body">
                            {/* 内容输入 */}
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.qrCodeGenerate.content')}</div>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={t('toolPages.qrCodeGenerate.placeholder')}
                                    className="qrcode-textarea"
                                    rows={4}
                                />
                            </div>

                            {/* 尺寸设置 */}
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.qrCodeGenerate.size')}</div>
                                <div className="qrcode-size-btns">
                                    {[128, 256, 384, 512].map((s) => (
                                        <button
                                            key={s}
                                            className={`qrcode-size-btn ${size === s ? 'active' : ''}`}
                                            onClick={() => setSize(s)}
                                        >
                                            {s}px
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 颜色设置 */}
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.qrCodeGenerate.color')}</div>
                                <div className="qrcode-color-row">
                                    <div className="qrcode-color-item">
                                        <span>{t('toolPages.qrCodeGenerate.foreground')}</span>
                                        <div className="qrcode-color-picker" style={{ backgroundColor: darkColor }}>
                                            <input
                                                type="color"
                                                value={darkColor}
                                                onChange={(e) => setDarkColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="qrcode-color-item">
                                        <span>{t('toolPages.qrCodeGenerate.background')}</span>
                                        <div className="qrcode-color-picker" style={{ backgroundColor: lightColor }}>
                                            <input
                                                type="color"
                                                value={lightColor}
                                                onChange={(e) => setLightColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 容错级别 */}
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.qrCodeGenerate.errorLevel')}</div>
                                <div className="qrcode-error-btns">
                                    {[
                                        { value: 'L', label: 'L - 7%' },
                                        { value: 'M', label: 'M - 15%' },
                                        { value: 'Q', label: 'Q - 25%' },
                                        { value: 'H', label: 'H - 30%' },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            className={`qrcode-error-btn ${errorLevel === item.value ? 'active' : ''}`}
                                            onClick={() => setErrorLevel(item.value as 'L' | 'M' | 'Q' | 'H')}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右侧预览区域 */}
                    <div className="image-tool-preview">
                        <div className="image-tool-preview-header">
                            <h3>{t('toolPages.qrCodeGenerate.preview')}</h3>
                            <div className="image-tool-actions">
                                <button className="image-tool-btn secondary" onClick={copyQRCode} disabled={!qrCodeUrl}>
                                    <Copy size={16} />
                                    {t('toolPages.common.copy')}
                                </button>
                                <button className="image-tool-btn primary qrcode" onClick={downloadQRCode} disabled={!qrCodeUrl}>
                                    <Download size={16} />
                                    {t('toolPages.common.download')}
                                </button>
                            </div>
                        </div>
                        <div className="image-tool-preview-body">
                            <div className="qrcode-preview-container" style={{ backgroundColor: lightColor }}>
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="qrcode-preview-img" />
                                ) : (
                                    <div className="qrcode-placeholder">
                                        <QrCode size={48} strokeWidth={1} />
                                        <p>{t('toolPages.qrCodeGenerate.placeholder')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
