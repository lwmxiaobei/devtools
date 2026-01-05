'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Copy, ExternalLink, ScanLine, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import jsQR from 'jsqr';

export default function QRCodeScanPage() {
    const [result, setResult] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();

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
                    showToast('二维码解析成功');
                } else {
                    setResult(null);
                    showToast('未能识别到二维码');
                }
            }
            setIsProcessing(false);
        };
        img.onerror = () => {
            showToast('图片加载失败');
            setIsProcessing(false);
        };
        img.src = imageSrc;
    }, [showToast]);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传图片文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            scanQRCode(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [scanQRCode, showToast]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const copyResult = useCallback(() => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        showToast('已复制到剪贴板');
    }, [result, showToast]);

    const openLink = useCallback(() => {
        if (!result) return;
        try {
            const url = new URL(result);
            window.open(url.href, '_blank');
        } catch {
            showToast('不是有效的链接');
        }
    }, [result, showToast]);

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
                    <h1 className="tool-title">二维码解析识别</h1>
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
                        <p className="upload-text">点击或拖拽二维码图片到此处</p>
                        <p className="upload-hint">支持 JPG、PNG 格式，也可以 Ctrl+V 粘贴图片</p>
                    </div>
                ) : (
                    <div className="image-tool-layout">
                        {/* 左侧预览 */}
                        <div className="image-tool-panel">
                            <div className="image-tool-panel-header qrscan">
                                <h3>
                                    <ScanLine size={20} />
                                    二维码图片
                                </h3>
                            </div>
                            <div className="image-tool-panel-body">
                                <div className="qrscan-image-preview">
                                    <img src={previewImage} alt="QR Code" />
                                </div>
                                <button className="qrscan-rescan-btn" onClick={clearAll}>
                                    <Trash2 size={16} />
                                    重新识别
                                </button>
                            </div>
                        </div>

                        {/* 右侧结果 */}
                        <div className="image-tool-preview">
                            <div className="image-tool-preview-header">
                                <h3>识别结果</h3>
                                {result && (
                                    <div className="image-tool-actions">
                                        <button className="image-tool-btn secondary" onClick={copyResult}>
                                            <Copy size={16} />
                                            复制
                                        </button>
                                        {isValidUrl(result) && (
                                            <button className="image-tool-btn primary qrscan" onClick={openLink}>
                                                <ExternalLink size={16} />
                                                打开链接
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="image-tool-preview-body">
                                {isProcessing ? (
                                    <div className="qrscan-loading">
                                        <div className="spinner"></div>
                                        <p>正在识别...</p>
                                    </div>
                                ) : result ? (
                                    <div className="qrscan-result-box">
                                        <pre>{result}</pre>
                                    </div>
                                ) : (
                                    <div className="qrscan-no-result">
                                        <ScanLine size={48} strokeWidth={1} />
                                        <p>未能识别到二维码内容</p>
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
