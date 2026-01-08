'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function PasswordGeneratorPage() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // Character sets
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguous = '0O1lI';

    const generatePassword = () => {
        let charset = '';
        let guaranteedChars = '';

        if (includeUppercase) {
            const chars = excludeAmbiguous ? uppercase.replace(/O/g, '') : uppercase;
            charset += chars;
            guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
        }
        if (includeLowercase) {
            const chars = excludeAmbiguous ? lowercase.replace(/[lI]/g, '') : lowercase;
            charset += chars;
            guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
        }
        if (includeNumbers) {
            const chars = excludeAmbiguous ? numbers.replace(/0/g, '') : numbers;
            charset += chars;
            guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
        }
        if (includeSymbols) {
            charset += symbols;
            guaranteedChars += symbols[Math.floor(Math.random() * symbols.length)];
        }

        if (charset === '') {
            showToast(t('toolPages.passwordGenerator.selectAtLeastOne'));
            return;
        }

        // Use crypto.getRandomValues for secure random generation
        const array = new Uint32Array(length - guaranteedChars.length);
        crypto.getRandomValues(array);

        let newPassword = guaranteedChars;
        for (let i = 0; i < array.length; i++) {
            newPassword += charset[array[i] % charset.length];
        }

        // Shuffle the password to randomize guaranteed characters position
        newPassword = newPassword.split('').sort(() => {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return array[0] % 2 === 0 ? 1 : -1;
        }).join('');

        setPassword(newPassword);
    };

    const calculateStrength = (pwd: string): { level: number; label: string; color: string } => {
        if (!pwd) return { level: 0, label: '', color: 'transparent' };

        let score = 0;

        // Length score
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (pwd.length >= 16) score += 1;
        if (pwd.length >= 24) score += 1;

        // Complexity score
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

        if (hasUpper) score += 1;
        if (hasLower) score += 1;
        if (hasNumber) score += 1;
        if (hasSymbol) score += 2;

        // Determine strength level
        if (score <= 3) {
            return { level: 1, label: t('toolPages.passwordGenerator.strengthWeak'), color: '#ef4444' };
        } else if (score <= 5) {
            return { level: 2, label: t('toolPages.passwordGenerator.strengthMedium'), color: '#f59e0b' };
        } else if (score <= 7) {
            return { level: 3, label: t('toolPages.passwordGenerator.strengthStrong'), color: '#10b981' };
        } else {
            return { level: 4, label: t('toolPages.passwordGenerator.strengthVeryStrong'), color: '#059669' };
        }
    };

    const strength = calculateStrength(password);

    const copyToClipboard = async () => {
        if (!password) {
            showToast(t('toolPages.passwordGenerator.generateFirst'));
            return;
        }
        await navigator.clipboard.writeText(password);
        showToast(t('toolPages.common.copied'));
    };

    // Auto-generate on mount
    useEffect(() => {
        generatePassword();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.passwordGenerator.title')}</h1>
                </div>

                <div className="dual-panel">
                    {/* Left Panel - Settings */}
                    <div className="left-panel">
                        {/* Password Length */}
                        <div className="input-group">
                            <label className="input-label">
                                {t('toolPages.passwordGenerator.passwordLength')}: <strong>{length}</strong>
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="range"
                                    min="8"
                                    max="128"
                                    value={length}
                                    onChange={(e) => setLength(parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    className="input-field"
                                    min="8"
                                    max="128"
                                    value={length}
                                    onChange={(e) => setLength(Math.min(128, Math.max(8, parseInt(e.target.value) || 8)))}
                                    style={{ width: '80px' }}
                                />
                            </div>
                        </div>

                        {/* Character Types */}
                        <div className="input-group">
                            <label className="input-label">{t('toolPages.passwordGenerator.characterTypes')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={includeUppercase}
                                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                                    />
                                    <span>{t('toolPages.passwordGenerator.uppercase')}</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={includeLowercase}
                                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                                    />
                                    <span>{t('toolPages.passwordGenerator.lowercase')}</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={includeNumbers}
                                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                                    />
                                    <span>{t('toolPages.passwordGenerator.numbers')}</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={includeSymbols}
                                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                                    />
                                    <span>{t('toolPages.passwordGenerator.symbols')}</span>
                                </label>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="input-group">
                            <label className="input-label">{t('toolPages.passwordGenerator.options')}</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={excludeAmbiguous}
                                    onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                                />
                                <span>{t('toolPages.passwordGenerator.excludeAmbiguous')}</span>
                            </label>
                        </div>

                        {/* Generate Button */}
                        <div className="action-row">
                            <button className="action-btn primary" onClick={generatePassword}>
                                <RefreshCw size={18} />
                                {t('toolPages.passwordGenerator.generate')}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Password Display */}
                    <div className="right-panel">
                        {password && (
                            <>
                                <div className="input-group">
                                    <label className="input-label">{t('toolPages.passwordGenerator.generatedPassword')}</label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius)',
                                    }}>
                                        <code style={{
                                            flex: 1,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '1.1rem',
                                            wordBreak: 'break-all',
                                            filter: showPassword ? 'none' : 'blur(5px)',
                                            userSelect: showPassword ? 'text' : 'none',
                                        }}>
                                            {password}
                                        </code>
                                        <button
                                            className="editor-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            title={showPassword ? t('toolPages.passwordGenerator.hide') : t('toolPages.passwordGenerator.show')}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button
                                            className="editor-btn"
                                            onClick={copyToClipboard}
                                            title={t('toolPages.common.copy')}
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Strength Indicator */}
                                <div className="input-group">
                                    <label className="input-label">
                                        <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
                                        {t('toolPages.passwordGenerator.passwordStrength')}
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${(strength.level / 4) * 100}%`,
                                                height: '100%',
                                                background: strength.color,
                                                transition: 'all 0.3s ease',
                                            }} />
                                        </div>
                                        <span style={{
                                            fontWeight: 600,
                                            color: strength.color,
                                            minWidth: '100px',
                                        }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
