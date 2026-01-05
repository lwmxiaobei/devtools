'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, User, Settings, Palette } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

const bgColors = [
    { name: '白色', value: '#FFFFFF' },
    { name: '蓝色', value: '#438EDB' },
    { name: '红色', value: '#D03B39' },
    { name: '渐变蓝', value: '#1E90FF' },
    { name: '灰色', value: '#CCCCCC' },
];

export default function IdPhotoBgPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState('#438EDB');
    const [isDragging, setIsDragging] = useState(false);
    const [tolerance, setTolerance] = useState(30);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();

    const processImage = useCallback((imageSrc: string, bgColor: string, toleranceValue: number) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : { r: 255, g: 255, b: 255 };
                };

                const newBg = hexToRgb(bgColor);

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const isBackground = (r > 200 - toleranceValue && g > 200 - toleranceValue && b > 200 - toleranceValue) ||
                        (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20 && r > 150 - toleranceValue);

                    if (isBackground) {
                        data[i] = newBg.r;
                        data[i + 1] = newBg.g;
                        data[i + 2] = newBg.b;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                setProcessedImage(canvas.toDataURL('image/png'));
            }
        };
        img.src = imageSrc;
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setOriginalImage(result);
            processImage(result, selectedColor, tolerance);
        };
        reader.readAsDataURL(file);
    }, [processImage, selectedColor, tolerance, showToast]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleColorChange = useCallback((color: string) => {
        setSelectedColor(color);
        if (originalImage) {
            processImage(originalImage, color, tolerance);
        }
    }, [originalImage, processImage, tolerance]);

    const handleToleranceChange = useCallback((value: number) => {
        setTolerance(value);
        if (originalImage) {
            processImage(originalImage, selectedColor, value);
        }
    }, [originalImage, processImage, selectedColor]);

    const downloadImage = useCallback(() => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.download = `id_photo_${Date.now()}.png`;
        link.href = processedImage;
        link.click();
        showToast('图片已下载');
    }, [processedImage, showToast]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setProcessedImage(null);
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
                    <h1 className="tool-title">证件照背景</h1>
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
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        <div className="image-tool-upload-icon idphoto">
                            <User size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">点击或拖拽证件照到此处上传</p>
                        <p className="upload-hint">支持 JPG、PNG 格式，建议使用白色背景的证件照</p>
                    </div>
                )}

                {processedImage && (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header idphoto">
                                <h3>
                                    <Settings size={20} />
                                    背景设置
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 背景颜色 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">选择背景颜色</div>
                                    <div className="idphoto-color-grid">
                                        {bgColors.map((color) => (
                                            <button
                                                key={color.value}
                                                className={`idphoto-color-btn ${selectedColor === color.value ? 'active' : ''}`}
                                                style={{ backgroundColor: color.value }}
                                                onClick={() => handleColorChange(color.value)}
                                                title={color.name}
                                            >
                                                {selectedColor === color.value && <span className="check">✓</span>}
                                            </button>
                                        ))}
                                        <div className="idphoto-color-picker">
                                            <Palette size={18} />
                                            <input
                                                type="color"
                                                value={selectedColor}
                                                onChange={(e) => handleColorChange(e.target.value)}
                                                title="自定义颜色"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 容差调节 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">背景识别容差</div>
                                    <div className="idphoto-slider-header">
                                        <span className="idphoto-slider-value">{tolerance}</span>
                                    </div>
                                    <div className="idphoto-slider-container">
                                        <div
                                            className="idphoto-slider-track"
                                            style={{ width: `${tolerance}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={tolerance}
                                            onChange={(e) => handleToleranceChange(Number(e.target.value))}
                                            className="idphoto-slider"
                                        />
                                    </div>
                                    <div className="idphoto-slider-labels">
                                        <span>精确</span>
                                        <span>宽松</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧预览区域 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>预览效果</h3>
                                <div className="image-tool-actions">
                                    <button className="image-tool-btn secondary" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        重新选择
                                    </button>
                                    <button className="image-tool-btn primary idphoto" onClick={downloadImage}>
                                        <Download size={16} />
                                        下载图片
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                <div className="image-tool-preview-bg">
                                    <img
                                        src={processedImage}
                                        alt="Processed"
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
