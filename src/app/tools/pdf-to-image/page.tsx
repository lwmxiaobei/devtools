'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Trash2, ChevronLeft, ChevronRight, FileImage, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function PdfToImagePage() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scale, setScale] = useState(2);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const pdfjsRef = useRef<typeof import('pdfjs-dist') | null>(null);
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        const loadPdfJs = async () => {
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
            pdfjsRef.current = pdfjs;
        };
        loadPdfJs();
    }, []);

    const processPdf = useCallback(async (file: File) => {
        if (!pdfjsRef.current) {
            showToast(t('toolPages.pdfToImage.libLoading'));
            return;
        }

        setIsProcessing(true);
        setPdfFile(file);
        setImages([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise;
            setTotalPages(pdf.numPages);

            const convertedImages: string[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                if (ctx) {
                    await page.render({
                        canvasContext: ctx,
                        viewport,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any).promise;

                    convertedImages.push(canvas.toDataURL('image/png'));
                }
            }

            setImages(convertedImages);
            setCurrentPage(0);
            showToast(t('toolPages.pdfToImage.success').replace('{count}', pdf.numPages.toString()));
        } catch (error) {
            showToast(t('toolPages.pdfToImage.error'));
            console.error(error);
        }

        setIsProcessing(false);
    }, [scale, showToast, language]);

    const handleFileSelect = useCallback((file: File) => {
        if (file.type !== 'application/pdf') {
            showToast(t('toolPages.pdfToImage.uploadError'));
            return;
        }
        processPdf(file);
    }, [processPdf, showToast, language]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const downloadCurrentImage = useCallback(() => {
        if (images.length === 0) return;
        const link = document.createElement('a');
        link.download = `page_${currentPage + 1}_${Date.now()}.png`;
        link.href = images[currentPage];
        link.click();
        showToast(t('toolPages.common.downloaded').replace('{name}', 'image'));
    }, [images, currentPage, showToast, language]);

    const downloadAllImages = useCallback(() => {
        if (images.length === 0) return;
        images.forEach((img, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.download = `page_${index + 1}_${Date.now()}.png`;
                link.href = img;
                link.click();
            }, index * 200);
        });
        showToast(t('toolPages.pdfToImage.downloadingAll'));
    }, [images, showToast, language]);

    const clearAll = useCallback(() => {
        setPdfFile(null);
        setImages([]);
        setCurrentPage(0);
        setTotalPages(0);
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
                    <h1 className="tool-title">{t('toolPages.pdfToImage.title')}</h1>
                </div>

                {!pdfFile ? (
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
                            accept="application/pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        <div className="image-tool-upload-icon pdf">
                            <FileImage size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">{t('toolPages.pdfToImage.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.pdfToImage.uploadHint')}</p>
                    </div>
                ) : (
                    <div className="image-tool-layout">
                        {/* 左侧控制面板 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header pdf">
                                <h3>
                                    <Settings size={20} />
                                    {t('toolPages.pdfToImage.fileInfo')}
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                {/* 文件信息 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.pdfToImage.currentFile')}</div>
                                    <div className="pdf-file-info">
                                        <FileImage size={20} />
                                        <span className="pdf-filename">{pdfFile?.name}</span>
                                    </div>
                                    <div className="pdf-page-count">
                                        {language === 'zh'
                                            ? <>共 <strong>{totalPages}</strong> 页</>
                                            : <><strong>{totalPages}</strong> pages total</>
                                        }
                                    </div>
                                </div>

                                {/* 缩放设置 */}
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">{t('toolPages.pdfToImage.outputQuality')}</div>
                                    <div className="pdf-scale-btns">
                                        {[1, 2, 3].map((s) => (
                                            <button
                                                key={s}
                                                className={`pdf-scale-btn ${scale === s ? 'active' : ''}`}
                                                onClick={() => setScale(s)}
                                            >
                                                {s}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="image-tool-card">
                                    <button className="pdf-action-btn" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.reselect')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 右侧预览区域 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>{t('toolPages.pdfToImage.preview')}</h3>
                                <div className="image-tool-actions">
                                    <button className="image-tool-btn secondary" onClick={downloadCurrentImage} disabled={images.length === 0}>
                                        <Download size={16} />
                                        {t('toolPages.pdfToImage.downloadCurrent')}
                                    </button>
                                    <button className="image-tool-btn primary pdf" onClick={downloadAllImages} disabled={images.length === 0}>
                                        <Download size={16} />
                                        {t('toolPages.pdfToImage.downloadAll')}
                                    </button>
                                </div>
                            </div>
                            <div className="image-tool-preview-body">
                                {isProcessing ? (
                                    <div className="pdf-loading">
                                        <div className="spinner"></div>
                                        <p>{t('toolPages.pdfToImage.converting')}</p>
                                    </div>
                                ) : images.length > 0 ? (
                                    <>
                                        <div className="pdf-page-nav">
                                            <button
                                                className="pdf-nav-btn"
                                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                disabled={currentPage === 0}
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <span className="pdf-page-indicator">
                                                {language === 'zh'
                                                    ? `第 ${currentPage + 1} / ${totalPages} 页`
                                                    : `Page ${currentPage + 1} of ${totalPages}`
                                                }
                                            </span>
                                            <button
                                                className="pdf-nav-btn"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                                disabled={currentPage === totalPages - 1}
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </div>
                                        <div className="pdf-image-preview">
                                            <img src={images[currentPage]} alt={`Page ${currentPage + 1}`} />
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
