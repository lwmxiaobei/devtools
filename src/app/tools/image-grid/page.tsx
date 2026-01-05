'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Package, Trash2, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import JSZip from 'jszip';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface GridCell {
    index: number;
    dataUrl: string;
    blob: Blob | null;
}

export default function ImageGridPage() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [gridCells, setGridCells] = useState<GridCell[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const processImage = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast(t('toolPages.common.uploadError'));
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const offsetX = (img.width - size) / 2;
                const offsetY = (img.height - size) / 2;
                const cellSize = size / 3;

                const cells: GridCell[] = [];

                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const canvas = document.createElement('canvas');
                        canvas.width = cellSize;
                        canvas.height = cellSize;
                        const ctx = canvas.getContext('2d');

                        if (ctx) {
                            ctx.drawImage(
                                img,
                                offsetX + col * cellSize,
                                offsetY + row * cellSize,
                                cellSize,
                                cellSize,
                                0,
                                0,
                                cellSize,
                                cellSize
                            );

                            const dataUrl = canvas.toDataURL('image/png');
                            canvas.toBlob((blob) => {
                                cells[row * 3 + col] = {
                                    index: row * 3 + col + 1,
                                    dataUrl,
                                    blob,
                                };

                                if (cells.filter(Boolean).length === 9) {
                                    setGridCells(cells);
                                    setIsProcessing(false);
                                }
                            }, 'image/png');
                        }
                    }
                }

                setOriginalImage(e.target?.result as string);
            };
            img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
    }, [showToast, language]);

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

    const downloadSingle = useCallback((cell: GridCell) => {
        const link = document.createElement('a');
        link.download = `grid_${cell.index}.png`;
        link.href = cell.dataUrl;
        link.click();
        showToast(t('toolPages.common.downloaded').replace('{name}', `grid_${cell.index}.png`));
    }, [showToast, language]);

    const downloadAll = useCallback(async () => {
        if (gridCells.length !== 9) return;

        const zip = new JSZip();
        gridCells.forEach((cell) => {
            if (cell.blob) {
                zip.file(`grid_${cell.index}.png`, cell.blob);
            }
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = 'grid_images.zip';
        link.href = URL.createObjectURL(content);
        link.click();
        URL.revokeObjectURL(link.href);
        showToast(t('toolPages.common.downloaded').replace('{name}', 'grid_images.zip'));
    }, [gridCells, showToast, language]);

    const clearAll = useCallback(() => {
        setOriginalImage(null);
        setGridCells([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.imageGrid.title')}</h1>
                </div>

                {/* Upload Area */}
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
                        <p className="upload-text">{t('toolPages.common.uploadText')}</p>
                        <p className="upload-hint">{t('toolPages.common.uploadHint')}</p>
                    </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                    <div className="processing-indicator">
                        <div className="spinner"></div>
                        <p>{t('toolPages.common.processing')}</p>
                    </div>
                )}

                {/* Grid Preview */}
                {gridCells.length === 9 && !isProcessing && (
                    <>
                        <div className="grid-preview">
                            {gridCells.map((cell) => (
                                <div key={cell.index} className="grid-cell">
                                    <img src={cell.dataUrl} alt={`Grid ${cell.index}`} />
                                    <div className="cell-overlay">
                                        <button
                                            className="cell-download-btn"
                                            onClick={() => downloadSingle(cell)}
                                            title={t('toolPages.imageGrid.downloadSingle')}
                                        >
                                            <Download size={20} />
                                        </button>
                                        <span className="cell-number">{cell.index}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="action-row">
                            <button className="action-btn secondary" onClick={clearAll}>
                                <Trash2 size={18} />
                                {t('toolPages.common.reselect')}
                            </button>
                            <button className="action-btn primary" onClick={downloadAll}>
                                <Package size={18} />
                                {t('toolPages.imageGrid.downloadAll')}
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
