'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, getTranslation, getToolTranslation, getCategoryTranslation } from '@/lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string, params?: Record<string, string>) => string;
    tTool: (toolId: string, field: 'name' | 'description') => string;
    tCategory: (categoryId: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'localtools-language';

function getInitialLanguage(): Language {
    if (typeof window === 'undefined') {
        return 'zh';
    }

    // Check localStorage first
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') {
        return stored;
    }

    // Auto-detect from browser preference
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
        return 'zh';
    }
    return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('zh');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setLanguageState(getInitialLanguage());
        setMounted(true);
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        // Update html lang attribute
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'zh' ? 'en' : 'zh');
    }, [language, setLanguage]);

    const t = useCallback((key: string, params?: Record<string, string>) => {
        let result = getTranslation(language, key);
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                result = result.replace(`{${k}}`, v);
            });
        }
        return result;
    }, [language]);

    const tTool = useCallback((toolId: string, field: 'name' | 'description') => {
        return getToolTranslation(language, toolId, field);
    }, [language]);

    const tCategory = useCallback((categoryId: string) => {
        return getCategoryTranslation(language, categoryId);
    }, [language]);

    // Prevent hydration mismatch by using default language on server
    if (!mounted) {
        return (
            <LanguageContext.Provider
                value={{
                    language: 'zh',
                    setLanguage,
                    toggleLanguage,
                    t: (key) => getTranslation('zh', key),
                    tTool: (toolId, field) => getToolTranslation('zh', toolId, field),
                    tCategory: (categoryId) => getCategoryTranslation('zh', categoryId),
                }}
            >
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                toggleLanguage,
                t,
                tTool,
                tCategory,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export function useTranslation() {
    const { t, tTool, tCategory, language } = useLanguage();
    return { t, tTool, tCategory, language };
}
