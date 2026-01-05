import React from 'react';
import { Shield, Lock, Eye, Cookie, Server, Mail, CheckCircle } from 'lucide-react';
import './privacy.css';

export const metadata = {
    title: 'Privacy Policy | DevTools',
    description: 'Privacy Policy for DevTools',
    robots: {
        index: false,
        follow: true,
    },
};

export default function PrivacyPage() {
    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Hero Section */}
                <div className="legal-hero">
                    <div className="legal-hero-icon">
                        <Shield size={40} />
                    </div>
                    <h1 className="legal-hero-title">Privacy Policy</h1>
                    <p className="legal-hero-subtitle">
                        Your privacy matters to us. Learn how we protect your data.
                    </p>
                    <div className="legal-hero-date">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Highlights */}
                <div className="legal-highlights">
                    <div className="highlight-card">
                        <div className="highlight-icon local">
                            <Lock size={24} />
                        </div>
                        <h3>Client-Side Processing</h3>
                        <p>Your data never leaves your browser</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon secure">
                            <Eye size={24} />
                        </div>
                        <h3>No Data Collection</h3>
                        <p>We don&apos;t store your content</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon privacy">
                            <CheckCircle size={24} />
                        </div>
                        <h3>Privacy First</h3>
                        <p>Designed with your privacy in mind</p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="legal-content">
                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">01</div>
                            <h2>Introduction</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                Welcome to DevTools (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, and share information about you when you use our website and services.
                            </p>
                        </div>
                    </section>

                    <section className="legal-section featured">
                        <div className="section-header">
                            <div className="section-number">02</div>
                            <h2>Data Processing & Privacy</h2>
                        </div>
                        <div className="section-body">
                            <div className="feature-callout">
                                <Lock className="callout-icon" size={24} />
                                <div>
                                    <strong>Your Privacy is Our Priority.</strong>
                                    <span> We designed DevTools to process your data locally in your browser whenever possible.</span>
                                </div>
                            </div>
                            <ul className="legal-list">
                                <li>
                                    <Server className="list-icon" size={20} />
                                    <div>
                                        <strong>Client-Side Processing:</strong>
                                        <span> Most of our tools (including JSON Formatter, Image Tools, Encoders, etc.) run entirely within your web browser. Your data (such as JSON code, images, or text) is <strong>not</strong> sent to our servers for processing. It stays on your device.</span>
                                    </div>
                                </li>
                                <li>
                                    <Eye className="list-icon" size={20} />
                                    <div>
                                        <strong>No Data Storage:</strong>
                                        <span> Since processing is local, we do not store the content you process with our tools.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">03</div>
                            <h2>Information We Collect</h2>
                        </div>
                        <div className="section-body">
                            <p className="section-intro">While we do not collect your tool data, we may collect standard web usage data:</p>
                            <ul className="legal-list compact">
                                <li>
                                    <CheckCircle className="list-icon" size={18} />
                                    <div>
                                        <strong>Usage Data:</strong>
                                        <span> We may collect anonymous information about how you access and use the Service (e.g., page views, rough location, browser type) to improve our website.</span>
                                    </div>
                                </li>
                                <li>
                                    <Cookie className="list-icon" size={18} />
                                    <div>
                                        <strong>Cookies:</strong>
                                        <span> We use local storage to save your preferences (like Dark Mode or History) directly on your device.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">04</div>
                            <h2>Third-Party Service Providers</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                We may use third-party Service Providers to monitor and analyze the use of our Service, such as Google Analytics.
                                These services may collect information sent by your browser as part of a web page request, such as cookies or your IP address.
                            </p>
                        </div>
                    </section>

                    <section className="legal-section contact-section">
                        <div className="section-header">
                            <div className="section-number">05</div>
                            <h2>Contact Us</h2>
                        </div>
                        <div className="section-body">
                            <div className="contact-card">
                                <Mail className="contact-icon" size={32} />
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us. We&apos;re happy to help clarify any concerns you may have.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
