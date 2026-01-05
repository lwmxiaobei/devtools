'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function UrlEncodePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [encodeType, setEncodeType] = useState<'component' | 'uri'>('component');
    const { toast, showToast, hideToast } = useToast();

    const encode = () => {
        if (encodeType === 'component') {
            setOutput(encodeURIComponent(input));
        } else {
            setOutput(encodeURI(input));
        }
    };

    const decode = () => {
        try {
            if (encodeType === 'component') {
                setOutput(decodeURIComponent(input));
            } else {
                setOutput(decodeURI(input));
            }
        } catch {
            setOutput('解码失败：无效的URL编码');
        }
    };

    const handleAction = () => {
        if (mode === 'encode') {
            encode();
        } else {
            decode();
        }
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast('已复制到剪贴板');
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
    };

    const swapInputOutput = () => {
        setInput(output);
        setOutput('');
        setMode(mode === 'encode' ? 'decode' : 'encode');
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
                    <h1 className="tool-title">URL 编解码</h1>
                </div>

                <div className="single-panel">
                    <div className="options-grid">
                        <button
                            className={`option-btn ${mode === 'encode' ? 'active' : ''}`}
                            onClick={() => setMode('encode')}
                        >
                            编码
                        </button>
                        <button
                            className={`option-btn ${mode === 'decode' ? 'active' : ''}`}
                            onClick={() => setMode('decode')}
                        >
                            解码
                        </button>
                    </div>

                    <div className="options-grid" style={{ marginBottom: '20px' }}>
                        <button
                            className={`option-btn ${encodeType === 'component' ? 'active' : ''}`}
                            onClick={() => setEncodeType('component')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            encodeURIComponent
                        </button>
                        <button
                            className={`option-btn ${encodeType === 'uri' ? 'active' : ''}`}
                            onClick={() => setEncodeType('uri')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            encodeURI
                        </button>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            {mode === 'encode' ? '待编码URL' : '待解码URL'}
                        </label>
                        <textarea
                            className="editor-textarea"
                            style={{ minHeight: '120px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                            placeholder={mode === 'encode' ? '请输入要编码的URL...' : '请输入编码后的URL...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="action-row" style={{ marginBottom: '20px' }}>
                        <button className="action-btn primary" onClick={handleAction}>
                            {mode === 'encode' ? '编码' : '解码'}
                        </button>
                        <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}>
                            <ArrowRightLeft size={18} />
                            交换
                        </button>
                        <button className="action-btn secondary" onClick={clearAll}>
                            <Trash2 size={18} />
                            清空
                        </button>
                    </div>

                    {output && (
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="input-label" style={{ margin: 0 }}>结果</label>
                                <button className="editor-btn" onClick={copyToClipboard}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                            <div className="result-box">{output}</div>
                        </div>
                    )}
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
