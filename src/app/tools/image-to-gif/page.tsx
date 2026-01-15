'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Plus, X, Settings, ArrowUp, ArrowDown, Play, Pause } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface ImageItem {
    id: string;
    src: string;
    name: string;
    width: number;
    height: number;
}

export default function ImageToGifPage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [frameDelay, setFrameDelay] = useState(500);
    const [gifWidth, setGifWidth] = useState(0);
    const [gifHeight, setGifHeight] = useState(0);
    const [quality, setQuality] = useState(10);
    const [loop, setLoop] = useState(true);
    const [previewPlaying, setPreviewPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        return () => {
            if (previewIntervalRef.current) {
                clearInterval(previewIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (previewPlaying && images.length > 1) {
            previewIntervalRef.current = setInterval(() => {
                setCurrentFrame(prev => (prev + 1) % images.length);
            }, frameDelay);
        } else {
            if (previewIntervalRef.current) {
                clearInterval(previewIntervalRef.current);
                previewIntervalRef.current = null;
            }
        }
        return () => {
            if (previewIntervalRef.current) {
                clearInterval(previewIntervalRef.current);
            }
        };
    }, [previewPlaying, images.length, frameDelay]);

    const addImages = useCallback((files: FileList) => {
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    setImages(prev => {
                        const newImage: ImageItem = {
                            id: `${Date.now()}-${Math.random()}`,
                            src: e.target?.result as string,
                            name: file.name,
                            width: img.width,
                            height: img.height,
                        };
                        const newImages = [...prev, newImage];
                        if (newImages.length === 1 || (gifWidth === 0 && gifHeight === 0)) {
                            setGifWidth(img.width);
                            setGifHeight(img.height);
                        }
                        return newImages;
                    });
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    }, [gifWidth, gifHeight]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            addImages(e.dataTransfer.files);
        }
    }, [addImages]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
        setCurrentFrame(0);
    }, []);

    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        setImages(prev => {
            const newImages = [...prev];
            const [moved] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, moved);
            return newImages;
        });
    }, []);

    const generateGif = useCallback(async () => {
        if (images.length < 2) {
            showToast(t('toolPages.imageToGif.noImages'));
            return;
        }

        setIsProcessing(true);

        try {
            const GIF = (await import('gif.js')).default;

            const width = gifWidth || images[0].width;
            const height = gifHeight || images[0].height;

            console.log('Creating GIF with', images.length, 'frames, size:', width, 'x', height);

            const gif = new GIF({
                quality,
                width,
                height,
                repeat: loop ? 0 : -1,
            });

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                await new Promise<void>((resolve) => {
                    const image = new window.Image();
                    image.onload = () => {
                        if (ctx) {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, width, height);
                            
                            const scale = Math.min(width / image.width, height / image.height);
                            const scaledWidth = image.width * scale;
                            const scaledHeight = image.height * scale;
                            const x = (width - scaledWidth) / 2;
                            const y = (height - scaledHeight) / 2;
                            
                            ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
                            gif.addFrame(canvas, { copy: true, delay: frameDelay });
                            console.log('Added frame', i + 1, 'of', images.length);
                        }
                        resolve();
                    };
                    image.onerror = () => {
                        console.error('Failed to load image:', img.src);
                        resolve();
                    };
                    image.src = img.src;
                });
            }

            console.log('All frames added, starting render...');
            gif.on('finished', (blob: Blob) => {
                console.log('GIF generated, size:', blob.size, 'bytes');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animation_${Date.now()}.gif`;
                a.click();
                URL.revokeObjectURL(url);
                showToast(t('toolPages.imageToGif.success'));
                setIsProcessing(false);
            });

            gif.render();
        } catch (error) {
            showToast(t('toolPages.imageToGif.error'));
            console.error(error);
            setIsProcessing(false);
        }
    }, [images, gifWidth, gifHeight, quality, loop, frameDelay, showToast, t]);

    const clearAll = useCallback(() => {
        setImages([]);
        setCurrentFrame(0);
        setPreviewPlaying(false);
        setGifWidth(0);
        setGifHeight(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const togglePreview = useCallback(() => {
        setPreviewPlaying(prev => !prev);
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
                    <h1 className="tool-title">{t('toolPages.imageToGif.title')}</h1>
                </div>

                <div className="image-tool-layout">
                    <div className="image-tool-panel">
                        <div className="image-tool-panel-header imggif">
                            <h3>
                                <Settings size={20} />
                                {t('toolPages.imageToGif.settings')}
                            </h3>
                        </div>
                        <div className="image-tool-panel-body">
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.imageToGif.frameDelay')}</div>
                                <div className="imggif-input-group">
                                    <input
                                        type="number"
                                        min="50"
                                        max="5000"
                                        step="50"
                                        value={frameDelay}
                                        onChange={(e) => setFrameDelay(Math.max(50, parseInt(e.target.value) || 500))}
                                        className="imggif-input"
                                    />
                                    <span className="imggif-input-suffix">{t('toolPages.imageToGif.milliseconds')}</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="2000"
                                    step="50"
                                    value={frameDelay}
                                    onChange={(e) => setFrameDelay(parseInt(e.target.value))}
                                    className="imggif-slider"
                                />
                            </div>

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.imageToGif.width')} × {t('toolPages.imageToGif.height')}</div>
                                <div className="imggif-size-inputs">
                                    <input
                                        type="number"
                                        min="1"
                                        max="2000"
                                        value={gifWidth || ''}
                                        onChange={(e) => setGifWidth(parseInt(e.target.value) || 0)}
                                        placeholder={t('toolPages.imageToGif.autoSize')}
                                        className="imggif-input"
                                    />
                                    <span>×</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="2000"
                                        value={gifHeight || ''}
                                        onChange={(e) => setGifHeight(parseInt(e.target.value) || 0)}
                                        placeholder={t('toolPages.imageToGif.autoSize')}
                                        className="imggif-input"
                                    />
                                </div>
                            </div>

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.imageToGif.quality')}: {quality}</div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={quality}
                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                    className="imggif-slider"
                                />
                                <div className="imggif-quality-hint">
                                    {language === 'zh' ? '值越小质量越高' : 'Lower value = higher quality'}
                                </div>
                            </div>

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.imageToGif.loop')}</div>
                                <div className="imgpdf-option-btns">
                                    <button
                                        className={`imgpdf-option-btn ${loop ? 'active' : ''}`}
                                        onClick={() => setLoop(true)}
                                    >
                                        {t('toolPages.imageToGif.loopForever')}
                                    </button>
                                    <button
                                        className={`imgpdf-option-btn ${!loop ? 'active' : ''}`}
                                        onClick={() => setLoop(false)}
                                    >
                                        {t('toolPages.imageToGif.loopOnce')}
                                    </button>
                                </div>
                            </div>

                            <div className="image-tool-card">
                                <button
                                    className="imgpdf-add-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Plus size={18} />
                                    {t('toolPages.imageToGif.addImages')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => e.target.files && addImages(e.target.files)}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {images.length > 0 && (
                                <div className="image-tool-card">
                                    <button className="imgpdf-clear-btn" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.clearAll')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="image-tool-preview">
                        <div className="image-tool-preview-header">
                            <h3>{t('toolPages.imageToGif.imageList')} {images.length > 0 && `(${images.length})`}</h3>
                            <div className="image-tool-actions">
                                {images.length > 1 && (
                                    <button
                                        className="image-tool-btn secondary"
                                        onClick={togglePreview}
                                    >
                                        {previewPlaying ? <Pause size={16} /> : <Play size={16} />}
                                        {t('toolPages.imageToGif.preview')}
                                    </button>
                                )}
                                <button
                                    className="image-tool-btn primary imggif"
                                    onClick={generateGif}
                                    disabled={isProcessing || images.length < 2}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            {t('toolPages.imageToGif.generating')}
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            {t('toolPages.imageToGif.downloadGif')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="image-tool-preview-body">
                            {images.length === 0 ? (
                                <div
                                    className={`imgpdf-dropzone ${isDragging ? 'dragging' : ''}`}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={40} strokeWidth={1.5} />
                                    <p>{t('toolPages.imageToGif.dropzoneText')}</p>
                                    <span>{t('toolPages.imageToGif.dropzoneHint')}</span>
                                </div>
                            ) : (
                                <div className="imggif-content">
                                    {images.length > 0 && (
                                        <div className="imggif-preview-box">
                                            <div className="imggif-preview-frame">
                                                <img 
                                                    src={images[currentFrame]?.src} 
                                                    alt={`Frame ${currentFrame + 1}`}
                                                />
                                            </div>
                                            <div className="imggif-preview-info">
                                                {language === 'zh'
                                                    ? `帧 ${currentFrame + 1} / ${images.length}`
                                                    : `Frame ${currentFrame + 1} / ${images.length}`
                                                }
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div
                                        className="imgpdf-list imggif-list"
                                        onDrop={handleDrop}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                    >
                                        {images.map((img, index) => (
                                            <div 
                                                key={img.id} 
                                                className={`imgpdf-item imggif-item ${currentFrame === index ? 'active' : ''}`}
                                                onClick={() => setCurrentFrame(index)}
                                            >
                                                <div className="imgpdf-item-thumb">
                                                    <img src={img.src} alt={img.name} />
                                                </div>
                                                <div className="imgpdf-item-info">
                                                    <span className="imgpdf-item-name">{img.name}</span>
                                                    <span className="imgpdf-item-page">
                                                        {language === 'zh'
                                                            ? `帧 ${index + 1}`
                                                            : `Frame ${index + 1}`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="imgpdf-item-actions">
                                                    {index > 0 && (
                                                        <button className="imgpdf-move-btn" onClick={(e) => { e.stopPropagation(); moveImage(index, index - 1); }}>
                                                            <ArrowUp size={16} />
                                                        </button>
                                                    )}
                                                    {index < images.length - 1 && (
                                                        <button className="imgpdf-move-btn" onClick={(e) => { e.stopPropagation(); moveImage(index, index + 1); }}>
                                                            <ArrowDown size={16} />
                                                        </button>
                                                    )}
                                                    <button className="imgpdf-remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />

            <style jsx>{`
                .imggif-input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .imggif-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                    max-width: 100px;
                }
                .imggif-input:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                .imggif-input-suffix {
                    color: var(--text-muted);
                    font-size: 13px;
                }
                .imggif-size-inputs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .imggif-size-inputs span {
                    color: var(--text-muted);
                }
                .imggif-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: var(--bg-tertiary);
                    outline: none;
                    -webkit-appearance: none;
                    margin: 8px 0;
                }
                .imggif-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--primary);
                    cursor: pointer;
                }
                .imggif-quality-hint {
                    font-size: 12px;
                    color: var(--text-muted);
                    text-align: center;
                }
                .imggif-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    height: 100%;
                }
                .imggif-preview-box {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .imggif-preview-frame {
                    max-width: 100%;
                    max-height: 300px;
                    overflow: hidden;
                    border-radius: 8px;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .imggif-preview-frame img {
                    max-width: 100%;
                    max-height: 280px;
                    object-fit: contain;
                }
                .imggif-preview-info {
                    font-size: 13px;
                    color: var(--text-muted);
                }
                .imggif-list {
                    flex: 1;
                    overflow-y: auto;
                }
                .imggif-item {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .imggif-item:hover {
                    background: var(--bg-tertiary);
                }
                .imggif-item.active {
                    background: var(--primary-alpha);
                    border-color: var(--primary);
                }
                .image-tool-panel-header.imggif {
                    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                }
                .image-tool-btn.primary.imggif {
                    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                }
                .image-tool-btn.primary.imggif:hover:not(:disabled) {
                    background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
                }
            `}</style>
        </>
    );
}
