'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Sparkles, Info, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

// Constants for watermark removal
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

// Calculate alpha map from background captured image
function calculateAlphaMap(bgImageData: ImageData): Float32Array {
    const { width, height, data } = bgImageData;
    const alphaMap = new Float32Array(width * height);

    for (let i = 0; i < alphaMap.length; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const maxChannel = Math.max(r, g, b);
        alphaMap[i] = maxChannel / 255.0;
    }

    return alphaMap;
}

// Remove watermark using reverse alpha blending
function removeWatermark(
    imageData: ImageData,
    alphaMap: Float32Array,
    position: { x: number; y: number; width: number; height: number }
): void {
    const { x, y, width, height } = position;

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
            const alphaIdx = row * width + col;

            let alpha = alphaMap[alphaIdx];

            if (alpha < ALPHA_THRESHOLD) {
                continue;
            }

            alpha = Math.min(alpha, MAX_ALPHA);
            const oneMinusAlpha = 1.0 - alpha;

            for (let c = 0; c < 3; c++) {
                const watermarked = imageData.data[imgIdx + c];
                const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
                imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
            }
        }
    }
}

// Detect watermark configuration based on image dimensions
function detectWatermarkConfig(imageWidth: number, imageHeight: number) {
    if (imageWidth > 1024 && imageHeight > 1024) {
        return {
            logoSize: 96,
            marginRight: 64,
            marginBottom: 64
        };
    } else {
        return {
            logoSize: 48,
            marginRight: 32,
            marginBottom: 32
        };
    }
}

// Calculate watermark position
function calculateWatermarkPosition(
    imageWidth: number,
    imageHeight: number,
    config: { logoSize: number; marginRight: number; marginBottom: number }
) {
    const { logoSize, marginRight, marginBottom } = config;
    return {
        x: imageWidth - marginRight - logoSize,
        y: imageHeight - marginBottom - logoSize,
        width: logoSize,
        height: logoSize
    };
}

