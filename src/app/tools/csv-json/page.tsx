'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type Mode = 'csv2json' | 'json2csv';
type Delimiter = ',' | '\t' | ';';

function csvToJson(csv: string, delimiter: Delimiter): object[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV 至少需要两行（表头 + 数据）');
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
}

function jsonToCsv(json: object[], delimiter: Delimiter): string {
    if (!Array.isArray(json) || json.length === 0) throw new Error('输入必须是非空 JSON 数组');
    const headers = Object.keys(json[0]);
    const escape = (val: unknown) => {
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(delimiter) || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };
    const rows = json.map(row => headers.map(h => escape((row as Record<string, unknown>)[h])).join(delimiter));
    return [headers.join(delimiter), ...rows].join('\n');
}

export default function CsvJsonPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<Mode>('csv2json');
    const [delimiter, setDelimiter] = useState<Delimiter>(',');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }
        try {
            if (mode === 'csv2json') {
                const result = csvToJson(input, delimiter);
                setOutput(JSON.stringify(result, null, 2));
            } else {
                const parsed = JSON.parse(input);
                setOutput(jsonToCsv(parsed, delimiter));
            }
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.formatError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, mode, delimiter, t]);

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
    };

    const swapInputOutput = () => {
        setInput(output);
        setOutput('');
        setMode(mode === 'csv2json' ? 'json2csv' : 'csv2json');
    };

    const delimiterOptions: { label: string; value: Delimiter }[] = [
        { label: t('toolPages.csvJson.comma'), value: ',' },
        { label: t('toolPages.csvJson.tab'), value: '\t' },
        { label: t('toolPages.csvJson.semicolon'), value: ';' },
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
                    <h1 className="tool-title">{t('toolPages.csvJson.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${mode === 'csv2json' ? 'active' : ''}`}
                            onClick={() => setMode('csv2json')}
                        >
                            {t('toolPages.csvJson.csvToJson')}
                        </button>
                        <button
                            className={`option-btn ${mode === 'json2csv' ? 'active' : ''}`}
                            onClick={() => setMode('json2csv')}
                        >
                            {t('toolPages.csvJson.jsonToCsv')}
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {t('toolPages.csvJson.delimiter')}:
                        </span>
                        {delimiterOptions.map(opt => (
                            <button
                                key={opt.value}
                                className={`option-btn ${delimiter === opt.value ? 'active' : ''}`}
                                onClick={() => setDelimiter(opt.value)}
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button className="action-btn secondary" onClick={swapInputOutput} disabled={!output}>
                        <ArrowRightLeft size={18} />
                        {t('toolPages.common.swap')}
                    </button>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'csv2json' ? t('toolPages.csvJson.inputCsv') : t('toolPages.csvJson.inputJson')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'csv2json' ? t('toolPages.csvJson.csvPlaceholder') : t('toolPages.csvJson.jsonPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'csv2json' ? t('toolPages.csvJson.outputJson') : t('toolPages.csvJson.outputCsv')}
                            </span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                <Copy size={14} />
                                {t('toolPages.common.copy')}
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            readOnly
                            value={output}
                            placeholder={t('toolPages.csvJson.outputPlaceholder')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
