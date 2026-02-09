'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Copy, Trash2, Code, Image, Settings } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

const SAMPLE_HTML = `<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; font-family: system-ui, -apple-system, sans-serif;">
  <h1 style="color: white; font-size: 32px; margin: 0 0 16px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
    Hello, World! 👋
  </h1>
  <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0 0 24px 0; line-height: 1.6;">
    This is a sample HTML rendered to image.
    You can customize styles, add images, and more!
  </p>
  <div style="display: flex; gap: 12px;">
    <span style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px;">
      #HTML
    </span>
    <span style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px;">
      #CSS
    </span>
    <span style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px;">
      #Design
    </span>
  </div>
</div>`;

export default function HtmlToImagePage() {
    const [html, setHtml] = useState('');
    const [isRendering, setIsRendering] = useState(false);
    const [imageData, setImageData] = useState<string | null>(null);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(0);
    const [scale, setScale] = useState(2);
    const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
    const [quality, setQuality] = useState(0.92);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [transparent, setTransparent] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // Use refs for unstable callback references to prevent infinite re-render loops
    const showToastRef = useRef(showToast);
    const tRef = useRef(t);
    useEffect(() => { showToastRef.current = showToast; }, [showToast]);
    useEffect(() => { tRef.current = t; }, [t]);

    const renderToImage = useCallback(async () => {
        if (!html.trim()) {
            return;
        }

        setIsRendering(true);

        try {
            const html2canvas = (await import('html2canvas')).default;

            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.style.width = width ? `${width}px` : 'auto';
            container.style.height = height ? `${height}px` : 'auto';
            container.style.backgroundColor = transparent ? 'transparent' : backgroundColor;
            container.innerHTML = html;
            document.body.appendChild(container);

            // Wait for images to load
            const images = container.getElementsByTagName('img');
            await Promise.all(
                Array.from(images).map(
                    (img) =>
                        new Promise((resolve) => {
                            if (img.complete) resolve(null);
                            else {
                                img.onload = () => resolve(null);
                                img.onerror = () => resolve(null);
                            }
                        })
                )
            );

            const canvas = await html2canvas(container, {
                scale,
                backgroundColor: transparent ? null : backgroundColor,
                useCORS: true,
                allowTaint: true,
                logging: false,
            });

            document.body.removeChild(container);

            let mimeType = 'image/png';
            if (format === 'jpeg') mimeType = 'image/jpeg';
            else if (format === 'webp') mimeType = 'image/webp';

            const dataUrl = canvas.toDataURL(mimeType, quality);
            setImageData(dataUrl);
        } catch (error) {
            console.error('Render error:', error);
            showToastRef.current(tRef.current('toolPages.htmlToImage.error'));
        } finally {
            setIsRendering(false);
        }
    }, [html, width, height, scale, format, quality, backgroundColor, transparent]);

    // Auto-render when HTML changes (debounced)
    useEffect(() => {
        if (!html.trim()) {
            setImageData(null);
            return;
        }

        const timer = setTimeout(() => {
            renderToImage();
        }, 500);

        return () => clearTimeout(timer);
    }, [html, width, height, scale, format, quality, backgroundColor, transparent, renderToImage]);

    const downloadImage = useCallback(() => {
        if (!imageData) return;

        const link = document.createElement('a');
        link.download = `html-render-${Date.now()}.${format}`;
        link.href = imageData;
        link.click();
        showToastRef.current(tRef.current('toolPages.htmlToImage.downloadSuccess'));
    }, [imageData, format]);

    const copyImage = useCallback(async () => {
        if (!imageData) return;

        try {
            const response = await fetch(imageData);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob }),
            ]);
            showToastRef.current(tRef.current('toolPages.htmlToImage.copySuccess'));
        } catch {
            showToastRef.current(tRef.current('toolPages.htmlToImage.copyError'));
        }
    }, [imageData]);

    const loadSample = useCallback(() => {
        setHtml(SAMPLE_HTML);
    }, []);

    const clearAll = useCallback(() => {
        setHtml('');
        setImageData(null);
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
                    <h1 className="tool-title">{t('toolPages.htmlToImage.title')}</h1>
                </div>

                <div className="image-tool-layout">
                    <div className="image-tool-panel">
                        <div className="image-tool-panel-header html2img">
                            <h3>
                                <Settings size={20} />
                                {t('toolPages.imageToGif.settings')}
                            </h3>
                        </div>
                        <div className="image-tool-panel-body">
                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.htmlToImage.width')}</div>
                                <div className="html2img-input-group">
                                    <input
                                        type="number"
                                        min="0"
                                        max="4000"
                                        value={width || ''}
                                        onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                                        placeholder={t('toolPages.htmlToImage.autoWidth')}
                                        className="html2img-input"
                                    />
                                    <span className="html2img-input-suffix">px</span>
                                </div>
                            </div>

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.htmlToImage.height')}</div>
                                <div className="html2img-input-group">
                                    <input
                                        type="number"
                                        min="0"
                                        max="4000"
                                        value={height || ''}
                                        onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                                        placeholder={t('toolPages.htmlToImage.autoHeight')}
                                        className="html2img-input"
                                    />
                                    <span className="html2img-input-suffix">px</span>
                                </div>
                            </div>

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.htmlToImage.scale')}: {scale}x</div>
                                <input
                                    type="range"
                                    min="1"
                                    max="4"
                                    step="0.5"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    className="html2img-slider"
                                />
                            </div>

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.htmlToImage.format')}</div>
                                <div className="imgpdf-option-btns">
                                    {(['png', 'jpeg', 'webp'] as const).map((f) => (
                                        <button
                                            key={f}
                                            className={`imgpdf-option-btn ${format === f ? 'active' : ''}`}
                                            onClick={() => setFormat(f)}
                                        >
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {format !== 'png' && (
                                <div className="image-tool-card">
                                    <div className="image-tool-card-title">
                                        {t('toolPages.htmlToImage.quality')}: {Math.round(quality * 100)}%
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={quality}
                                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                                        className="html2img-slider"
                                    />
                                </div>
                            )}

                            <div className="image-tool-card">
                                <div className="image-tool-card-title">{t('toolPages.htmlToImage.backgroundColor')}</div>
                                <div className="html2img-color-row">
                                    <input
                                        type="color"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        disabled={transparent}
                                        className="html2img-color-picker"
                                    />
                                    <label className="html2img-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={transparent}
                                            onChange={(e) => setTransparent(e.target.checked)}
                                        />
                                        {t('toolPages.htmlToImage.transparent')}
                                    </label>
                                </div>
                            </div>

                            <div className="image-tool-card">
                                <button className="imgpdf-add-btn" onClick={loadSample}>
                                    <Code size={18} />
                                    {t('toolPages.htmlToImage.loadSample')}
                                </button>
                            </div>

                            {html && (
                                <div className="image-tool-card">
                                    <button className="imgpdf-clear-btn" onClick={clearAll}>
                                        <Trash2 size={16} />
                                        {t('toolPages.common.clearAll')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="image-tool-preview html2img-main">
                        <div className="html2img-editor-section">
                            <div className="html2img-section-header">
                                <h3>
                                    <Code size={18} />
                                    {t('toolPages.htmlToImage.inputLabel')}
                                </h3>
                            </div>
                            <textarea
                                className="html2img-textarea"
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                                placeholder={t('toolPages.htmlToImage.inputPlaceholder')}
                                spellCheck={false}
                            />
                        </div>

                        <div className="html2img-preview-section">
                            <div className="html2img-section-header">
                                <h3>
                                    <Image size={18} />
                                    {t('toolPages.htmlToImage.outputLabel')}
                                </h3>
                                {imageData && (
                                    <div className="html2img-actions">
                                        <button className="image-tool-btn secondary" onClick={copyImage}>
                                            <Copy size={16} />
                                            {t('toolPages.htmlToImage.copy')}
                                        </button>
                                        <button className="image-tool-btn primary html2img" onClick={downloadImage}>
                                            <Download size={16} />
                                            {t('toolPages.htmlToImage.download')}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="html2img-preview-container" ref={previewRef}>
                                {isRendering ? (
                                    <div className="html2img-loading">
                                        <div className="btn-spinner"></div>
                                        {t('toolPages.htmlToImage.rendering')}
                                    </div>
                                ) : imageData ? (
                                    <img src={imageData} alt="Rendered HTML" className="html2img-result" />
                                ) : (
                                    <div className="html2img-placeholder">
                                        <Image size={48} strokeWidth={1} />
                                        <p>{t('toolPages.htmlToImage.noContent')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />

            <style jsx>{`
                .html2img-main {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .html2img-editor-section,
                .html2img-preview-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 300px;
                }
                .html2img-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                .html2img-section-header h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }
                .html2img-textarea {
                    flex: 1;
                    width: 100%;
                    padding: 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                }
                .html2img-textarea:focus {
                    border-color: var(--primary);
                }
                .html2img-preview-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: auto;
                    padding: 20px;
                }
                .html2img-result {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .html2img-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-muted);
                }
                .html2img-placeholder p {
                    margin: 0;
                    font-size: 14px;
                }
                .html2img-loading {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-muted);
                    font-size: 14px;
                }
                .html2img-actions {
                    display: flex;
                    gap: 8px;
                }
                .html2img-input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .html2img-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                    max-width: 100px;
                }
                .html2img-input:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                .html2img-input-suffix {
                    color: var(--text-muted);
                    font-size: 13px;
                }
                .html2img-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: var(--bg-tertiary);
                    outline: none;
                    -webkit-appearance: none;
                    margin: 8px 0;
                }
                .html2img-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--primary);
                    cursor: pointer;
                }
                .html2img-color-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .html2img-color-picker {
                    width: 40px;
                    height: 32px;
                    padding: 0;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    cursor: pointer;
                    background: none;
                }
                .html2img-color-picker::-webkit-color-swatch-wrapper {
                    padding: 2px;
                }
                .html2img-color-picker::-webkit-color-swatch {
                    border-radius: 4px;
                    border: none;
                }
                .html2img-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                .html2img-checkbox-label input {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                .image-tool-panel-header.html2img {
                    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                }
                .image-tool-btn.primary.html2img {
                    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                }
                .image-tool-btn.primary.html2img:hover:not(:disabled) {
                    background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
                }
                @media (min-width: 1024px) {
                    .html2img-main {
                        flex-direction: row;
                    }
                    .html2img-editor-section,
                    .html2img-preview-section {
                        min-height: 500px;
                    }
                }
            `}</style>
        </>
    );
}
