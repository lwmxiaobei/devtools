'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Play } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

type SqlType = 'insert' | 'create';

function jsonToInsertSql(json: unknown, tableName: string): string {
    if (Array.isArray(json)) {
        if (json.length === 0) return '-- 空数组，无法生成SQL';

        const columns = Object.keys(json[0] as object);
        const values = json.map(item => {
            const vals = columns.map(col => {
                const val = (item as Record<string, unknown>)[col];
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (typeof val === 'boolean') return val ? '1' : '0';
                return String(val);
            });
            return `(${vals.join(', ')})`;
        });

        return `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n${values.join(',\n')};`;
    } else if (typeof json === 'object' && json !== null) {
        const columns = Object.keys(json);
        const values = columns.map(col => {
            const val = (json as Record<string, unknown>)[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? '1' : '0';
            return String(val);
        });

        return `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES (${values.join(', ')});`;
    }

    return '-- 不支持的JSON格式';
}

function jsonToCreateTableSql(json: unknown, tableName: string): string {
    const sample = Array.isArray(json) ? json[0] : json;
    if (!sample || typeof sample !== 'object') {
        return '-- 无法生成建表语句';
    }

    const columns = Object.entries(sample as object).map(([key, value]) => {
        let sqlType = 'TEXT';
        if (typeof value === 'number') {
            sqlType = Number.isInteger(value) ? 'INTEGER' : 'DECIMAL(10,2)';
        } else if (typeof value === 'boolean') {
            sqlType = 'BOOLEAN';
        } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
            sqlType = 'DATETIME';
        }
        return `    ${key} ${sqlType}`;
    });

    return `CREATE TABLE ${tableName} (\n    id INTEGER PRIMARY KEY AUTO_INCREMENT,\n${columns.join(',\n')}\n);`;
}

export default function JsonToSqlPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [tableName, setTableName] = useState('my_table');
    const [sqlType, setSqlType] = useState<SqlType>('insert');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const convert = () => {
        if (!input.trim()) {
            setError('请输入 JSON');
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            let sql: string;
            if (sqlType === 'insert') {
                sql = jsonToInsertSql(parsed, tableName);
            } else {
                sql = jsonToCreateTableSql(parsed, tableName);
            }
            setOutput(sql);
            setError('');
        } catch (e) {
            setError(`JSON 格式错误: ${(e as Error).message}`);
            setOutput('');
        }
    };

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
                    <h1 className="tool-title">JSON 转 SQL</h1>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>表名:</label>
                        <input
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
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
                        className={`action-btn ${sqlType === 'insert' ? 'primary' : 'secondary'}`}
                        onClick={() => setSqlType('insert')}
                    >
                        INSERT 语句
                    </button>
                    <button
                        className={`action-btn ${sqlType === 'create' ? 'primary' : 'secondary'}`}
                        onClick={() => setSqlType('create')}
                    >
                        CREATE TABLE
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
                            placeholder={'请输入 JSON，例如：\n[\n  {"name": "张三", "age": 25},\n  {"name": "李四", "age": 30}\n]'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="action-btn primary" onClick={convert} style={{ margin: '16px' }}>
                            <Play size={18} />
                            转换
                        </button>
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">SQL 输出</span>
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
                            {error || output || 'SQL 语句将显示在这里'}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
