'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import yaml from 'js-yaml';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type Mode = 'yaml2json' | 'json2yaml';

export default function YamlJsonPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<Mode>('yaml2json');
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
            if (mode === 'yaml2json') {
                const parsed = yaml.load(input);
                setOutput(parsed === undefined ? '' : JSON.stringify(parsed, null, 2));
            } else {
                const parsed = JSON.parse(input);
                setOutput(yaml.dump(parsed));
            }
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.formatError')}: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, mode, t]);

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
        setMode(mode === 'yaml2json' ? 'json2yaml' : 'yaml2json');
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
                    <h1 className="tool-title">{t('toolPages.yamlJson.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <div className="options-grid" style={{ margin: 0 }}>
                        <button
                            className={`option-btn ${mode === 'yaml2json' ? 'active' : ''}`}
                            onClick={() => setMode('yaml2json')}
                        >
                            {t('toolPages.yamlJson.inputYaml')}
                        </button>
                        <button
                            className={`option-btn ${mode === 'json2yaml' ? 'active' : ''}`}
                            onClick={() => setMode('json2yaml')}
                        >
                            {t('toolPages.yamlJson.inputJson')}
                        </button>
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
                                {mode === 'yaml2json' ? t('toolPages.yamlJson.inputYaml') : t('toolPages.yamlJson.inputJson')}
                            </span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={mode === 'yaml2json' ? t('toolPages.yamlJson.yamlPlaceholder') : t('toolPages.yamlJson.jsonPlaceholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {mode === 'yaml2json' ? t('toolPages.yamlJson.outputJson') : t('toolPages.yamlJson.outputYaml')}
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
                            placeholder={t('toolPages.yamlJson.outputPlaceholder')}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
