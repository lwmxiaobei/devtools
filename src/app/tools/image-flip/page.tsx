'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, FlipHorizontal, FlipVertical, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function ImageFlipPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [flippedImage, setFlippedImage] = useState<string | null>(null);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const applyFlip = useCallback((imgSrc: string, horizontal: boolean, vertical: boolean) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.translate(
                    horizontal ? img.width : 0,
                    vertical ? img.height : 0
                );
                ctx.scale(
                    horizontal ? -1 : 1,
                    vertical ? -1 : 1
                );
                ctx.drawImage(img, 0, 0);
                setFlippedImage(canvas.toDataURL('image/png'));
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
            setFlippedImage(imgSrc);
            setFlipH(false);
            setFlipV(false);
        };
        reader.readAsDataURL(file);
    }, [showToast, language]);

    const handleFlipHorizontal = useCallback(() => {
        if (!originalImage) return;
        const newFlipH = !flipH;
        setFlipH(newFlipH);
        applyFlip(originalImage, newFlipH, flipV);
    }, [originalImage, flipH, flipV, applyFlip]);

    const handleFlipVertical = useCallback(() => {
        if (!originalImage) return;
        const newFlipV = !flipV;
        setFlipV(newFlipV);
        applyFlip(originalImage, flipH, newFlipV);
    }, [originalImage, flipH, flipV, applyFlip]);

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
        if (!flippedImage) return;
        const link = document.createElement('a');
        link.download = `flipped_${Date.now()}.png`;
        link.href = flippedImage;
        link.click();
        showToast(t('toolPages.common.downloaded').replace('{name}', 'image'));
    }, [flippedImage, showToast, language]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setFlippedImage(null);
        setFlipH(false);
        setFlipV(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const getStatusText = () => {
        if (!flipH && !flipV) return t('toolPages.imageFlip.noFlip');
        const parts = [];
        if (flipH) parts.push(t('toolPages.imageFlip.horizontal'));
        if (flipV) parts.push(t('toolPages.imageFlip.vertical'));
        return parts.join(' + ');
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
                    <h1 className="tool-title">{t('toolPages.imageFlip.title')}</h1>
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
                        <div className="image-tool-upload-icon flip">
                            <FlipHorizontal size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">{t('toolPages.common.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.common.uploadHint')}</p>
                    </div>
                )}

                {flippedImage && (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header flip">
                                <h3>
                                    <Settings size={20} />
                                    {t('toolPages.imageFlip.controls')}
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 翻转按钮 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageFlip.direction')}</div>
                                    <div className="flip-button-group">
                                        <button
                                            className={`flip-button ${flipH ? 'active' : ''}`}
                                            onClick={handleFlipHorizontal}
                                        >
                                            <FlipHorizontal size={22} />
                                            {t('toolPages.imageFlip.horizontal')}
                                        </button>
                                        <button
                                            className={`flip-button ${flipV ? 'active' : ''}`}
                                            onClick={handleFlipVertical}
                                        >
                                            <FlipVertical size={22} />
                                            {t('toolPages.imageFlip.vertical')}
                                        </button>
                                    </div>
                                </div>

                                {/* 状态显示 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageFlip.status')}</div>
                                    <div className={`flip-status-badge ${(flipH || flipV) ? 'active' : ''}`}>
                                        {getStatusText()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧预览区域 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>{t('toolPages.imageFlip.preview')}</h3>
                                <div className="image-tool-actions">
                                    <button className="image-tool-btn secondary" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.reselect')}
                                    </button>
                                    <button className="image-tool-btn primary flip" onClick={downloadImage}>
                                        <Download size={16} />
                                        {t('toolPages.imageFlip.download')}
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                <div className="image-tool-preview-bg">
                                    <img
                                        src={flippedImage}
                                        alt="Flipped"
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
