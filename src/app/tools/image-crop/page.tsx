'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Lock, Unlock } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function ImageCropPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
    const [aspectRatio, setAspectRatio] = useState<string>('free');
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string>('');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropStart, setCropStart] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, hideToast } = useToast();

    const aspectRatios = [
        { id: 'free', label: '自由', ratio: null },
        { id: '1:1', label: '1:1', ratio: 1 },
        { id: '4:3', label: '4:3', ratio: 4 / 3 },
        { id: '16:9', label: '16:9', ratio: 16 / 9 },
        { id: '3:4', label: '3:4', ratio: 3 / 4 },
        { id: '9:16', label: '9:16', ratio: 9 / 16 },
    ];

    const processImage = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
                const initialSize = Math.min(img.width, img.height) * 0.8;
                setCropArea({
                    x: (img.width - initialSize) / 2,
                    y: (img.height - initialSize) / 2,
                    width: initialSize,
                    height: initialSize
                });
                setOriginalImage(e.target?.result as string);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }, [showToast]);

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

    const handleAspectRatioChange = (ratioId: string) => {
        setAspectRatio(ratioId);
        const selectedRatio = aspectRatios.find(r => r.id === ratioId);
        if (selectedRatio?.ratio && imageSize.width > 0) {
            const newWidth = Math.min(cropArea.width, imageSize.width);
            const newHeight = newWidth / selectedRatio.ratio;
            setCropArea(prev => ({
                ...prev,
                width: newWidth,
                height: Math.min(newHeight, imageSize.height)
            }));
        }
    };

    const cropImage = useCallback(() => {
        if (!originalImage) return;

        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = cropArea.width;
            canvas.height = cropArea.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(
                    img,
                    cropArea.x, cropArea.y,
                    cropArea.width, cropArea.height,
                    0, 0,
                    cropArea.width, cropArea.height
                );
                setCroppedImage(canvas.toDataURL('image/png'));
                showToast('裁剪完成');
            }
        };
        img.src = originalImage;
    }, [originalImage, cropArea, showToast]);

    const downloadImage = useCallback(() => {
        if (!croppedImage) return;
        const link = document.createElement('a');
        link.download = `cropped_${Date.now()}.png`;
        link.href = croppedImage;
        link.click();
        showToast('图片已下载');
    }, [croppedImage, showToast]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setCroppedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    // Calculate display scale
    const getDisplayScale = () => {
        if (!imageContainerRef.current || imageSize.width === 0) return 1;
        const containerWidth = imageContainerRef.current.offsetWidth - 40;
        const maxHeight = 400;
        const scaleX = containerWidth / imageSize.width;
        const scaleY = maxHeight / imageSize.height;
        return Math.min(scaleX, scaleY, 1);
    };

    const scale = getDisplayScale();

    // Handle crop box drag start
    const handleCropMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setCropStart({ ...cropArea });
    };

    // Handle resize handle mouse down
    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
        setCropStart({ ...cropArea });
    };

    // Handle mouse move
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging && !isResizing) return;

            const dx = (e.clientX - dragStart.x) / scale;
            const dy = (e.clientY - dragStart.y) / scale;

            if (isDragging) {
                // Moving the crop box
                let newX = cropStart.x + dx;
                let newY = cropStart.y + dy;

                // Constrain to image bounds
                newX = Math.max(0, Math.min(newX, imageSize.width - cropStart.width));
                newY = Math.max(0, Math.min(newY, imageSize.height - cropStart.height));

                setCropArea(prev => ({
                    ...prev,
                    x: newX,
                    y: newY
                }));
            } else if (isResizing) {
                // Resizing the crop box
                const selectedRatio = aspectRatios.find(r => r.id === aspectRatio);
                const ratio = selectedRatio?.ratio;
                let newCrop = { ...cropStart };

                switch (resizeHandle) {
                    case 'se':
                        newCrop.width = Math.max(50, cropStart.width + dx);
                        newCrop.height = ratio ? newCrop.width / ratio : Math.max(50, cropStart.height + dy);
                        break;
                    case 'sw':
                        newCrop.width = Math.max(50, cropStart.width - dx);
                        newCrop.x = cropStart.x + cropStart.width - newCrop.width;
                        newCrop.height = ratio ? newCrop.width / ratio : Math.max(50, cropStart.height + dy);
                        break;
                    case 'ne':
                        newCrop.width = Math.max(50, cropStart.width + dx);
                        newCrop.height = ratio ? newCrop.width / ratio : Math.max(50, cropStart.height - dy);
                        newCrop.y = ratio ? cropStart.y : cropStart.y + cropStart.height - newCrop.height;
                        break;
                    case 'nw':
                        newCrop.width = Math.max(50, cropStart.width - dx);
                        newCrop.x = cropStart.x + cropStart.width - newCrop.width;
                        newCrop.height = ratio ? newCrop.width / ratio : Math.max(50, cropStart.height - dy);
                        newCrop.y = ratio ? cropStart.y + cropStart.height - newCrop.height : cropStart.y + cropStart.height - newCrop.height;
                        break;
                }

                // Constrain to image bounds
                newCrop.x = Math.max(0, newCrop.x);
                newCrop.y = Math.max(0, newCrop.y);
                newCrop.width = Math.min(newCrop.width, imageSize.width - newCrop.x);
                newCrop.height = Math.min(newCrop.height, imageSize.height - newCrop.y);

                setCropArea(newCrop);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle('');
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, cropStart, scale, imageSize, aspectRatio, aspectRatios, resizeHandle]);

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">图片裁剪</h1>
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
                        <Upload size={48} strokeWidth={1.5} />
                        <p className="upload-text">点击或拖拽图片到此处上传</p>
                        <p className="upload-hint">支持 JPG、PNG、GIF 等格式</p>
                    </div>
                )}

                {originalImage && !croppedImage && (
                    <>
                        <div className="ratio-selector">
                            {aspectRatios.map(ratio => (
                                <button
                                    key={ratio.id}
                                    className={`ratio-btn ${aspectRatio === ratio.id ? 'active' : ''}`}
                                    onClick={() => handleAspectRatioChange(ratio.id)}
                                >
                                    {ratio.id === 'free' ? <Unlock size={14} /> : <Lock size={14} />}
                                    {ratio.label}
                                </button>
                            ))}
                        </div>

                        <div className="crop-container" ref={imageContainerRef}>
                            <div className="crop-image-wrapper" style={{
                                width: imageSize.width * scale,
                                height: imageSize.height * scale
                            }}>
                                <img src={originalImage} alt="Original" style={{ width: '100%', height: '100%' }} />
                                <div className="crop-overlay">
                                    <div
                                        className="crop-box"
                                        style={{
                                            left: cropArea.x * scale,
                                            top: cropArea.y * scale,
                                            width: cropArea.width * scale,
                                            height: cropArea.height * scale
                                        }}
                                        onMouseDown={handleCropMouseDown}
                                    >
                                        <div className="crop-handles">
                                            <div className="handle nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}></div>
                                            <div className="handle ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}></div>
                                            <div className="handle sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}></div>
                                            <div className="handle se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="crop-info">
                            <span>裁剪区域: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px</span>
                        </div>

                        <div className="action-row">
                            <button className="action-btn secondary" onClick={clearAll}>
                                <Trash2 size={18} />
                                重新选择
                            </button>
                            <button className="action-btn primary" onClick={cropImage}>
                                <Download size={18} />
                                确认裁剪
                            </button>
                        </div>
                    </>
                )}

                {croppedImage && (
                    <>
                        <div className="preview-container">
                            <h3>裁剪结果</h3>
                            <img src={croppedImage} alt="Cropped" className="cropped-preview" />
                        </div>
                        <div className="action-row">
                            <button className="action-btn secondary" onClick={() => setCroppedImage(null)}>
                                <Trash2 size={18} />
                                重新裁剪
                            </button>
                            <button className="action-btn primary" onClick={downloadImage}>
                                <Download size={18} />
                                下载图片
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />

            <style jsx>{`
                .ratio-selector {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .ratio-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: var(--bg-secondary);
                    border: 2px solid transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ratio-btn:hover { background: var(--bg-tertiary); }
                .ratio-btn.active {
                    border-color: var(--primary);
                    background: var(--primary-light);
                }
                .crop-container {
                    display: flex;
                    justify-content: center;
                    padding: 20px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    margin-bottom: 20px;
                }
                .crop-image-wrapper {
                    position: relative;
                    overflow: hidden;
                }
                .crop-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                }
                .crop-box {
                    position: absolute;
                    border: 2px dashed var(--primary);
                    background: transparent;
                    box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
                    cursor: move;
                }
                .crop-handles .handle {
                    position: absolute;
                    width: 12px; height: 12px;
                    background: var(--primary);
                    border-radius: 50%;
                }
                .handle.nw { top: -6px; left: -6px; cursor: nw-resize; }
                .handle.ne { top: -6px; right: -6px; cursor: ne-resize; }
                .handle.sw { bottom: -6px; left: -6px; cursor: sw-resize; }
                .handle.se { bottom: -6px; right: -6px; cursor: se-resize; }
                .crop-info {
                    text-align: center;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                }
                .preview-container {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .preview-container h3 {
                    margin: 0 0 16px 0;
                    color: var(--text-muted);
                }
                .cropped-preview {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 8px;
                }
            `}</style>
        </>
    );
}
