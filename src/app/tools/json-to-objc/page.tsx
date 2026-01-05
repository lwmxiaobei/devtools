'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function getObjcType(value: unknown): string {
    if (value === null) return 'id';
    if (typeof value === 'boolean') return 'BOOL';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'NSInteger' : 'CGFloat';
    }
    if (typeof value === 'string') return 'NSString *';
    if (Array.isArray(value)) return 'NSArray *';
    if (typeof value === 'object') return 'NSDictionary *';
    return 'id';
}

function getPropertyModifier(type: string): string {
    if (type === 'BOOL' || type === 'NSInteger' || type === 'CGFloat') {
        return 'assign';
    }
    if (type === 'NSString *') {
        return 'copy';
    }
    return 'strong';
}

function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function jsonToObjc(json: unknown, className: string): { header: string; implementation: string } {
    if (typeof json !== 'object' || json === null) {
        return {
            header: '// 请输入 JSON 对象',
            implementation: '',
        };
    }

    const obj = Array.isArray(json) ? json[0] : json;
    if (!obj || typeof obj !== 'object') {
        return {
            header: '// 请输入有效的 JSON 对象或对象数组',
            implementation: '',
        };
    }

    const fields: { name: string; originalName: string; type: string }[] = [];

    for (const [key, value] of Object.entries(obj)) {
        fields.push({
            name: toCamelCase(key),
            originalName: key,
            type: getObjcType(value),
        });
    }

    // Header file
    let header = '#import <Foundation/Foundation.h>\n\n';
    header += 'NS_ASSUME_NONNULL_BEGIN\n\n';
    header += `@interface ${className} : NSObject\n\n`;

    fields.forEach(field => {
        const modifier = getPropertyModifier(field.type);
        header += `@property (nonatomic, ${modifier}) ${field.type}${field.name};\n`;
    });

    header += `\n+ (instancetype)modelWithDictionary:(NSDictionary *)dictionary;\n`;
    header += `- (NSDictionary *)toDictionary;\n`;
    header += '\n@end\n\n';
    header += 'NS_ASSUME_NONNULL_END\n';

    // Implementation file
    let impl = `#import "${className}.h"\n\n`;
    impl += `@implementation ${className}\n\n`;

    impl += '+ (instancetype)modelWithDictionary:(NSDictionary *)dictionary {\n';
    impl += `    ${className} *model = [[${className} alloc] init];\n`;
    fields.forEach(field => {
        if (field.type === 'BOOL') {
            impl += `    model.${field.name} = [dictionary[@"${field.originalName}"] boolValue];\n`;
        } else if (field.type === 'NSInteger') {
            impl += `    model.${field.name} = [dictionary[@"${field.originalName}"] integerValue];\n`;
        } else if (field.type === 'CGFloat') {
            impl += `    model.${field.name} = [dictionary[@"${field.originalName}"] doubleValue];\n`;
        } else {
            impl += `    model.${field.name} = dictionary[@"${field.originalName}"];\n`;
        }
    });
    impl += '    return model;\n';
    impl += '}\n\n';

    impl += '- (NSDictionary *)toDictionary {\n';
    impl += '    return @{\n';
    fields.forEach(field => {
        if (field.type === 'BOOL' || field.type === 'NSInteger' || field.type === 'CGFloat') {
            impl += `        @"${field.originalName}": @(self.${field.name}),\n`;
        } else {
            impl += `        @"${field.originalName}": self.${field.name} ?: [NSNull null],\n`;
        }
    });
    impl += '    };\n';
    impl += '}\n\n';

    impl += '@end\n';

    return { header, implementation: impl };
}

export default function JsonToObjcPage() {
    const [input, setInput] = useState('');
    const [headerOutput, setHeaderOutput] = useState('');
    const [implOutput, setImplOutput] = useState('');
    const [className, setClassName] = useState('Model');
    const [activeTab, setActiveTab] = useState<'header' | 'impl'>('header');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    useEffect(() => {
        if (!input.trim()) {
            setHeaderOutput('');
            setImplOutput('');
            setError('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const { header, implementation } = jsonToObjc(parsed, className);
            setHeaderOutput(header);
            setImplOutput(implementation);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.jsonFormatter.formatError')}: ${(e as Error).message}`);
            setHeaderOutput('');
            setImplOutput('');
        }
    }, [input, className, language]);

    const copyToClipboard = async () => {
        const text = activeTab === 'header' ? headerOutput : implOutput;
        if (text) {
            await navigator.clipboard.writeText(text);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setHeaderOutput('');
        setImplOutput('');
        setError('');
    };

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                <div className="tool-header">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="tool-title">{t('toolPages.jsonToObjc.title')}</h1>
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
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('toolPages.common.className')}:</label>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                background: 'var(--bg-primary)',
                            }}
                        />
                    </div>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.jsonToObjc.input')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.jsonToObjc.placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className={`editor-btn ${activeTab === 'header' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('header')}
                                    style={activeTab === 'header' ? {
                                        background: 'var(--primary-light)',
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    } : {}}
                                >
                                    {className}.h
                                </button>
                                <button
                                    className={`editor-btn ${activeTab === 'impl' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('impl')}
                                    style={activeTab === 'impl' ? {
                                        background: 'var(--primary-light)',
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    } : {}}
                                >
                                    {className}.m
                                </button>
                            </div>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!headerOutput}>
                                    <Copy size={14} />
                                    {t('toolPages.common.copy')}
                                </button>
                            </div>
                        </div>
                        <pre
                            className="editor-textarea"
                            style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                color: error ? '#ef4444' : 'inherit',
                            }}
                        >
                            {error || (activeTab === 'header' ? headerOutput : implOutput) || t('toolPages.jsonToObjc.outputPlaceholder')}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
