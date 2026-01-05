'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Play } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

function sqlToJson(sql: string): string {
    const lines = sql.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    const result: Record<string, unknown>[] = [];

    // 尝试解析 CREATE TABLE
    const createMatch = sql.match(/CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\)/i);
    if (createMatch) {
        const tableName = createMatch[1];
        const columnsStr = createMatch[2];
        const columns: { name: string; type: string }[] = [];

        columnsStr.split(',').forEach(col => {
            const colMatch = col.trim().match(/^(\w+)\s+(\w+)/);
            if (colMatch && colMatch[1].toLowerCase() !== 'primary') {
                columns.push({
                    name: colMatch[1],
                    type: colMatch[2].toUpperCase(),
                });
            }
        });

        return JSON.stringify({
            tableName,
            columns,
        }, null, 2);
    }

    // 尝试解析 INSERT
    const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i);
    if (insertMatch) {
        const columns = insertMatch[2].split(',').map(c => c.trim());
        const valuesStr = insertMatch[3];

        const valueMatches = valuesStr.matchAll(/\(([^)]+)\)/g);
        for (const match of valueMatches) {
            const values = match[1].split(',').map(v => {
                v = v.trim();
                if (v === 'NULL') return null;
                if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
                if (!isNaN(Number(v))) return Number(v);
                return v;
            });

            const row: Record<string, unknown> = {};
            columns.forEach((col, i) => {
                row[col] = values[i];
            });
            result.push(row);
        }

        return JSON.stringify(result, null, 2);
    }

    // 尝试解析简单的 SELECT 结果格式
    if (lines.length > 1 && lines[0].includes('|')) {
        const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].startsWith('-') || lines[i].startsWith('+')) continue;
            const values = lines[i].split('|').map(v => v.trim()).filter(Boolean);
            if (values.length === headers.length) {
                const row: Record<string, unknown> = {};
                headers.forEach((h, idx) => {
                    const v = values[idx];
                    if (v === 'NULL') row[h] = null;
                    else if (!isNaN(Number(v))) row[h] = Number(v);
                    else row[h] = v;
                });
                result.push(row);
            }
        }
        return JSON.stringify(result, null, 2);
    }

    return '// 无法解析的SQL格式\n// 请输入标准的 INSERT、CREATE TABLE 语句或表格格式的查询结果';
}

export default function SqlToJsonPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const convert = () => {
        if (!input.trim()) {
            setError('请输入 SQL');
            setOutput('');
            return;
        }

        try {
            const json = sqlToJson(input);
            setOutput(json);
            setError('');
        } catch (e) {
            setError(`转换错误: ${(e as Error).message}`);
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
                    <h1 className="tool-title">SQL 转 JSON</h1>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">输入 SQL</span>
                            <div className="editor-actions">
                                <button className="editor-btn" onClick={clearAll}>
                                    <Trash2 size={14} />
                                    清空
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={"请输入 SQL 语句，支持：\n\n1. INSERT 语句：\nINSERT INTO users (name, age) VALUES ('张三', 25);\n\n2. CREATE TABLE 语句：\nCREATE TABLE users (id INT, name VARCHAR(50));\n\n3. 查询结果表格格式：\n| id | name  |\n|----|-------|\n| 1  | 张三  |"}
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
                            <span className="editor-title">JSON 输出</span>
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
                            {error || output || 'JSON 结果将显示在这里'}
                        </pre>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
