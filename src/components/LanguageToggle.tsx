'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { Language } from '@/lib/i18n';

interface LanguageOption {
    code: Language;
    name: string;
    flag: string;
}

const languages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    const currentLanguage = languages.find(l => l.code === language);

    return (
        <div className="language-toggle-wrapper" ref={dropdownRef}>
            <button
                className="theme-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
                aria-expanded={isOpen}
            >
                <Languages size={18} />
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-option ${language === lang.code ? 'active' : ''}`}
                            onClick={() => handleLanguageSelect(lang.code)}
                        >
                            <span className="language-flag">{lang.flag}</span>
                            <span className="language-name">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
