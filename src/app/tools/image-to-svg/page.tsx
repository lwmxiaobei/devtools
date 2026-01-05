'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, FileImage, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function ImageToSvgPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [svgOutput, setSvgOutput] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [threshold, setThreshold] = useState(128);
    const [blur, setBlur] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const imageToSvg = useCallback((imageSrc: string, thresholdValue: number, blurValue: number) => {
        setIsProcessing(true);

        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 500 / Math.max(img.width, img.height));
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                if (blurValue > 0) {
                    ctx.filter = `blur(${blurValue}px)`;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const bwData: boolean[][] = [];
                for (let y = 0; y < canvas.height; y++) {
                    bwData[y] = [];
                    for (let x = 0; x < canvas.width; x++) {
                        const idx = (y * canvas.width + x) * 4;
                        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                        bwData[y][x] = brightness < thresholdValue;
                    }
                }

                let paths = '';
                const visited = new Set<string>();

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        if (bwData[y][x] && !visited.has(`${x},${y}`)) {
                            let width = 0;
                            while (x + width < canvas.width && bwData[y][x + width]) {
                                visited.add(`${x + width},${y}`);
                                width++;
                            }
                            if (width > 0) {
                                paths += `<rect x="${x}" y="${y}" width="${width}" height="1" />`;
                            }
                        }
                    }
                }

                const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">
  <g fill="currentColor">
    ${paths}
  </g>
</svg>`;

                setSvgOutput(svg);
                setIsProcessing(false);
            }
        };
        img.src = imageSrc;
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast(t('toolPages.common.uploadError'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setOriginalImage(result);
            imageToSvg(result, threshold, blur);
        };
        reader.readAsDataURL(file);
    }, [imageToSvg, threshold, blur, showToast, language]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleThresholdChange = useCallback((value: number) => {
        setThreshold(value);
        if (originalImage) {
            imageToSvg(originalImage, value, blur);
        }
    }, [originalImage, imageToSvg, blur]);

    const handleBlurChange = useCallback((value: number) => {
        setBlur(value);
        if (originalImage) {
            imageToSvg(originalImage, threshold, value);
        }
    }, [originalImage, imageToSvg, threshold]);

    const downloadSvg = useCallback(() => {
        if (!svgOutput) return;
        const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `converted_${Date.now()}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showToast(t('toolPages.common.downloaded').replace('{name}', 'SVG'));
    }, [svgOutput, showToast, language]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setSvgOutput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page image-tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.imageToSvg.title')}</h1>
                </div>

                {!originalImage ? (
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
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        <div className="image-tool-upload-icon svg">
                            <FileImage size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">{t('toolPages.common.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.imageToSvg.uploadHint')}</p>
                    </div>
                ) : (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header svg">
                                <h3>
                                    <Settings size={20} />
                                    {t('toolPages.imageToSvg.settings')}
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 阈值设置 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageToSvg.threshold')}</div>
                                    <div className="svg-slider-header">
                                        <span className="svg-slider-value">{threshold}</span>
                                    </div>
                                    <div className="svg-slider-container">
                                        <div
                                            className="svg-slider-track"
                                            style={{ width: `${(threshold / 255) * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="255"
                                            value={threshold}
                                            onChange={(e) => handleThresholdChange(Number(e.target.value))}
                                            className="svg-slider"
                                        />
                                    </div>
                                    <div className="svg-slider-labels">
                                        <span>0</span>
                                        <span>255</span>
                                    </div>
                                </div>

                                {/* 模糊设置 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageToSvg.smoothness')}</div>
                                    <div className="svg-slider-header">
                                        <span className="svg-slider-value">{blur}px</span>
                                    </div>
                                    <div className="svg-slider-container">
                                        <div
                                            className="svg-slider-track"
                                            style={{ width: `${(blur / 5) * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="5"
                                            step="0.5"
                                            value={blur}
                                            onChange={(e) => handleBlurChange(Number(e.target.value))}
                                            className="svg-slider"
                                        />
                                    </div>
                                    <div className="svg-slider-labels">
                                        <span>{t('toolPages.imageToSvg.sharp')}</span>
                                        <span>{t('toolPages.imageToSvg.smooth')}</span>
                                    </div>
                                </div>

                                {/* 原图预览 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.imageToSvg.original')}</div>
                                    <div className="svg-original-preview">
                                        <img src={originalImage} alt="Original" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧预览区域 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>{t('toolPages.imageToSvg.preview')}</h3>
                                <div className="image-tool-actions">
                                    <button className="image-tool-btn secondary" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.reselect')}
                                    </button>
                                    <button className="image-tool-btn primary svg" onClick={downloadSvg} disabled={isProcessing}>
                                        <Download size={16} />
                                        {t('toolPages.imageToSvg.download')}
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                {isProcessing ? (
                                    <div className="svg-loading">
                                        <div className="spinner"></div>
                                        <p>{t('toolPages.imageToSvg.converting')}</p>
                                    </div>
                                ) : (
                                    <div className="svg-preview-container">
                                        <div
                                            className="svg-preview"
                                            dangerouslySetInnerHTML={{ __html: svgOutput }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
