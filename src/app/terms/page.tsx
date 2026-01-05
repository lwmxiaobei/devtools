'use client';

import React from 'react';
import { FileText, Shield, AlertTriangle, BookOpen, Scale, RefreshCw, Lightbulb, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import '../privacy/privacy.css';

export default function TermsPage() {
    const { language } = useLanguage();
    const t = (key: string) => getTranslation(language, key);

    const formatDate = () => {
        const locale = language === 'zh' ? 'zh-CN' : 'en-US';
        return new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Hero Section */}
                <div className="legal-hero">
                    <div className="legal-hero-icon terms-icon">
                        <FileText size={40} />
                    </div>
                    <h1 className="legal-hero-title">{t('termsPage.title')}</h1>
                    <p className="legal-hero-subtitle">
                        {t('termsPage.subtitle')}
                    </p>
                    <div className="legal-hero-date">
                        {t('footer.lastUpdated')}{formatDate()}
                    </div>
                </div>

                {/* Highlights */}
                <div className="legal-highlights">
                    <div className="highlight-card">
                        <div className="highlight-icon local">
                            <CheckCircle size={24} />
                        </div>
                        <h3>{t('termsPage.highlights.freeToUse.title')}</h3>
                        <p>{t('termsPage.highlights.freeToUse.desc')}</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon secure">
                            <Lightbulb size={24} />
                        </div>
                        <h3>{t('termsPage.highlights.clientSide.title')}</h3>
                        <p>{t('termsPage.highlights.clientSide.desc')}</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon privacy">
                            <Shield size={24} />
                        </div>
                        <h3>{t('termsPage.highlights.noAccount.title')}</h3>
                        <p>{t('termsPage.highlights.noAccount.desc')}</p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="legal-content">
                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">01</div>
                            <h2>{t('termsPage.sections.acceptance.title')}</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                {t('termsPage.sections.acceptance.content')}
                            </p>
                        </div>
                    </section>

                    <section className="legal-section featured">
                        <div className="section-header">
                            <div className="section-number">02</div>
                            <h2>{t('termsPage.sections.description.title')}</h2>
                        </div>
                        <div className="section-body">
                            <div className="feature-callout">
                                <BookOpen className="callout-icon" size={24} />
                                <div>
                                    <strong>{t('termsPage.sections.description.callout.title')}</strong>
                                    <span> {t('termsPage.sections.description.callout.content')}</span>
                                </div>
                            </div>
                            <ul className="legal-list">
                                <li>
                                    <CheckCircle className="list-icon" size={20} />
                                    <div>
                                        <strong>{t('termsPage.sections.description.tools.title')}</strong>
                                        <span> {t('termsPage.sections.description.tools.content')}</span>
                                    </div>
                                </li>
                                <li>
                                    <Lightbulb className="list-icon" size={20} />
                                    <div>
                                        <strong>{t('termsPage.sections.description.note.title')}</strong>
                                        <span> {t('termsPage.sections.description.note.content')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">03</div>
                            <h2>{t('termsPage.sections.userConduct.title')}</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                {t('termsPage.sections.userConduct.content')}
                            </p>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">04</div>
                            <h2>{t('termsPage.sections.intellectualProperty.title')}</h2>
                        </div>
                        <div className="section-body">
                            <ul className="legal-list compact">
                                <li>
                                    <Shield className="list-icon" size={18} />
                                    <div>
                                        <span>{t('termsPage.sections.intellectualProperty.content')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">05</div>
                            <h2>{t('termsPage.sections.disclaimer.title')}</h2>
                        </div>
                        <div className="section-body">
                            <div className="warning-callout">
                                <AlertTriangle className="callout-icon warning" size={24} />
                                <div>
                                    <span>{t('termsPage.sections.disclaimer.content')}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">06</div>
                            <h2>{t('termsPage.sections.limitation.title')}</h2>
                        </div>
                        <div className="section-body">
                            <ul className="legal-list compact">
                                <li>
                                    <Scale className="list-icon" size={18} />
                                    <div>
                                        <span>{t('termsPage.sections.limitation.content')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">07</div>
                            <h2>{t('termsPage.sections.changes.title')}</h2>
                        </div>
                        <div className="section-body">
                            <div className="info-callout">
                                <RefreshCw className="callout-icon" size={24} />
                                <div>
                                    <span>{t('termsPage.sections.changes.content')}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
