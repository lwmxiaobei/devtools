'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Wand2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

type Language = 'javascript' | 'css' | 'html' | 'sql';

export default function CodeFormatterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState<Language>('javascript');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const formatCode = () => {
        try {
            let formatted = input;

            switch (language) {
                case 'javascript':
                    formatted = formatJS(input);
                    break;
                case 'css':
                    formatted = formatCSS(input);
                    break;
                case 'html':
                    formatted = formatHTML(input);
                    break;
                case 'sql':
                    formatted = formatSQL(input);
                    break;
            }

            setOutput(formatted);
            setError('');
        } catch (e) {
            setError(`格式化错误: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const formatJS = (code: string) => {
        // 简单的JS格式化
        let formatted = code;
        let indent = 0;
        const lines: string[] = [];

        formatted = formatted.replace(/\s+/g, ' ').trim();
        formatted = formatted.replace(/\{/g, ' {\n');
        formatted = formatted.replace(/\}/g, '\n}\n');
        formatted = formatted.replace(/;/g, ';\n');
        formatted = formatted.replace(/,\s*/g, ', ');

        formatted.split('\n').forEach((line) => {
            line = line.trim();
            if (!line) return;

            if (line.includes('}')) indent = Math.max(0, indent - 1);
            lines.push('  '.repeat(indent) + line);
            if (line.includes('{')) indent++;
        });

        return lines.join('\n');
    };

    const formatCSS = (code: string) => {
        let formatted = code;
        formatted = formatted.replace(/\s+/g, ' ').trim();
        formatted = formatted.replace(/\{/g, ' {\n  ');
        formatted = formatted.replace(/\}/g, '\n}\n\n');
        formatted = formatted.replace(/;/g, ';\n  ');
        formatted = formatted.replace(/  \n\}/g, '\n}');
        return formatted.trim();
    };

    const formatHTML = (code: string) => {
        let formatted = code;
        let indent = 0;
        const lines: string[] = [];

        formatted = formatted.replace(/>\s+</g, '>\n<');

        formatted.split('\n').forEach((line) => {
            line = line.trim();
            if (!line) return;

            if (line.match(/^<\/\w/)) indent = Math.max(0, indent - 1);
            lines.push('  '.repeat(indent) + line);
            if (line.match(/^<\w[^>]*[^\/]>.*$/)) indent++;
        });

        return lines.join('\n');
    };

    const formatSQL = (code: string) => {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'];

        let formatted = code.toUpperCase();
        keywords.forEach((kw) => {
            formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `\n${kw}`);
        });

        return formatted.trim().replace(/^\n/, '');
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
        setError('');
    };

    const languages: { id: Language; name: string }[] = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'css', name: 'CSS' },
        { id: 'html', name: 'HTML' },
        { id: 'sql', name: 'SQL' },
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
                    <h1 className="tool-title">代码格式化</h1>
                </div>

                <div className="options-grid" style={{ marginBottom: '20px' }}>
                    {languages.map((lang) => (
                        <button
                            key={lang.id}
                            className={`option-btn ${language === lang.id ? 'active' : ''}`}
                            onClick={() => setLanguage(lang.id)}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输入代码</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={`请输入 ${language.toUpperCase()} 代码...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">格式化结果</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder="格式化后的代码将显示在这里"
                            value={output}
                            readOnly
                        />
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                borderTop: '1px solid var(--border)',
                                fontSize: '0.85rem',
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="action-row">
                    <button className="action-btn primary" onClick={formatCode}>
                        <Wand2 size={18} />
                        格式化
                    </button>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
