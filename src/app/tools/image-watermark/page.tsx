'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Type, Move, Palette, CircleDot, Droplets, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' |
    'middle-left' | 'middle-center' | 'middle-right' |
    'bottom-left' | 'bottom-center' | 'bottom-right';

export default function ImageWatermarkPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState('水印文字');
    const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
    const [fontSize, setFontSize] = useState(24);
    const [opacity, setOpacity] = useState(50);
    const [color, setColor] = useState('#ffffff');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // Initial placeholder text in correct language
    if (watermarkText === '水印文字' && language === 'en') {
        setWatermarkText('Watermark');
    } else if (watermarkText === 'Watermark' && language === 'zh') {
        setWatermarkText('水印文字');
    }

    const positions: { id: WatermarkPosition; label: string }[] = [
        { id: 'top-left', label: '↖' },
        { id: 'top-center', label: '↑' },
        { id: 'top-right', label: '↗' },
        { id: 'middle-left', label: '←' },
        { id: 'middle-center', label: '⊙' },
        { id: 'middle-right', label: '→' },
        { id: 'bottom-left', label: '↙' },
        { id: 'bottom-center', label: '↓' },
        { id: 'bottom-right', label: '↘' },
    ];

    const colorPresets = [
        '#ffffff', '#000000', '#ff4757', '#2ed573',
        '#1e90ff', '#ffa502', '#a55eea', '#ff6b81'
    ];

    const applyWatermark = useCallback((
        imgSrc: string,
        text: string,
        pos: WatermarkPosition,
        size: number,
        alpha: number,
        textColor: string
    ) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(img, 0, 0);

                ctx.font = `bold ${size}px Arial, sans-serif`;
                ctx.fillStyle = textColor;
                ctx.globalAlpha = alpha / 100;

                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const textHeight = size;
                const padding = 20;

                let x = padding;
                let y = textHeight + padding;

                if (pos.includes('center')) {
                    x = (img.width - textWidth) / 2;
                } else if (pos.includes('right')) {
                    x = img.width - textWidth - padding;
                }

                if (pos.includes('middle')) {
                    y = (img.height + textHeight) / 2;
                } else if (pos.includes('bottom')) {
                    y = img.height - padding;
                }

                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.fillText(text, x, y);
                setWatermarkedImage(canvas.toDataURL('image/png'));
            }
        };
        img.src = imgSrc;
    }, []);

    const processImage = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast(t('toolPages.common.uploadError'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgSrc = e.target?.result as string;
            setOriginalImage(imgSrc);
            applyWatermark(imgSrc, watermarkText, position, fontSize, opacity, color);
        };
        reader.readAsDataURL(file);
    }, [showToast, watermarkText, position, fontSize, opacity, color, applyWatermark, language]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processImage(file);
    }, [processImage]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImage(file);
    }, [processImage]);

    const downloadImage = useCallback(() => {
        if (!watermarkedImage) return;
        const link = document.createElement('a');
        link.download = `watermarked_${Date.now()}.png`;
        link.href = watermarkedImage;
        link.click();
        showToast(t('toolPages.common.downloaded').replace('{name}', 'image'));
    }, [watermarkedImage, showToast, language]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setWatermarkedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const handleTextChange = (value: string) => {
        setWatermarkText(value);
        if (originalImage) {
            applyWatermark(originalImage, value, position, fontSize, opacity, color);
        }
    };

    const handlePositionChange = (pos: WatermarkPosition) => {
        setPosition(pos);
        if (originalImage) {
            applyWatermark(originalImage, watermarkText, pos, fontSize, opacity, color);
        }
    };

    const handleFontSizeChange = (size: number) => {
        setFontSize(size);
        if (originalImage) {
            applyWatermark(originalImage, watermarkText, position, size, opacity, color);
        }
    };

    const handleOpacityChange = (alpha: number) => {
        setOpacity(alpha);
        if (originalImage) {
            applyWatermark(originalImage, watermarkText, position, fontSize, alpha, color);
        }
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        if (originalImage) {
            applyWatermark(originalImage, watermarkText, position, fontSize, opacity, newColor);
        }
    };

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page watermark-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.imageWatermark.title')}</h1>
                </div>

                {!originalImage && (
                    <div
                        className={`upload-area ${isDragging ? 'dragging' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <div className="watermark-upload-icon">
                            <Upload size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">{t('toolPages.common.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.common.uploadHint')}</p>
                    </div>
                )}

                {watermarkedImage && (
                    <div className="watermark-layout">
                        {/* 左侧设置面板 */}
                        <div className="watermark-settings-panel">
                            <div className="watermark-panel-header">
                                <h3>
                                    <Settings size={20} />
                                    {t('toolPages.imageWatermark.settings')}
                                </h3>
                            </div>
                            <div className="watermark-panel-body">
                                {/* 水印文字 */}
                                <div className="watermark-setting-card">
                                    <div className="watermark-setting-header">
                                        <div className="watermark-setting-icon text">
                                            <Type size={18} />
                                        </div>
                                        <span className="watermark-setting-label">{t('toolPages.imageWatermark.text')}</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={watermarkText}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        className="watermark-text-input"
                                        placeholder={t('toolPages.imageWatermark.textPlaceholder')}
                                    />
                                </div>

                                {/* 位置选择 */}
                                <div className="watermark-setting-card">
                                    <div className="watermark-setting-header">
                                        <div className="watermark-setting-icon position">
                                            <Move size={18} />
                                        </div>
                                        <span className="watermark-setting-label">{t('toolPages.imageWatermark.position')}</span>
                                    </div>
                                    <div className="watermark-position-grid">
                                        {positions.map(pos => (
                                            <button
                                                key={pos.id}
                                                className={`watermark-position-btn ${position === pos.id ? 'active' : ''}`}
                                                onClick={() => handlePositionChange(pos.id)}
                                                title={pos.id}
                                            >
                                                {pos.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 字体大小 */}
                                <div className="watermark-setting-card">
                                    <div className="watermark-setting-header">
                                        <div className="watermark-setting-icon size">
                                            <CircleDot size={18} />
                                        </div>
                                        <span className="watermark-setting-label">{t('toolPages.imageWatermark.fontSize')}</span>
                                        <span className="watermark-setting-value">{fontSize}px</span>
                                    </div>
                                    <div className="watermark-slider-container">
                                        <div
                                            className="watermark-slider-track"
                                            style={{ width: `${((fontSize - 12) / 60) * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="12"
                                            max="72"
                                            value={fontSize}
                                            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                                            className="watermark-slider"
                                        />
                                    </div>
                                    <div className="watermark-slider-labels">
                                        <span>12px</span>
                                        <span>72px</span>
                                    </div>
                                </div>

                                {/* 透明度 */}
                                <div className="watermark-setting-card">
                                    <div className="watermark-setting-header">
                                        <div className="watermark-setting-icon opacity">
                                            <Droplets size={18} />
                                        </div>
                                        <span className="watermark-setting-label">{t('toolPages.imageWatermark.opacity')}</span>
                                        <span className="watermark-setting-value">{opacity}%</span>
                                    </div>
                                    <div className="watermark-slider-container">
                                        <div
                                            className="watermark-slider-track"
                                            style={{ width: `${((opacity - 10) / 90) * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            value={opacity}
                                            onChange={(e) => handleOpacityChange(Number(e.target.value))}
                                            className="watermark-slider"
                                        />
                                    </div>
                                    <div className="watermark-slider-labels">
                                        <span>10%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* 颜色选择 */}
                                <div className="watermark-setting-card">
                                    <div className="watermark-setting-header">
                                        <div className="watermark-setting-icon color">
                                            <Palette size={18} />
                                        </div>
                                        <span className="watermark-setting-label">{t('toolPages.imageWatermark.color')}</span>
                                    </div>
                                    <div className="watermark-color-row">
                                        <div
                                            className="watermark-color-preview"
                                            style={{ backgroundColor: color }}
                                        >
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => handleColorChange(e.target.value)}
                                            />
                                        </div>
                                        <span className="watermark-color-value">{color.toUpperCase()}</span>
                                    </div>
                                    <div className="watermark-color-presets">
                                        {colorPresets.map(c => (
                                            <button
                                                key={c}
                                                className={`watermark-color-preset ${color === c ? 'active' : ''}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => handleColorChange(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧预览区域 */}
                        <div className="watermark-preview-panel">
                            <div className="watermark-preview-header">
                                <h3>{t('toolPages.imageWatermark.preview')}</h3>
                                <div className="watermark-action-buttons">
                                    <button className="watermark-action-btn secondary" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.reselect')}
                                    </button>
                                    <button className="watermark-action-btn primary" onClick={downloadImage}>
                                        <Download size={16} />
                                        {t('toolPages.imageWatermark.download')}
                                    </button>
                                </div>
                            </div>
                            <div className="watermark-preview-body">
                                <div className="watermark-preview-bg">
                                    <img
                                        src={watermarkedImage}
                                        alt="Watermarked"
                                        className="watermark-preview-image"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
