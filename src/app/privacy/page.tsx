'use client';

import React from 'react';
import { Shield, Lock, Eye, Cookie, Server, Mail, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import './privacy.css';

export default function PrivacyPage() {
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
                    <div className="legal-hero-icon">
                        <Shield size={40} />
                    </div>
                    <h1 className="legal-hero-title">{t('privacyPage.title')}</h1>
                    <p className="legal-hero-subtitle">
                        {t('privacyPage.subtitle')}
                    </p>
                    <div className="legal-hero-date">
                        {t('footer.lastUpdated')}{formatDate()}
                    </div>
                </div>

                {/* Highlights */}
                <div className="legal-highlights">
                    <div className="highlight-card">
                        <div className="highlight-icon local">
                            <Lock size={24} />
                        </div>
                        <h3>{t('privacyPage.highlights.clientSide.title')}</h3>
                        <p>{t('privacyPage.highlights.clientSide.desc')}</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon secure">
                            <Eye size={24} />
                        </div>
                        <h3>{t('privacyPage.highlights.noDataCollection.title')}</h3>
                        <p>{t('privacyPage.highlights.noDataCollection.desc')}</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon privacy">
                            <CheckCircle size={24} />
                        </div>
                        <h3>{t('privacyPage.highlights.privacyFirst.title')}</h3>
                        <p>{t('privacyPage.highlights.privacyFirst.desc')}</p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="legal-content">
                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">01</div>
                            <h2>{t('privacyPage.sections.introduction.title')}</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                {t('privacyPage.sections.introduction.content')}
                            </p>
                        </div>
                    </section>

                    <section className="legal-section featured">
                        <div className="section-header">
                            <div className="section-number">02</div>
                            <h2>{t('privacyPage.sections.dataProcessing.title')}</h2>
                        </div>
                        <div className="section-body">
                            <div className="feature-callout">
                                <Lock className="callout-icon" size={24} />
                                <div>
                                    <strong>{t('privacyPage.sections.dataProcessing.callout.title')}</strong>
                                    <span> {t('privacyPage.sections.dataProcessing.callout.content')}</span>
                                </div>
                            </div>
                            <ul className="legal-list">
                                <li>
                                    <Server className="list-icon" size={20} />
                                    <div>
                                        <strong>{t('privacyPage.sections.dataProcessing.clientSide.title')}</strong>
                                        <span> {t('privacyPage.sections.dataProcessing.clientSide.content')}</span>
                                    </div>
                                </li>
                                <li>
                                    <Eye className="list-icon" size={20} />
                                    <div>
                                        <strong>{t('privacyPage.sections.dataProcessing.noStorage.title')}</strong>
                                        <span> {t('privacyPage.sections.dataProcessing.noStorage.content')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">03</div>
                            <h2>{t('privacyPage.sections.infoCollect.title')}</h2>
                        </div>
                        <div className="section-body">
                            <p className="section-intro">{t('privacyPage.sections.infoCollect.intro')}</p>
                            <ul className="legal-list compact">
                                <li>
                                    <CheckCircle className="list-icon" size={18} />
                                    <div>
                                        <strong>{t('privacyPage.sections.infoCollect.usage.title')}</strong>
                                        <span> {t('privacyPage.sections.infoCollect.usage.content')}</span>
                                    </div>
                                </li>
                                <li>
                                    <Cookie className="list-icon" size={18} />
                                    <div>
                                        <strong>{t('privacyPage.sections.infoCollect.cookies.title')}</strong>
                                        <span> {t('privacyPage.sections.infoCollect.cookies.content')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">04</div>
                            <h2>{t('privacyPage.sections.thirdParty.title')}</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                {t('privacyPage.sections.thirdParty.content')}
                            </p>
                        </div>
                    </section>

                    <section className="legal-section contact-section">
                        <div className="section-header">
                            <div className="section-number">05</div>
                            <h2>{t('privacyPage.sections.contact.title')}</h2>
                        </div>
                        <div className="section-body">
                            <div className="contact-card">
                                <Mail className="contact-icon" size={32} />
                                <p>
                                    {t('privacyPage.sections.contact.content')}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