export default function GeminiWatermarkPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [watermarkInfo, setWatermarkInfo] = useState<{ size: number; position: { x: number; y: number } } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [alphaMaps, setAlphaMaps] = useState<{ bg48: Float32Array | null; bg96: Float32Array | null }>({ bg48: null, bg96: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();

    // Load alpha maps from pre-captured images on mount
    useEffect(() => {
        const loadAlphaMaps = async () => {
            try {
                const [bg48Response, bg96Response] = await Promise.all([
                    fetch('/assets/bg_48.png'),
                    fetch('/assets/bg_96.png')
                ]);

                const [bg48Blob, bg96Blob] = await Promise.all([
                    bg48Response.blob(),
                    bg96Response.blob()
                ]);

                const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
                    return new Promise((resolve, reject) => {
                        const img = new window.Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = URL.createObjectURL(blob);
                    });
                };

                const [bg48Img, bg96Img] = await Promise.all([
                    loadImage(bg48Blob),
                    loadImage(bg96Blob)
                ]);

                const getImageData = (img: HTMLImageElement, size: number): ImageData => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0);
                    return ctx.getImageData(0, 0, size, size);
                };

                const bg48Data = getImageData(bg48Img, 48);
                const bg96Data = getImageData(bg96Img, 96);

                setAlphaMaps({
                    bg48: calculateAlphaMap(bg48Data),
                    bg96: calculateAlphaMap(bg96Data)
                });
            } catch (error) {
                console.error('Failed to load alpha maps:', error);
                showToast('加载水印模板失败');
            }
        };

        loadAlphaMaps();
    }, [showToast]);

    const processImage = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imgSrc = e.target?.result as string;
            setOriginalImage(imgSrc);
            setProcessedImage(null);
            setWatermarkInfo(null);

            // Process the image
            setIsProcessing(true);
            try {
                const img = new window.Image();
                img.onload = () => {
                    const config = detectWatermarkConfig(img.width, img.height);
                    const position = calculateWatermarkPosition(img.width, img.height, config);

                    setWatermarkInfo({
                        size: config.logoSize,
                        position: { x: position.x, y: position.y }
                    });

                    const alphaMap = config.logoSize === 48 ? alphaMaps.bg48 : alphaMaps.bg96;

                    if (!alphaMap) {
                        showToast('水印模板尚未加载完成，请稍后重试');
                        setIsProcessing(false);
                        return;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    removeWatermark(imageData, alphaMap, position);
                    ctx.putImageData(imageData, 0, 0);

                    setProcessedImage(canvas.toDataURL('image/png'));
                    setIsProcessing(false);
                    showToast('水印去除成功！');
                };
                img.onerror = () => {
                    showToast('图片加载失败');
                    setIsProcessing(false);
                };
                img.src = imgSrc;
            } catch (error) {
                console.error('Processing error:', error);
                showToast('处理失败');
                setIsProcessing(false);
            }
        };
        reader.readAsDataURL(file);
    }, [alphaMaps, showToast]);

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
        if (!processedImage) return;
        const link = document.createElement('a');
        link.download = `no_watermark_${Date.now()}.png`;
        link.href = processedImage;
        link.click();
        showToast('图片已下载');
    }, [processedImage, showToast]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setProcessedImage(null);
        setWatermarkInfo(null);
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
                    <h1 className="tool-title">去Gemini水印</h1>
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
                        <div className="image-tool-upload-icon gemini">
                            <Sparkles size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">点击或拖拽图片到此处上传</p>
                        <p className="upload-hint">支持 Gemini AI 生成的 JPG、PNG 等格式图片</p>
                    </div>
                )}

                {originalImage && (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header gemini">
                                <h3>
                                    <Settings size={20} />
                                    处理信息
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 水印信息 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">
                                        <Info size={16} />
                                        水印检测
                                    </div>
                                    {watermarkInfo ? (
                                        <div className="watermark-info">
                                            <div className="info-row">
                                                <span className="info-label">水印尺寸:</span>
                                                <span className="info-value">{watermarkInfo.size}×{watermarkInfo.size}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">位置:</span>
                                                <span className="info-value">({watermarkInfo.position.x}, {watermarkInfo.position.y})</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="watermark-info">
                                            <span className="info-loading">检测中...</span>
                                        </div>
                                    )}
                                </div>

                                {/* 状态显示 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">处理状态</div>
                                    <div className={`flip-status-badge ${processedImage ? 'active' : ''}`}>
                                        {isProcessing ? '处理中...' : processedImage ? '已去除水印' : '待处理'}
                                    </div>
                                </div>

                                {/* 算法说明 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">算法说明</div>
                                    <div className="algorithm-info">
                                        <p>使用反向 Alpha 混合算法数学精确还原原始像素。</p>
                                        <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
                                            100% 客户端处理，图片不会上传到服务器。
                                        </p>
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
                                    <button
                                        className="image-tool-btn primary gemini"
                                        onClick={downloadImage}
                                        disabled={!processedImage}
                                    >
                                        <Download size={16} />
                                        下载图片
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                <div className="image-compare-container">
                                    <div className="image-compare-item">
                                        <div className="image-compare-label">原图</div>
                                        <div className="image-tool-preview-bg">
                                            <img
                                                src={originalImage}
                                                alt="Original"
                                                className="image-tool-preview-img"
                                            />
                                        </div>
                                    </div>
                                    <div className="image-compare-item">
                                        <div className="image-compare-label">去水印后</div>
                                        <div className="image-tool-preview-bg">
                                            {processedImage ? (
                                                <img
                                                    src={processedImage}
                                                    alt="Processed"
                                                    className="image-tool-preview-img"
                                                />
                                            ) : (
                                                <div className="image-processing-placeholder">
                                                    {isProcessing ? (
                                                        <div className="processing-spinner">
                                                            <Sparkles size={32} className="spin" />
                                                            <span>处理中...</span>
                                                        </div>
                                                    ) : (
                                                        <span>等待处理</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
