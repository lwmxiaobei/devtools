'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, FlipHorizontal, FlipVertical, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function ImageFlipPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [flippedImage, setFlippedImage] = useState<string | null>(null);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();

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
            showToast('请上传图片文件');
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
    }, [showToast]);

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
        showToast('图片已下载');
    }, [flippedImage, showToast]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setFlippedImage(null);
        setFlipH(false);
        setFlipV(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const getStatusText = () => {
        if (!flipH && !flipV) return '未翻转';
        const parts = [];
        if (flipH) parts.push('水平翻转');
        if (flipV) parts.push('垂直翻转');
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
                    <h1 className="tool-title">图片翻转</h1>
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
                        <p className="upload-text">点击或拖拽图片到此处上传</p>
                        <p className="upload-hint">支持 JPG、PNG、GIF 等格式</p>
                    </div>
                )}

                {flippedImage && (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header flip">
                                <h3>
                                    <Settings size={20} />
                                    翻转控制
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 翻转按钮 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">翻转方向</div>
                                    <div className="flip-button-group">
                                        <button
                                            className={`flip-button ${flipH ? 'active' : ''}`}
                                            onClick={handleFlipHorizontal}
                                        >
                                            <FlipHorizontal size={22} />
                                            水平翻转
                                        </button>
                                        <button
                                            className={`flip-button ${flipV ? 'active' : ''}`}
                                            onClick={handleFlipVertical}
                                        >
                                            <FlipVertical size={22} />
                                            垂直翻转
                                        </button>
                                    </div>
                                </div>

                                {/* 状态显示 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">当前状态</div>
                                    <div className={`flip-status-badge ${(flipH || flipV) ? 'active' : ''}`}>
                                        {getStatusText()}
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
                                    <button className="image-tool-btn primary flip" onClick={downloadImage}>
                                        <Download size={16} />
                                        下载图片
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
