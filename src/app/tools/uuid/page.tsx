'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function UuidPage() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [uppercase, setUppercase] = useState(false);
    const [withHyphens, setWithHyphens] = useState(true);
    const { toast, showToast, hideToast } = useToast();

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
        showToast('已复制到剪贴板');
    };

    const copyAll = async () => {
        await navigator.clipboard.writeText(uuids.join('\n'));
        showToast('已复制全部UUID');
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
                    <h1 className="tool-title">UUID 生成器</h1>
                </div>

                <div className="single-panel">
                    <div className="input-group">
                        <label className="input-label">生成数量</label>
                        <input
                            type="number"
                            className="input-field"
                            min="1"
                            max="100"
                            value={count}
                            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                            style={{ width: '120px' }}
                        />
                    </div>

                    <div className="options-grid">
                        <button
                            className={`option-btn ${!uppercase ? 'active' : ''}`}
                            onClick={() => setUppercase(false)}
                        >
                            小写
                        </button>
                        <button
                            className={`option-btn ${uppercase ? 'active' : ''}`}
                            onClick={() => setUppercase(true)}
                        >
                            大写
                        </button>
                        <button
                            className={`option-btn ${withHyphens ? 'active' : ''}`}
                            onClick={() => setWithHyphens(true)}
                        >
                            带连字符
                        </button>
                        <button
                            className={`option-btn ${!withHyphens ? 'active' : ''}`}
                            onClick={() => setWithHyphens(false)}
                        >
                            无连字符
                        </button>
                    </div>

                    <div className="action-row" style={{ marginBottom: '20px' }}>
                        <button className="action-btn primary" onClick={generate}>
                            <RefreshCw size={18} />
                            生成UUID
                        </button>
                        {uuids.length > 1 && (
                            <button className="action-btn secondary" onClick={copyAll}>
                                <Copy size={18} />
                                复制全部
                            </button>
                        )}
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            清空
                        </button>
                    </div>

                    {uuids.length > 0 && (
                        <div className="input-group">
                            <label className="input-label">生成结果</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {uuids.map((uuid, index) => (
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
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
