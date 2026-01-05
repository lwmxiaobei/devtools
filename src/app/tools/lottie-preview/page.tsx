'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, Upload } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

// 使用 CDN 加载 Lottie
declare global {
    interface Window {
        lottie: {
            loadAnimation: (params: {
                container: HTMLElement;
                renderer: string;
                loop: boolean;
                autoplay: boolean;
                animationData: unknown;
            }) => {
                play: () => void;
                pause: () => void;
                stop: () => void;
                goToAndStop: (frame: number, isFrame: boolean) => void;
                setSpeed: (speed: number) => void;
                destroy: () => void;
                totalFrames: number;
                addEventListener: (event: string, callback: () => void) => void;
            };
        };
    }
}

export default function LottiePreviewPage() {
    const [input, setInput] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [error, setError] = useState('');
    const [lottieLoaded, setLottieLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<ReturnType<typeof window.lottie.loadAnimation> | null>(null);
    const { toast, showToast, hideToast } = useToast();

    // 加载 Lottie 库
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.lottie) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
            script.onload = () => setLottieLoaded(true);
            document.body.appendChild(script);
        } else if (window.lottie) {
            setLottieLoaded(true);
        }
    }, []);

    // 加载动画
    useEffect(() => {
        if (!lottieLoaded || !input.trim() || !containerRef.current) {
            return;
        }

        // 清除之前的动画
        if (animationRef.current) {
            animationRef.current.destroy();
            animationRef.current = null;
        }

        try {
            const animationData = JSON.parse(input);

            animationRef.current = window.lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData,
            });

            setIsPlaying(true);
            setError('');
        } catch (e) {
            setError(`JSON 格式错误: ${(e as Error).message}`);
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.destroy();
            }
        };
    }, [input, lottieLoaded]);

    // 更新速度
    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.setSpeed(speed);
        }
    }, [speed]);

    const togglePlay = () => {
        if (!animationRef.current) return;

        if (isPlaying) {
            animationRef.current.pause();
        } else {
            animationRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const restart = () => {
        if (!animationRef.current) return;
        animationRef.current.goToAndStop(0, true);
        animationRef.current.play();
        setIsPlaying(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setInput(content);
        };
        reader.readAsText(file);
    };

    const loadExample = () => {
        setInput(JSON.stringify({
            v: "5.7.4",
            fr: 60,
            ip: 0,
            op: 60,
            w: 200,
            h: 200,
            nm: "示例动画",
            ddd: 0,
            assets: [],
            layers: [
                {
                    ddd: 0,
                    ind: 1,
                    ty: 4,
                    nm: "Circle",
                    sr: 1,
                    ks: {
                        o: { a: 0, k: 100 },
                        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
                        p: { a: 0, k: [100, 100, 0] },
                        a: { a: 0, k: [0, 0, 0] },
                        s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 30, s: [120, 120, 100] }, { t: 60, s: [100, 100, 100] }] }
                    },
                    shapes: [
                        {
                            ty: "el",
                            p: { a: 0, k: [0, 0] },
                            s: { a: 0, k: [50, 50] }
                        },
                        {
                            ty: "fl",
                            c: { a: 0, k: [0.4, 0.6, 1, 1] },
                            o: { a: 0, k: 100 }
                        }
                    ],
                    ip: 0,
                    op: 60,
                    st: 0
                }
            ]
        }, null, 2));
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
                    <h1 className="tool-title">Lottie 动画预览</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">Lottie JSON</span>
                            <div className="editor-actions">
                                <label className="editor-btn" style={{ cursor: 'pointer' }}>
                                    <Upload size={14} />
                                    上传文件
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <button className="editor-btn" onClick={loadExample}>
                                    示例
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder="请输入 Lottie JSON 动画数据，或上传 .json 文件"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">预览</span>
                            <div className="editor-actions">
                                <button
                                    className="editor-btn"
                                    onClick={togglePlay}
                                    disabled={!animationRef.current}
                                >
                                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                    {isPlaying ? '暂停' : '播放'}
                                </button>
                                <button
                                    className="editor-btn"
                                    onClick={restart}
                                    disabled={!animationRef.current}
                                >
                                    <RotateCcw size={14} />
                                    重播
                                </button>
                            </div>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '400px',
                                background: 'var(--bg-primary)',
                            }}
                        >
                            {error ? (
                                <div style={{ color: '#ef4444', padding: '16px' }}>{error}</div>
                            ) : !lottieLoaded ? (
                                <div style={{ color: 'var(--text-muted)' }}>加载 Lottie 库中...</div>
                            ) : !input.trim() ? (
                                <div style={{ color: 'var(--text-muted)' }}>
                                    输入 Lottie JSON 后预览动画
                                </div>
                            ) : null}
                            <div
                                ref={containerRef}
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    height: '300px',
                                    display: error || !input.trim() ? 'none' : 'block',
                                }}
                            />
                        </div>
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                速度: {speed}x
                            </span>
                            <input
                                type="range"
                                min="0.25"
                                max="3"
                                step="0.25"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
