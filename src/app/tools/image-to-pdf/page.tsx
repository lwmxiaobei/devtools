'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, Plus, X, FileImage, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { jsPDF } from 'jspdf';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface ImageItem {
    id: string;
    src: string;
    name: string;
}

export default function ImageToPdfPage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const addImages = useCallback((files: FileList) => {
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, {
                    id: `${Date.now()}-${Math.random()}`,
                    src: e.target?.result as string,
                    name: file.name,
                }]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            addImages(e.dataTransfer.files);
        }
    }, [addImages]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    }, []);

    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        setImages(prev => {
            const newImages = [...prev];
            const [moved] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, moved);
            return newImages;
        });
    }, []);

    const generatePdf = useCallback(async () => {
        if (images.length === 0) {
            showToast(t('toolPages.imageToPdf.noImages'));
            return;
        }

        setIsProcessing(true);

        try {
            const pdf = new jsPDF({
                orientation,
                unit: 'mm',
                format: pageSize === 'fit' ? 'a4' : pageSize,
            });

            for (let i = 0; i < images.length; i++) {
                if (i > 0) pdf.addPage();

                const img = new window.Image();
                await new Promise<void>((resolve) => {
                    img.onload = () => {
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();

                        const imgRatio = img.width / img.height;
                        const pageRatio = pageWidth / pageHeight;

                        let imgWidth, imgHeight, x, y;

                        if (imgRatio > pageRatio) {
                            imgWidth = pageWidth - 20;
                            imgHeight = imgWidth / imgRatio;
                        } else {
                            imgHeight = pageHeight - 20;
                            imgWidth = imgHeight * imgRatio;
                        }

                        x = (pageWidth - imgWidth) / 2;
                        y = (pageHeight - imgHeight) / 2;

                        pdf.addImage(images[i].src, 'JPEG', x, y, imgWidth, imgHeight);
                        resolve();
                    };
                    img.src = images[i].src;
                });
            }

            pdf.save(`images_${Date.now()}.pdf`);
            showToast(t('toolPages.imageToPdf.success'));
        } catch (error) {
            showToast(t('toolPages.imageToPdf.error'));
            console.error(error);
        }

        setIsProcessing(false);
    }, [images, pageSize, orientation, showToast, language]);

    const clearAll = useCallback(() => {
        setImages([]);
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
                    <h1 className="tool-title">{t('toolPages.imageToPdf.title')}</h1>
                </div>

                <div className="image-tool-layout">
                    {/* 左侧控制面板 */}
                    <div className="image-tool-panel">
                        <div className="image-tool-panel-header imgpdf">
                            <h3>
                                <Settings size={20} />
                                {t('toolPages.imageToPdf.settings')}
                            </h3>
                        </div>
                        <div className="image-tool-panel-body">
                            {/* 页面尺寸 */}
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.imageToPdf.pageSize')}</div>
                                <div className="imgpdf-option-btns">
                                    {[
                                        { value: 'a4', label: 'A4' },
                                        { value: 'letter', label: 'Letter' },
                                        { value: 'fit', label: t('toolPages.imageToPdf.fit') },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            className={`imgpdf-option-btn ${pageSize === item.value ? 'active' : ''}`}
                                            onClick={() => setPageSize(item.value as 'a4' | 'letter' | 'fit')}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 页面方向 */}
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.imageToPdf.orientation')}</div>
                                <div className="imgpdf-option-btns">
                                    <button
                                        className={`imgpdf-option-btn ${orientation === 'portrait' ? 'active' : ''}`}
                                        onClick={() => setOrientation('portrait')}
                                    >
                                        {t('toolPages.imageToPdf.portrait')}
                                    </button>
                                    <button
                                        className={`imgpdf-option-btn ${orientation === 'landscape' ? 'active' : ''}`}
                                        onClick={() => setOrientation('landscape')}
                                    >
                                        {t('toolPages.imageToPdf.landscape')}
                                    </button>
                                </div>
                            </div>

                            {/* 添加图片按钮 */}
                            <div className="image-tool-card">
                                <button
                                    className="imgpdf-add-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Plus size={18} />
                                    {t('toolPages.imageToPdf.addImages')}
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

                    {/* 右侧预览区域 */}
                    <div className="image-tool-preview">
                        <div className="image-tool-preview-header">
                            <h3>{t('toolPages.imageToPdf.imageList')} {images.length > 0 && `(${images.length})`}</h3>
                            <div className="image-tool-actions">
                                <button
                                    className="image-tool-btn primary imgpdf"
                                    onClick={generatePdf}
                                    disabled={isProcessing || images.length === 0}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            {t('toolPages.imageToPdf.generating')}
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            {t('toolPages.imageToPdf.downloadPdf')}
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
                                    <p>{t('toolPages.imageToPdf.dropzoneText')}</p>
                                    <span>{t('toolPages.imageToPdf.dropzoneHint')}</span>
                                </div>
                            ) : (
                                <div
                                    className="imgpdf-list"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                >
                                    {images.map((img, index) => (
                                        <div key={img.id} className="imgpdf-item">
                                            <div className="imgpdf-item-thumb">
                                                <img src={img.src} alt={img.name} />
                                            </div>
                                            <div className="imgpdf-item-info">
                                                <span className="imgpdf-item-name">{img.name}</span>
                                                <span className="imgpdf-item-page">
                                                    {language === 'zh'
                                                        ? `第 ${index + 1} 页`
                                                        : `Page ${index + 1}`
                                                    }
                                                </span>
                                            </div>
                                            <div className="imgpdf-item-actions">
                                                {index > 0 && (
                                                    <button className="imgpdf-move-btn" onClick={() => moveImage(index, index - 1)}>
                                                        <ArrowUp size={16} />
                                                    </button>
                                                )}
                                                {index < images.length - 1 && (
                                                    <button className="imgpdf-move-btn" onClick={() => moveImage(index, index + 1)}>
                                                        <ArrowDown size={16} />
                                                    </button>
                                                )}
                                                <button className="imgpdf-remove-btn" onClick={() => removeImage(img.id)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
