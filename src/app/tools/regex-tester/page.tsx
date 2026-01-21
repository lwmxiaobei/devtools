'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Regex, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface MatchResult {
    match: string;
    index: number;
    groups: string[];
}

interface RegexTemplate {
    id: string;
    pattern: string;
    category: string;
}

const REGEX_TEMPLATES: RegexTemplate[] = [
    { id: 'email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', category: 'common' },
    { id: 'phone', pattern: '^1[3-9]\\d{9}$', category: 'common' },
    { id: 'url', pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$', category: 'network' },
    { id: 'ip', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', category: 'network' },
    { id: 'idCard', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', category: 'common' },
    { id: 'postcode', pattern: '^[1-9]\\d{5}$', category: 'common' },
    { id: 'chinese', pattern: '[\\u4e00-\\u9fa5]+', category: 'common' },
    { id: 'integer', pattern: '^-?\\d+$', category: 'number' },
    { id: 'decimal', pattern: '^-?\\d+\\.\\d+$', category: 'number' },
    { id: 'positiveInt', pattern: '^[1-9]\\d*$', category: 'number' },
    { id: 'date', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', category: 'datetime' },
    { id: 'time', pattern: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$', category: 'datetime' },
    { id: 'datetime', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\s([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$', category: 'datetime' },
    { id: 'hex', pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', category: 'common' },
    { id: 'username', pattern: '^[a-zA-Z]\\w{3,15}$', category: 'common' },
    { id: 'password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', category: 'common' },
    { id: 'domain', pattern: '^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$', category: 'network' },
    { id: 'mac', pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', category: 'network' },
];

export default function RegexTesterPage() {
    const [pattern, setPattern] = useState('');
    const [testText, setTestText] = useState('');
    const [flagG, setFlagG] = useState(true);
    const [flagI, setFlagI] = useState(false);
    const [flagM, setFlagM] = useState(false);
    const [flagS, setFlagS] = useState(false);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [error, setError] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['common']);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const executeRegex = useCallback(() => {
        if (!pattern.trim() || !testText.trim()) {
            setMatches([]);
            setError('');
            return;
        }

        try {
            let flags = '';
            if (flagG) flags += 'g';
            if (flagI) flags += 'i';
            if (flagM) flags += 'm';
            if (flagS) flags += 's';

            const regex = new RegExp(pattern, flags);
            const results: MatchResult[] = [];

            if (flagG) {
                let match;
                while ((match = regex.exec(testText)) !== null) {
                    results.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                    if (!match[0]) break;
                }
            } else {
                const match = regex.exec(testText);
                if (match) {
                    results.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1),
                    });
                }
            }

            setMatches(results);
            setError('');
        } catch (e) {
            setError((e as Error).message);
            setMatches([]);
        }
    }, [pattern, testText, flagG, flagI, flagM, flagS]);

    useEffect(() => {
        executeRegex();
    }, [executeRegex]);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setPattern('');
        setTestText('');
        setMatches([]);
        setError('');
    };

    const useTemplate = (templatePattern: string) => {
        setPattern(templatePattern);
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const getHighlightedText = () => {
        if (!testText || matches.length === 0 || error) {
            return testText;
        }

        const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedMatches.forEach((match, i) => {
            if (match.index > lastIndex) {
                parts.push(testText.slice(lastIndex, match.index));
            }
            parts.push(
                <mark key={i} style={{
                    background: 'var(--accent-color)',
                    color: 'white',
                    padding: '0 2px',
                    borderRadius: '2px',
                }}>
                    {match.match}
                </mark>
            );
            lastIndex = match.index + match.match.length;
        });

        if (lastIndex < testText.length) {
            parts.push(testText.slice(lastIndex));
        }

        return parts;
    };

    const categories = ['common', 'network', 'datetime', 'number'];

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.regexTester.title')}</h1>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}>
                        {t('toolPages.common.realtime')}
                    </span>
                </div>

                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    padding: '16px',
                    marginBottom: '16px',
                }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '12px' }}>
                        {t('toolPages.regexTester.templates')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {categories.map(category => (
                            <div key={category}>
                                <button
                                    onClick={() => toggleCategory(category)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                        textAlign: 'left',
                                    }}
                                >
                                    {expandedCategories.includes(category) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    {t(`toolPages.regexTester.templateCategories.${category}`)}
                                </button>
                                {expandedCategories.includes(category) && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '8px',
                                        paddingLeft: '24px',
                                        marginTop: '8px',
                                    }}>
                                        {REGEX_TEMPLATES.filter(tpl => tpl.category === category).map(tpl => (
                                            <div key={tpl.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '0.85rem',
                                            }}>
                                                <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 0 }}>
                                                    {t(`toolPages.regexTester.templateItems.${tpl.id}`)}
                                                </span>
                                                <button
                                                    onClick={() => useTemplate(tpl.pattern)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '0.75rem',
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius)',
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {t('toolPages.regexTester.useTemplate')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    padding: '16px',
                    marginBottom: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Regex size={16} />
                            {t('toolPages.regexTester.pattern')}
                        </span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <button className="editor-btn" onClick={() => copyToClipboard(pattern)} disabled={!pattern}>
                                <Copy size={14} />
                                {t('toolPages.common.copy')}
                            </button>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={14} />
                                {t('toolPages.common.clear')}
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        className="input-field"
                        style={{ fontFamily: 'JetBrains Mono, monospace', width: '100%' }}
                        placeholder={t('toolPages.regexTester.patternPlaceholder')}
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {t('toolPages.regexTester.flags')}:
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={flagG}
                                onChange={(e) => setFlagG(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            {t('toolPages.regexTester.flagG')}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={flagI}
                                onChange={(e) => setFlagI(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            {t('toolPages.regexTester.flagI')}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={flagM}
                                onChange={(e) => setFlagM(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            {t('toolPages.regexTester.flagM')}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={flagS}
                                onChange={(e) => setFlagS(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            {t('toolPages.regexTester.flagS')}
                        </label>
                    </div>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.regexTester.testText')}</span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.regexTester.testTextPlaceholder')}
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">
                                {t('toolPages.regexTester.matchResult')}
                                {matches.length > 0 && (
                                    <span style={{
                                        marginLeft: '8px',
                                        padding: '2px 8px',
                                        fontSize: '0.75rem',
                                        borderRadius: 'var(--radius-xl)',
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                    }}>
                                        {matches.length}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            flex: 1,
                        }}>
                            {error ? (
                                <div style={{
                                    padding: '16px',
                                    color: '#ef4444',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius)',
                                }}>
                                    {error}
                                </div>
                            ) : matches.length > 0 ? (
                                <>
                                    <div style={{
                                        flex: 1,
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius)',
                                        padding: '16px',
                                        overflow: 'auto',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}>
                                        {getHighlightedText()}
                                    </div>
                                    <div style={{
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius)',
                                        padding: '16px',
                                    }}>
                                        <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem' }}>
                                            {t('toolPages.regexTester.matches')}:
                                        </div>
                                        <div style={{ maxHeight: '150px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {matches.map((m, idx) => (
                                                <div key={idx} style={{
                                                    padding: '8px 12px',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: 'var(--radius)',
                                                    fontSize: '0.85rem',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>&quot;{m.match}&quot;</span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>index: {m.index}</span>
                                                    </div>
                                                    {m.groups.length > 0 && (
                                                        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                            {t('toolPages.regexTester.groups')}: {m.groups.map((g, i) => `$${i + 1}="${g}"`).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    flex: 1,
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius)',
                                    padding: '16px',
                                    color: 'var(--text-muted)',
                                }}>
                                    {pattern && testText ? t('toolPages.regexTester.noMatch') : t('toolPages.jsonFormatter.emptyResult')}
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
