'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme, mounted } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const icons = {
        light: Sun,
        dark: Moon,
        system: Monitor,
    };

    const CurrentIcon = icons[theme];

    // Don't render interactive elements until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <button className="theme-toggle" disabled>
                <Monitor size={20} />
            </button>
        );
    }

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button className="theme-toggle" onClick={() => setIsOpen(!isOpen)}>
                <CurrentIcon size={20} />
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '8px',
                    minWidth: '120px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                }}>
                    {(['light', 'dark', 'system'] as const).map((t) => {
                        const Icon = icons[t];
                        const labels = { light: '浅色', dark: '深色', system: '系统' };
                        return (
                            <button
                                key={t}
                                onClick={() => {
                                    setTheme(t);
                                    setIsOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: theme === t ? 'var(--primary-light)' : 'transparent',
                                    color: theme === t ? 'var(--primary)' : 'var(--text-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <Icon size={16} />
                                {labels[t]}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
