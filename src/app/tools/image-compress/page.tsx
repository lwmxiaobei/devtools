'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function ImageCompressPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [compressedImage, setCompressedImage] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number>(0);
    const [quality, setQuality] = useState<number>(80);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const compressImage = useCallback((file: File, qualityValue: number) => {
        setIsProcessing(true);
        setOriginalSize(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', qualityValue / 100);

                    // Calculate compressed size
                    const base64Str = compressedDataUrl.split(',')[1];
                    const compressedBytes = Math.round((base64Str.length * 3) / 4);

                    setOriginalImage(e.target?.result as string);
                    setCompressedImage(compressedDataUrl);
                    setCompressedSize(compressedBytes);
                    setIsProcessing(false);
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }, []);

    const processImage = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }
        compressImage(file, quality);
    }, [compressImage, quality, showToast]);

    const handleQualityChange = useCallback((newQuality: number) => {
        setQuality(newQuality);
        if (originalImage) {
            // Re-compress with new quality
            fetch(originalImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                    compressImage(file, newQuality);
                });
        }
    }, [originalImage, compressImage]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processImage(file);
        }
    }, [processImage]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    }, [processImage]);

    const downloadImage = useCallback(() => {
        if (!compressedImage) return;
        const link = document.createElement('a');
        link.download = `compressed_${Date.now()}.jpg`;
        link.href = compressedImage;
        link.click();
        showToast('图片已下载');
    }, [compressedImage, showToast]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setCompressedImage(null);
        setOriginalSize(0);
        setCompressedSize(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const compressionRatio = originalSize > 0
        ? Math.round((1 - compressedSize / originalSize) * 100)
        : 0;

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">图片压缩</h1>
                </div>

                {!originalImage && (
                    <div
                        className={`upload-area ${isDragging ? 'dragging' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <Upload size={48} strokeWidth={1.5} />
                        <p className="upload-text">点击或拖拽图片到此处上传</p>
                        <p className="upload-hint">支持 JPG、PNG、GIF 等格式</p>
                    </div>
                )}

                {isProcessing && (
                    <div className="processing-indicator">
                        <div className="spinner"></div>
                        <p>正在压缩图片...</p>
                    </div>
                )}

                {compressedImage && !isProcessing && (
                    <>
                        <div className="compress-settings">
                            <div className="quality-control">
                                <label>
                                    <Settings size={16} />
                                    压缩质量: {quality}%
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                                    className="quality-slider"
                                />
                            </div>
                        </div>

                        <div className="compress-stats">
                            <div className="stat-item">
                                <span className="stat-label">原始大小</span>
                                <span className="stat-value">{formatFileSize(originalSize)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">压缩后</span>
                                <span className="stat-value">{formatFileSize(compressedSize)}</span>
                            </div>
                            <div className="stat-item highlight">
                                <span className="stat-label">节省</span>
                                <span className="stat-value">{compressionRatio}%</span>
                            </div>
                        </div>

                        <div className="image-preview-container">
                            <div className="image-preview">
                                <h3>压缩后预览</h3>
                                <img src={compressedImage} alt="Compressed" />
                            </div>
                        </div>

                        <div className="action-row">
                            <button className="action-btn secondary" onClick={clearAll}>
                                <Trash2 size={18} />
                                重新选择
                            </button>
                            <button className="action-btn primary" onClick={downloadImage}>
                                <Download size={18} />
                                下载压缩图片
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />

            <style jsx>{`
                .compress-settings {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .quality-control {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .quality-control label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    color: var(--text-primary);
                }
                .quality-slider {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: var(--bg-tertiary);
                    outline: none;
                    -webkit-appearance: none;
                }
                .quality-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--primary);
                    cursor: pointer;
                }
                .compress-stats {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px 24px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    min-width: 120px;
                }
                .stat-item.highlight {
                    background: var(--primary);
                    color: white;
                }
                .stat-item.highlight .stat-label,
                .stat-item.highlight .stat-value {
                    color: white;
                }
                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }
                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .image-preview-container {
                    margin-bottom: 20px;
                }
                .image-preview {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                }
                .image-preview h3 {
                    margin: 0 0 12px 0;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .image-preview img {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 8px;
                    display: block;
                    margin: 0 auto;
                }
            `}</style>
        </>
    );
}
