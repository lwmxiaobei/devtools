'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Play } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

function sqlTypeToJavaType(sqlType: string): string {
    const type = sqlType.toUpperCase();
    if (type.includes('INT') || type.includes('TINYINT') || type.includes('SMALLINT')) return 'Integer';
    if (type.includes('BIGINT')) return 'Long';
    if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('MONEY')) return 'BigDecimal';
    if (type.includes('FLOAT') || type.includes('REAL')) return 'Float';
    if (type.includes('DOUBLE')) return 'Double';
    if (type.includes('BOOL')) return 'Boolean';
    if (type.includes('DATE') && !type.includes('TIME')) return 'LocalDate';
    if (type.includes('TIME') && !type.includes('DATE')) return 'LocalTime';
    if (type.includes('DATETIME') || type.includes('TIMESTAMP')) return 'LocalDateTime';
    if (type.includes('BLOB') || type.includes('BINARY')) return 'byte[]';
    return 'String';
}

function toCamelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function sqlToJava(sql: string, className: string, useLombok: boolean): string {
    const createMatch = sql.match(/CREATE\s+TABLE\s+[\`\[\"]?(\w+)[\`\]\"]?\s*\(([\s\S]*?)\)(?:\s*;)?/i);

    if (!createMatch) {
        return '// 请输入有效的 CREATE TABLE 语句';
    }

    const columnsStr = createMatch[2];
    const columns: { name: string; type: string; javaType: string; camelName: string }[] = [];
    const imports = new Set<string>();

    columnsStr.split(',').forEach(col => {
        const colMatch = col.trim().match(/^[\`\[\"]?(\w+)[\`\]\"]?\s+([A-Za-z]+(?:\([^)]*\))?)/i);
        if (colMatch) {
            const colName = colMatch[1];
            const sqlType = colMatch[2];

            // 跳过约束关键字
            if (['PRIMARY', 'FOREIGN', 'KEY', 'INDEX', 'CONSTRAINT', 'UNIQUE'].includes(colName.toUpperCase())) {
                return;
            }

            const javaType = sqlTypeToJavaType(sqlType);

            // 添加必要的 import
            if (javaType === 'BigDecimal') imports.add('import java.math.BigDecimal;');
            if (javaType === 'LocalDate') imports.add('import java.time.LocalDate;');
            if (javaType === 'LocalTime') imports.add('import java.time.LocalTime;');
            if (javaType === 'LocalDateTime') imports.add('import java.time.LocalDateTime;');

            columns.push({
                name: colName,
                type: sqlType,
                javaType,
                camelName: toCamelCase(colName),
            });
        }
    });

    let code = '';

    // Imports
    if (imports.size > 0) {
        code += Array.from(imports).sort().join('\n') + '\n\n';
    }

    if (useLombok) {
        code += 'import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n';
        code += '@Data\n@NoArgsConstructor\n@AllArgsConstructor\n';
    }

    code += `public class ${className} {\n\n`;

    // Fields
    columns.forEach(col => {
        code += `    private ${col.javaType} ${col.camelName};\n`;
    });

    if (!useLombok) {
        code += '\n';

        // Constructor
        code += `    public ${className}() {\n    }\n\n`;

        // Getters and Setters
        columns.forEach(col => {
            const pascalName = toPascalCase(col.camelName);
            code += `    public ${col.javaType} get${pascalName}() {\n`;
            code += `        return ${col.camelName};\n`;
            code += `    }\n\n`;
            code += `    public void set${pascalName}(${col.javaType} ${col.camelName}) {\n`;
            code += `        this.${col.camelName} = ${col.camelName};\n`;
            code += `    }\n\n`;
        });
    }

    code += '}\n';

    return code;
}

export default function SqlToJavaPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [className, setClassName] = useState('Entity');
    const [useLombok, setUseLombok] = useState(true);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const convert = () => {
        if (!input.trim()) {
            setError(t('toolPages.sqlToJava.inputSql'));
            setOutput('');
            return;
        }

        try {
            const java = sqlToJava(input, className, useLombok);
            setOutput(java);
            setError('');
        } catch (e) {
            setError(`${t('toolPages.common.convert')}${t('toolPages.common.error')}: ${(e as Error).message}`);
            setOutput('');
        }
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast(t('toolPages.common.copied'));
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
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
                    <h1 className="tool-title">{t('toolPages.sqlToJava.title')}</h1>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
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
                    <button
                        className={`action-btn ${useLombok ? 'primary' : 'secondary'}`}
                        onClick={() => setUseLombok(!useLombok)}
                    >
                        {useLombok ? t('toolPages.common.lombokEnabled') : t('toolPages.common.lombokDisabled')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.sqlToJava.input')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    {t('toolPages.common.clear')}
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.sqlToJava.placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <div style={{ padding: '16px' }}>
                            <button className="action-btn primary" onClick={convert}>
                                <Play size={18} />
                                {t('toolPages.common.convert')}
                            </button>
                        </div>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.sqlToJava.output')}</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
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
                            {error || output || t('toolPages.sqlToJava.outputPlaceholder')}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
