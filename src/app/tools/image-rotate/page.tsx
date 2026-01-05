'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, RotateCw, RotateCcw, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function ImageRotatePage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [rotatedImage, setRotatedImage] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();

    const presetAngles = [
        { label: '90°', value: 90 },
        { label: '180°', value: 180 },
        { label: '270°', value: 270 },
    ];

    const applyRotation = useCallback((imgSrc: string, degrees: number) => {
        const img = new window.Image();
        img.onload = () => {
            const radians = (degrees * Math.PI) / 180;
            const sin = Math.abs(Math.sin(radians));
            const cos = Math.abs(Math.cos(radians));

            const newWidth = img.width * cos + img.height * sin;
            const newHeight = img.width * sin + img.height * cos;

            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.translate(newWidth / 2, newHeight / 2);
                ctx.rotate(radians);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                setRotatedImage(canvas.toDataURL('image/png'));
            }
        };
        img.src = imgSrc;
    }, []);

    const processImage = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgSrc = e.target?.result as string;
            setOriginalImage(imgSrc);
            setRotatedImage(imgSrc);
            setRotation(0);
        };
        reader.readAsDataURL(file);
    }, [showToast]);

    const handleRotate = useCallback((degrees: number) => {
        if (!originalImage) return;
        const newRotation = (rotation + degrees + 360) % 360;
        setRotation(newRotation);
        applyRotation(originalImage, newRotation);
    }, [originalImage, rotation, applyRotation]);

    const handleCustomRotation = useCallback((degrees: number) => {
        if (!originalImage) return;
        setRotation(degrees);
        applyRotation(originalImage, degrees);
    }, [originalImage, applyRotation]);

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
        if (!rotatedImage) return;
        const link = document.createElement('a');
        link.download = `rotated_${rotation}deg_${Date.now()}.png`;
        link.href = rotatedImage;
        link.click();
        showToast('图片已下载');
    }, [rotatedImage, rotation, showToast]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setRotatedImage(null);
        setRotation(0);
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
                    <h1 className="tool-title">图片旋转</h1>
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
                        <div className="image-tool-upload-icon rotate">
                            <RotateCw size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">点击或拖拽图片到此处上传</p>
                        <p className="upload-hint">支持 JPG、PNG、GIF 等格式</p>
                    </div>
                )}

                {rotatedImage && (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header rotate">
                                <h3>
                                    <Settings size={20} />
                                    旋转控制
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 快速旋转 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">快速旋转</div>
                                    <div className="rotate-button-group">
                                        <button
                                            className="rotate-button"
                                            onClick={() => handleRotate(-90)}
                                        >
                                            <RotateCcw size={24} />
                                            逆时针 90°
                                        </button>
                                        <button
                                            className="rotate-button cw"
                                            onClick={() => handleRotate(90)}
                                        >
                                            <RotateCw size={24} />
                                            顺时针 90°
                                        </button>
                                    </div>
                                </div>

                                {/* 预设角度 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">预设角度</div>
                                    <div className="preset-angle-group">
                                        {presetAngles.map(angle => (
                                            <button
                                                key={angle.value}
                                                className={`preset-angle-btn ${rotation === angle.value ? 'active' : ''}`}
                                                onClick={() => handleCustomRotation(angle.value)}
                                            >
                                                {angle.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* 自定义角度滑块 */}
                                    <div className="angle-slider-container">
                                        <div className="angle-slider-header">
                                            <span className="angle-slider-label">自定义角度</span>
                                            <span className="angle-slider-value">{rotation}°</span>
                                        </div>
                                        <div className="angle-slider-wrap">
                                            <div
                                                className="angle-slider-track"
                                                style={{ width: `${(rotation / 359) * 100}%` }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="359"
                                                value={rotation}
                                                onChange={(e) => handleCustomRotation(Number(e.target.value))}
                                                className="angle-slider-input"
                                            />
                                        </div>
                                        <div className="angle-slider-ticks">
                                            <span>0°</span>
                                            <span>90°</span>
                                            <span>180°</span>
                                            <span>270°</span>
                                            <span>359°</span>
                                        </div>
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
                                    <button className="image-tool-btn primary rotate" onClick={downloadImage}>
                                        <Download size={16} />
                                        下载图片
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                <div className="image-tool-preview-bg">
                                    <img
                                        src={rotatedImage}
                                        alt="Rotated"
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
