'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Copy, ExternalLink, ScanLine, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import jsQR from 'jsqr';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function QRCodeScanPage() {
    const [result, setResult] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const scanQRCode = useCallback((imageSrc: string) => {
        setIsProcessing(true);
        setPreviewImage(imageSrc);

        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setResult(code.data);
                    showToast(t('toolPages.qrCodeScan.success'));
                } else {
                    setResult(null);
                    showToast(t('toolPages.qrCodeScan.notFound'));
                }
            }
            setIsProcessing(false);
        };
        img.onerror = () => {
            showToast(t('toolPages.common.uploadError'));
            setIsProcessing(false);
        };
        img.src = imageSrc;
    }, [showToast, language]);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast(t('toolPages.common.uploadError'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            scanQRCode(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [scanQRCode, showToast, language]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const copyResult = useCallback(() => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        showToast(t('toolPages.common.copied'));
    }, [result, showToast, language]);

    const openLink = useCallback(() => {
        if (!result) return;
        try {
            const url = new URL(result);
            window.open(url.href, '_blank');
        } catch {
            showToast(t('toolPages.qrCodeScan.invalidLink'));
        }
    }, [result, showToast, language]);

    const isValidUrl = (text: string) => {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    };

    const clearAll = useCallback(() => {
        setResult(null);
        setPreviewImage(null);
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
                    <h1 className="tool-title">{t('toolPages.qrCodeScan.title')}</h1>
                </div>

                {!previewImage ? (
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
                        <div className="image-tool-upload-icon qrscan">
                            <ScanLine size={40} strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">{t('toolPages.qrCodeScan.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.qrCodeScan.uploadHint')}</p>
                    </div>
                ) : (
                    <div className="image-tool-layout">
                        {/* 左侧预览 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header qrscan">
                                <h3>
                                    <ScanLine size={20} />
                                    {t('toolPages.qrCodeScan.image')}
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                <div className="qrscan-image-preview">
                                    <img src={previewImage} alt="QR Code" />
                                </div>
                                <button className="qrscan-rescan-btn" onClick={clearAll}>
                                    <Trash2 size={16} />
                                    {t('toolPages.qrCodeScan.rescan')}
                                </button>
                            </div>
                        </div>

                        {/* 右侧结果 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>{t('toolPages.qrCodeScan.result')}</h3>
                                {result && (
                                    <div className="image-tool-actions">
                                        <button className="image-tool-btn secondary" onClick={copyResult}>
                                            <Copy size={16} />
                                            {t('toolPages.common.copy')}
                                        </button>
                                        {isValidUrl(result) && (
                                            <button className="image-tool-btn primary qrscan" onClick={openLink}>
                                                <ExternalLink size={16} />
                                                {t('toolPages.qrCodeScan.openLink')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="image-tool-preview-body">
                                {isProcessing ? (
                                    <div className="qrscan-loading">
                                        <div className="spinner"></div>
                                        <p>{t('toolPages.qrCodeScan.scanning')}</p>
                                    </div>
                                ) : result ? (
                                    <div className="qrscan-result-box">
                                        <pre>{result}</pre>
                                    </div>
                                ) : (
                                    <div className="qrscan-no-result">
                                        <ScanLine size={48} strokeWidth={1} />
                                        <p>{t('toolPages.qrCodeScan.notFound')}</p>
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
