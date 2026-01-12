'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function UuidPage() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [uppercase, setUppercase] = useState(false);
    const [withHyphens, setWithHyphens] = useState(true);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const generateUUID = () => {
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });

        if (!withHyphens) {
            uuid = uuid.replace(/-/g, '');
        }
        if (uppercase) {
            uuid = uuid.toUpperCase();
        }
        return uuid;
    };

    const generate = () => {
        const newUuids = Array.from({ length: count }, generateUUID);
        setUuids(newUuids);
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const copyAll = async () => {
        await navigator.clipboard.writeText(uuids.join('\n'));
        showToast(t('toolPages.common.copiedAll'));
    };

    const clearAll = () => {
        setUuids([]);
    };

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.uuid.title')}</h1>
                </div>

                <div className="editor-container">
                    {/* 左侧：设置面板 */}
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.uuid.settings')}</span>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">{t('toolPages.uuid.generateCount')}</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="100"
                                    value={count}
                                    onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="options-grid">
                                <button
                                    className={`option-btn ${!uppercase ? 'active' : ''}`}
                                    onClick={() => setUppercase(false)}
                                >
                                    {t('toolPages.common.lowercase')}
                                </button>
                                <button
                                    className={`option-btn ${uppercase ? 'active' : ''}`}
                                    onClick={() => setUppercase(true)}
                                >
                                    {t('toolPages.common.uppercase')}
                                </button>
                            </div>

                            <div className="options-grid">
                                <button
                                    className={`option-btn ${withHyphens ? 'active' : ''}`}
                                    onClick={() => setWithHyphens(true)}
                                >
                                    {t('toolPages.common.withHyphens')}
                                </button>
                                <button
                                    className={`option-btn ${!withHyphens ? 'active' : ''}`}
                                    onClick={() => setWithHyphens(false)}
                                >
                                    {t('toolPages.common.withoutHyphens')}
                                </button>
                            </div>

                            <div className="action-row">
                                <button className="action-btn primary" onClick={generate}>
                                    <RefreshCw size={18} />
                                    {t('toolPages.uuid.generateUuid')}
                                </button>
                                <button className="action-btn secondary" onClick={clearAll}>
                                    <Trash2 size={18} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：结果面板 */}
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.uuid.generateResult')}</span>
                            {uuids.length > 1 && (
                                <button className="editor-btn" onClick={copyAll}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copyAll')}
                                </button>
                            )}
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto', flex: 1 }}>
                            {uuids.length > 0 ? (
                                uuids.map((uuid, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius)',
                                        }}
                                    >
                                        <code style={{
                                            flex: 1,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '0.9rem',
                                        }}>
                                            {uuid}
                                        </code>
                                        <button
                                            className="editor-btn"
                                            onClick={() => copyToClipboard(uuid)}
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                }}>
                                    {t('toolPages.uuid.noResult')}
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
