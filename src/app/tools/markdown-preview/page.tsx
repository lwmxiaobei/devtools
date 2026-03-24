'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import { marked } from 'marked';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

marked.setOptions({ breaks: true });

const SAMPLE_MARKDOWN = `# Markdown 预览工具

## 功能特性

- **实时渲染** Markdown 内容
- 支持 \`代码\` 高亮
- 支持表格、列表、引用等标准语法

## 代码块示例

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## 表格示例

| 名称 | 类型 | 说明 |
|------|------|------|
| id   | string | 唯一标识 |
| name | string | 名称 |

> 所有数据在本地浏览器处理，不上传服务器。
`;

export default function MarkdownPreviewPage() {
    const [input, setInput] = useState(SAMPLE_MARKDOWN);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    const renderedHtml = useMemo(() => {
        if (!input.trim()) return '';
        return marked(input) as string;
    }, [input]);

    const copyMarkdown = async () => {
        await navigator.clipboard.writeText(input);
        showToast(t('toolPages.common.copied'));
    };

    const copyHtml = async () => {
        await navigator.clipboard.writeText(renderedHtml);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
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
                    <h1 className="tool-title">{t('toolPages.markdownPreview.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '20px' }}>
                    <button className="action-btn secondary" onClick={copyMarkdown} disabled={!input}>
                        <Copy size={18} />
                        {t('toolPages.markdownPreview.copyMarkdown')}
                    </button>
                    <button className="action-btn secondary" onClick={copyHtml} disabled={!renderedHtml}>
                        <Copy size={18} />
                        {t('toolPages.markdownPreview.copyHtml')}
                    </button>
                    <button className="action-btn secondary" onClick={clearAll}>
                        <Trash2 size={18} />
                        {t('toolPages.common.clear')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.markdownPreview.input')}</span>
                        </div>
                        <textarea
                            className="editor-textarea"
                            placeholder={t('toolPages.markdownPreview.placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.markdownPreview.preview')}</span>
                            <button className="editor-btn" onClick={copyHtml} disabled={!renderedHtml}>
                                <Copy size={14} />
                                {t('toolPages.markdownPreview.copyHtml')}
                            </button>
                        </div>
                        <div
                            className="editor-textarea"
                            style={{ overflowY: 'auto', lineHeight: '1.7' }}
                            dangerouslySetInnerHTML={{ __html: renderedHtml }}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
