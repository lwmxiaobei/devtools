'use client';

import Link from 'next/link';
import { Code2, Heart, Shield, FileText } from 'lucide-react';
import { useTranslation } from './LanguageContext';
import './Footer.css';

// X (Twitter) Icon Component
const XIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="site-footer">
            <div className="footer-container">
                {/* Main Footer Content */}
                <div className="footer-main">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <div className="footer-logo-icon">
                                <Code2 size={20} />
                            </div>
                            <span>DevTools</span>
                        </Link>
                        <p className="footer-tagline">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    {/* Links Section */}
                    <div className="footer-links">
                        <div className="footer-links-group">
                            <h4>{t('footer.legal')}</h4>
                            <Link href="/privacy" className="footer-link" target='_blank'>
                                <Shield size={14} />
                                <span>{t('footer.privacy')}</span>
                            </Link>
                            <Link href="/terms" className="footer-link" target='_blank'>
                                <FileText size={14} />
                                <span>{t('footer.terms')}</span>
                            </Link>
                        </div>
                        <div className="footer-links-group">
                            <h4>{t('footer.contact')}</h4>
                            <a href="https://x.com/linxiaobei888" target="_blank" rel="noopener noreferrer" className="footer-link">
                                <XIcon size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-divider"></div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <span>© {new Date().getFullYear()} <Link href="/" className="hover:text-primary transition-colors">DevToolss    </Link>.</span>
                        <span className="footer-made-with">
                            Made with <Heart size={14} className="heart-icon" /> for developers
                        </span>
                    </div>
                    {/* <div className="footer-social">
                        <a href="https://x.com/linxiaobei888" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X (Twitter)">
                            <XIcon size={18} />
                        </a>
                    </div> */}
                </div>
            </div>
        </footer>
    );
};
