'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Lock, Unlock, Maximize2, Settings, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function ImageResizePage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [resizedImage, setResizedImage] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
    const [newWidth, setNewWidth] = useState(0);
    const [newHeight, setNewHeight] = useState(0);
    const [lockRatio, setLockRatio] = useState(true);
    const [activePreset, setActivePreset] = useState<number | null>(1);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const presetSizes = [
        { label: '50%', factor: 0.5 },
        { label: '75%', factor: 0.75 },
        { label: '100%', factor: 1 },
        { label: '150%', factor: 1.5 },
        { label: '200%', factor: 2 },
    ];

    const processImage = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast(t('toolPages.common.uploadError'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                setOriginalSize({ width: img.width, height: img.height });
                setNewWidth(img.width);
                setNewHeight(img.height);
                setOriginalImage(e.target?.result as string);
                setResizedImage(e.target?.result as string);
                setActivePreset(1);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }, [showToast, language]);

    const applyResize = useCallback((width: number, height: number) => {
        if (!originalImage) return;

        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                setResizedImage(canvas.toDataURL('image/png'));
            }
        };
        img.src = originalImage;
    }, [originalImage]);

    const handleWidthChange = useCallback((value: number) => {
        setNewWidth(value);
        setActivePreset(null);
        if (lockRatio && originalSize.width > 0) {
            const ratio = originalSize.height / originalSize.width;
            const calculatedHeight = Math.round(value * ratio);
            setNewHeight(calculatedHeight);
            applyResize(value, calculatedHeight);
        } else {
            applyResize(value, newHeight);
        }
    }, [lockRatio, originalSize, newHeight, applyResize]);

    const handleHeightChange = useCallback((value: number) => {
        setNewHeight(value);
        setActivePreset(null);
        if (lockRatio && originalSize.height > 0) {
            const ratio = originalSize.width / originalSize.height;
            const calculatedWidth = Math.round(value * ratio);
            setNewWidth(calculatedWidth);
            applyResize(calculatedWidth, value);
        } else {
            applyResize(newWidth, value);
        }
    }, [lockRatio, originalSize, newWidth, applyResize]);

    const handlePresetSize = useCallback((factor: number, index: number) => {
        const width = Math.round(originalSize.width * factor);
        const height = Math.round(originalSize.height * factor);
        setNewWidth(width);
        setNewHeight(height);
        setActivePreset(factor);
        applyResize(width, height);
    }, [originalSize, applyResize]);

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
        if (!resizedImage) return;
        const link = document.createElement('a');
        link.download = `resized_${newWidth}x${newHeight}_${Date.now()}.png`;
        link.href = resizedImage;
        link.click();
        showToast(t('toolPages.common.downloaded').replace('{name}', 'image'));
    }, [resizedImage, newWidth, newHeight, showToast, language]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setResizedImage(null);
        setOriginalSize({ width: 0, height: 0 });
        setNewWidth(0);
        setNewHeight(0);
        setActivePreset(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const getScalePercent = () => {
        if (originalSize.width === 0) return 100;
        return Math.round((newWidth / originalSize.width) * 100);
    };

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page image-tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.imageResize.title')}</h1>
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
                        <div className="image-tool-upload-icon resize">
                            <Maximize2 size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">{t('toolPages.common.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.common.uploadHint')}</p>
                    </div>
                )}

                {resizedImage && (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header resize-panel-header">
                                <h3>
                                    <Settings size={20} />
                                    {t('toolPages.imageResize.settings')}
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 原始尺寸 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageResize.originalSize')}</div>
                                    <div className="resize-original-size">
                                        <span className="resize-original-size-value">
                                            {originalSize.width} × {originalSize.height} px
                                        </span>
                                    </div>
                                </div>

                                {/* 预设比例 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageResize.quickScale')}</div>
                                    <div className="resize-preset-group">
                                        {presetSizes.map((preset, index) => (
                                            <button
                                                key={preset.label}
                                                className={`resize-preset-btn ${activePreset === preset.factor ? 'active' : ''}`}
                                                onClick={() => handlePresetSize(preset.factor, index)}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* 自定义尺寸 */}
                                    <div className="resize-size-controls">
                                        <div className="resize-size-input-group">
                                            <label className="resize-size-label">{t('toolPages.imageResize.width')} (px)</label>
                                            <input
                                                type="number"
                                                value={newWidth}
                                                onChange={(e) => handleWidthChange(Number(e.target.value))}
                                                min="1"
                                                className="resize-size-input"
                                            />
                                        </div>

                                        <div className="resize-lock-btn-wrap">
                                            <button
                                                className={`resize-lock-btn ${lockRatio ? 'active' : ''}`}
                                                onClick={() => setLockRatio(!lockRatio)}
                                                title={lockRatio ? t('toolPages.imageResize.unlockRatio') : t('toolPages.imageResize.lockRatio')}
                                            >
                                                {lockRatio ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>
                                        </div>

                                        <div className="resize-size-input-group">
                                            <label className="resize-size-label">{t('toolPages.imageResize.height')} (px)</label>
                                            <input
                                                type="number"
                                                value={newHeight}
                                                onChange={(e) => handleHeightChange(Number(e.target.value))}
                                                min="1"
                                                className="resize-size-input"
                                            />
                                        </div>
                                    </div>

                                    {/* 新尺寸显示 */}
                                    <div className="resize-new-size">
                                        <span className="resize-new-size-label">{t('toolPages.imageResize.outputSize')}</span>
                                        <ArrowRight size={16} className="resize-new-size-arrow" />
                                        <span className="resize-new-size-value">
                                            {newWidth} × {newHeight} px
                                        </span>
                                    </div>

                                    <div className="resize-scale-info">
                                        {t('toolPages.imageResize.currentScale')}: <span className="resize-scale-percent">{getScalePercent()}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧预览区域 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>{t('toolPages.imageResize.preview')}</h3>
                                <div className="image-tool-actions">
                                    <button className="image-tool-btn secondary" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.reselect')}
                                    </button>
                                    <button className="image-tool-btn primary resize" onClick={downloadImage}>
                                        <Download size={16} />
                                        {t('toolPages.imageResize.download')}
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                <div className="image-tool-preview-bg">
                                    <img
                                        src={resizedImage}
                                        alt="Resized"
                                        className="image-tool-preview-img"
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
