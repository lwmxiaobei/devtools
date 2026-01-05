'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

function getJavaType(value: unknown): string {
    if (value === null) return 'Object';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'Integer' : 'Double';
    }
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'LocalDateTime';
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'LocalDate';
        return 'String';
    }
    if (Array.isArray(value)) {
        if (value.length > 0) {
            return `List<${getJavaType(value[0])}>`;
        }
        return 'List<Object>';
    }
    if (typeof value === 'object') {
        return 'Object';
    }
    return 'Object';
}

function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function jsonToJava(json: unknown, className: string, useLombok: boolean): string {
    if (typeof json !== 'object' || json === null) {
        return '// 请输入 JSON 对象';
    }

    const obj = Array.isArray(json) ? json[0] : json;
    if (!obj || typeof obj !== 'object') {
        return '// 请输入有效的 JSON 对象或对象数组';
    }

    const imports = new Set<string>();
    const fields: { name: string; type: string; value: unknown }[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const javaType = getJavaType(value);

        if (javaType.includes('List')) imports.add('import java.util.List;');
        if (javaType === 'LocalDateTime') imports.add('import java.time.LocalDateTime;');
        if (javaType === 'LocalDate') imports.add('import java.time.LocalDate;');

        fields.push({
            name: toCamelCase(key),
            type: javaType,
            value,
        });
    }

    let code = '';

    if (imports.size > 0) {
        code += Array.from(imports).sort().join('\n') + '\n\n';
    }

    if (useLombok) {
        code += 'import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n';
        code += '@Data\n@NoArgsConstructor\n@AllArgsConstructor\n';
    }

    code += `public class ${className} {\n\n`;

    fields.forEach(field => {
        code += `    private ${field.type} ${field.name};\n`;
    });

    if (!useLombok) {
        code += '\n';
        code += `    public ${className}() {\n    }\n\n`;

        fields.forEach(field => {
            const pascalName = toPascalCase(field.name);
            code += `    public ${field.type} get${pascalName}() {\n`;
            code += `        return ${field.name};\n`;
            code += `    }\n\n`;
            code += `    public void set${pascalName}(${field.type} ${field.name}) {\n`;
            code += `        this.${field.name} = ${field.name};\n`;
            code += `    }\n\n`;
        });
    }

    code += '}\n';

    return code;
}

export default function JsonToJavaPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [className, setClassName] = useState('Entity');
    const [useLombok, setUseLombok] = useState(true);
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const java = jsonToJava(parsed, className, useLombok);
            setOutput(java);
            setError('');
        } catch (e) {
            setError(`JSON 格式错误: ${(e as Error).message}`);
            setOutput('');
        }
    }, [input, className, useLombok]);

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            showToast('已复制到剪贴板');
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
                    <h1 className="tool-title">JSON 转 Java 实体</h1>
                    <span style={{
                        padding: '4px 12px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    }}>
                        实时
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>类名:</label>
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
                        {useLombok ? 'Lombok 已启用' : 'Lombok 已关闭'}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输入 JSON</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={'请输入 JSON，例如：\n{\n  "id": 1,\n  "user_name": "张三",\n  "email": "test@example.com",\n  "is_active": true\n}'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">Java 实体类</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={copyToClipboard} disabled={!output}>
                                    <Copy size={14} />
                                    复制
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
                            {error || output || 'Java 实体类代码将显示在这里'}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
