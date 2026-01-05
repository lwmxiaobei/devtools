import React from 'react';
import { FileText, Shield, AlertTriangle, BookOpen, Scale, RefreshCw, Lightbulb, CheckCircle } from 'lucide-react';
import '../privacy/privacy.css';

export const metadata = {
    title: 'Terms of Service | DevTools',
    description: 'Terms of Service for DevTools',
    robots: {
        index: false,
        follow: true,
    },
};

export default function TermsPage() {
    return (
        <div className="legal-page">
            <div className="legal-container">
                {/* Hero Section */}
                <div className="legal-hero">
                    <div className="legal-hero-icon terms-icon">
                        <FileText size={40} />
                    </div>
                    <h1 className="legal-hero-title">Terms of Service</h1>
                    <p className="legal-hero-subtitle">
                        Please read these terms carefully before using our services.
                    </p>
                    <div className="legal-hero-date">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Highlights */}
                <div className="legal-highlights">
                    <div className="highlight-card">
                        <div className="highlight-icon local">
                            <CheckCircle size={24} />
                        </div>
                        <h3>Free to Use</h3>
                        <p>All tools available at no cost</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon secure">
                            <Lightbulb size={24} />
                        </div>
                        <h3>Client-Side Tools</h3>
                        <p>Runs in your browser</p>
                    </div>
                    <div className="highlight-card">
                        <div className="highlight-icon privacy">
                            <Shield size={24} />
                        </div>
                        <h3>No Account Needed</h3>
                        <p>Use instantly without signup</p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="legal-content">
                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">01</div>
                            <h2>Acceptance of Terms</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                By accessing and using DevTools (&quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
                                In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </div>
                    </section>

                    <section className="legal-section featured">
                        <div className="section-header">
                            <div className="section-number">02</div>
                            <h2>Description of Service</h2>
                        </div>
                        <div className="section-body">
                            <div className="feature-callout">
                                <BookOpen className="callout-icon" size={24} />
                                <div>
                                    <strong>About DevTools.</strong>
                                    <span> DevTools provides a collection of online developer utilities for your convenience.</span>
                                </div>
                            </div>
                            <ul className="legal-list">
                                <li>
                                    <CheckCircle className="list-icon" size={20} />
                                    <div>
                                        <strong>Available Tools:</strong>
                                        <span> JSON formatters, encoders/decoders, image processing tools, and more - all designed to help developers work more efficiently.</span>
                                    </div>
                                </li>
                                <li>
                                    <Lightbulb className="list-icon" size={20} />
                                    <div>
                                        <strong>Note:</strong>
                                        <span> Most tools run client-side in your browser, but performance may depend on your device&apos;s capabilities.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">03</div>
                            <h2>User Conduct</h2>
                        </div>
                        <div className="section-body">
                            <p>
                                You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, impairs,
                                or renders the Service less efficient. Please use our tools responsibly and in accordance with applicable laws.
                            </p>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">04</div>
                            <h2>Intellectual Property</h2>
                        </div>
                        <div className="section-body">
                            <ul className="legal-list compact">
                                <li>
                                    <Shield className="list-icon" size={18} />
                                    <div>
                                        <span>All content on the Service, including but not limited to design, text, graphics, other files, and their selection and arrangement are the proprietary property of DevTools or its licensors.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">05</div>
                            <h2>Disclaimer of Warranties</h2>
                        </div>
                        <div className="section-body">
                            <div className="warning-callout">
                                <AlertTriangle className="callout-icon warning" size={24} />
                                <div>
                                    <span>The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. DevTools makes no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, materials, or products included on the Service.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">06</div>
                            <h2>Limitation of Liability</h2>
                        </div>
                        <div className="section-body">
                            <ul className="legal-list compact">
                                <li>
                                    <Scale className="list-icon" size={18} />
                                    <div>
                                        <span>DevTools shall not be liable for any damages of any kind arising from the use of the Service, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="legal-section">
                        <div className="section-header">
                            <div className="section-number">07</div>
                            <h2>Changes to Terms</h2>
                        </div>
                        <div className="section-body">
                            <div className="info-callout">
                                <RefreshCw className="callout-icon" size={24} />
                                <div>
                                    <span>DevTools reserves the right to change these Terms of Service from time to time. Your continued use of the Service after such changes will constitute acknowledgment and agreement of the modified terms.</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
