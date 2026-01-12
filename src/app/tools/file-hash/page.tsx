'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Upload, File, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import CryptoJS from 'crypto-js';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512';

interface FileInfo {
    name: string;
    size: number;
}

export default function FileHashPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [results, setResults] = useState<Record<HashType, string>>({
        md5: '',
        sha1: '',
        sha256: '',
        sha512: '',
    });
    const [calculating, setCalculating] = useState(false);
    const [uppercase, setUppercase] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const calculateHashes = useCallback(async (selectedFile: File) => {
        setCalculating(true);
        setResults({ md5: '', sha1: '', sha256: '', sha512: '' });

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as unknown as number[]);

            const md5 = CryptoJS.MD5(wordArray).toString();
            const sha1 = CryptoJS.SHA1(wordArray).toString();
            const sha256 = CryptoJS.SHA256(wordArray).toString();
            const sha512 = CryptoJS.SHA512(wordArray).toString();

            const transform = (s: string) => (uppercase ? s.toUpperCase() : s);

            setResults({
                md5: transform(md5),
                sha1: transform(sha1),
                sha256: transform(sha256),
                sha512: transform(sha512),
            });
        } catch (error) {
            console.error('Error calculating hash:', error);
        } finally {
            setCalculating(false);
        }
    }, [uppercase]);

    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setFileInfo({
            name: selectedFile.name,
            size: selectedFile.size,
        });
        calculateHashes(selectedFile);
    }, [calculateHashes]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setFile(null);
        setFileInfo(null);
        setResults({ md5: '', sha1: '', sha256: '', sha512: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toggleCase = () => {
        setUppercase(!uppercase);
        if (results.md5) {
            const transform = (s: string) => (!uppercase ? s.toUpperCase() : s.toLowerCase());
            setResults({
                md5: transform(results.md5),
                sha1: transform(results.sha1),
                sha256: transform(results.sha256),
                sha512: transform(results.sha512),
            });
        }
    };

    const hashTypes: { id: HashType; name: string; bits: string }[] = [
        { id: 'md5', name: 'MD5', bits: `128${t('toolPages.fileHash.bits')}` },
        { id: 'sha1', name: 'SHA-1', bits: `160${t('toolPages.fileHash.bits')}` },
        { id: 'sha256', name: 'SHA-256', bits: `256${t('toolPages.fileHash.bits')}` },
        { id: 'sha512', name: 'SHA-512', bits: `512${t('toolPages.fileHash.bits')}` },
    ];

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.fileHash.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${!uppercase ? 'active' : ''}`}
                            onClick={() => toggleCase()}
                            disabled={!uppercase && !results.md5}
                        >
                            {t('toolPages.common.lowercase')}
                        </button>
                        <button
                            className={`option-btn ${uppercase ? 'active' : ''}`}
                            onClick={() => toggleCase()}
                            disabled={uppercase && !results.md5}
                        >
                            {t('toolPages.common.uppercase')}
                        </button>
                    </div>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.common.uploadText')}</span>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleInputChange}
                                style={{ display: 'none' }}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                style={{
                                    border: `2px dashed ${isDragging ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    borderRadius: '12px',
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isDragging ? 'var(--bg-hover)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                }}
                            >
                                <Upload size={48} style={{ color: 'var(--text-muted)' }} />
                                <div style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                                    {t('toolPages.fileHash.uploadHint')}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {t('toolPages.fileHash.supportFormats')}
                                </div>
                            </div>

                            {fileInfo && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <File size={24} style={{ color: 'var(--accent-color)' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            color: 'var(--text-primary)',
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {fileInfo.name}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {formatFileSize(fileInfo.size)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.fileHash.hashResults')}</span>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto', flex: 1 }}>
                            {calculating ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flex: 1,
                                    color: 'var(--text-muted)',
                                }}>
                                    {t('toolPages.fileHash.calculating')}
                                </div>
                            ) : !fileInfo ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flex: 1,
                                    color: 'var(--text-muted)',
                                }}>
                                    {t('toolPages.fileHash.noFile')}
                                </div>
                            ) : (
                                hashTypes.map((hash) => (
                                    <div key={hash.id} className="input-group" style={{ marginBottom: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label className="input-label" style={{ margin: 0 }}>
                                                {hash.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({hash.bits})</span>
                                            </label>
                                            <button className="editor-btn" onClick={() => copyToClipboard(results[hash.id])} disabled={!results[hash.id]}>
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <div
                                            className="result-box"
                                            style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: '0.85rem',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {results[hash.id] || hash.name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
