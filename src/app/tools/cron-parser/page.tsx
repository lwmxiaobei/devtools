'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface CronField {
    name: string;
    value: string;
    description: string;
    range: string;
}

interface ParsedCron {
    fields: CronField[];
    isValid: boolean;
    humanReadable: string;
    hasSixFields: boolean;
}

const COMMON_EXPRESSIONS = [
    { cron: '* * * * *', key: 'everyMinute' },
    { cron: '0 * * * *', key: 'everyHour' },
    { cron: '0 0 * * *', key: 'everyDay' },
    { cron: '0 0 * * 1', key: 'everyWeek' },
    { cron: '0 0 1 * *', key: 'everyMonth' },
    { cron: '0 0 * * 1-5', key: 'weekdays' },
];

function parseCronField(value: string, min: number, max: number): number[] {
    const results: number[] = [];
    
    if (value === '*') {
        for (let i = min; i <= max; i++) results.push(i);
        return results;
    }
    
    const parts = value.split(',');
    for (const part of parts) {
        if (part.includes('/')) {
            const [range, stepStr] = part.split('/');
            const step = parseInt(stepStr, 10);
            let start = min;
            let end = max;
            
            if (range !== '*') {
                if (range.includes('-')) {
                    [start, end] = range.split('-').map(n => parseInt(n, 10));
                } else {
                    start = parseInt(range, 10);
                }
            }
            
            for (let i = start; i <= end; i += step) {
                if (i >= min && i <= max) results.push(i);
            }
        } else if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n, 10));
            for (let i = start; i <= end; i++) {
                if (i >= min && i <= max) results.push(i);
            }
        } else {
            const num = parseInt(part, 10);
            if (!isNaN(num) && num >= min && num <= max) {
                results.push(num);
            }
        }
    }
    
    return [...new Set(results)].sort((a, b) => a - b);
}

function getNextExecutions(cronParts: string[], count: number): Date[] {
    const results: Date[] = [];
    const now = new Date();
    let current = new Date(now);
    current.setMilliseconds(0);
    
    const hasSixFields = cronParts.length === 6;
    const [secondPart, minutePart, hourPart, dayPart, monthPart, weekdayPart] = hasSixFields
        ? cronParts
        : ['0', ...cronParts];
    
    const seconds = parseCronField(secondPart, 0, 59);
    const minutes = parseCronField(minutePart, 0, 59);
    const hours = parseCronField(hourPart, 0, 23);
    const days = parseCronField(dayPart, 1, 31);
    const months = parseCronField(monthPart, 1, 12);
    const weekdays = parseCronField(weekdayPart, 0, 6);
    
    const findNext = (arr: number[], current: number, max: number): { value: number; wrapped: boolean } => {
        for (const v of arr) {
            if (v > current) return { value: v, wrapped: false };
        }
        return { value: arr[0], wrapped: true };
    };
    
    let iterations = 0;
    const maxIterations = 1000;
    
    current.setSeconds(current.getSeconds() + 1);
    
    while (results.length < count && iterations < maxIterations) {
        iterations++;
        
        let month = current.getMonth() + 1;
        if (!months.includes(month)) {
            const next = findNext(months, month, 12);
            if (next.wrapped) {
                current.setFullYear(current.getFullYear() + 1);
            }
            current.setMonth(next.value - 1);
            current.setDate(1);
            current.setHours(0, 0, 0, 0);
            continue;
        }
        
        let day = current.getDate();
        const weekday = current.getDay();
        const lastDayOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
        
        if (!days.includes(day) || !weekdays.includes(weekday)) {
            let found = false;
            for (let d = day; d <= lastDayOfMonth; d++) {
                const testDate = new Date(current.getFullYear(), current.getMonth(), d);
                if (days.includes(d) && weekdays.includes(testDate.getDay())) {
                    current.setDate(d);
                    if (d !== day) {
                        current.setHours(0, 0, 0, 0);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                current.setMonth(current.getMonth() + 1);
                current.setDate(1);
                current.setHours(0, 0, 0, 0);
                continue;
            }
        }
        
        let hour = current.getHours();
        if (!hours.includes(hour)) {
            const next = findNext(hours, hour, 23);
            if (next.wrapped) {
                current.setDate(current.getDate() + 1);
                current.setHours(next.value, 0, 0, 0);
            } else {
                current.setHours(next.value, 0, 0, 0);
            }
            continue;
        }
        
        let minute = current.getMinutes();
        if (!minutes.includes(minute)) {
            const next = findNext(minutes, minute, 59);
            if (next.wrapped) {
                current.setHours(current.getHours() + 1);
                current.setMinutes(next.value);
                current.setSeconds(0);
            } else {
                current.setMinutes(next.value);
                current.setSeconds(0);
            }
            continue;
        }
        
        let second = current.getSeconds();
        if (!seconds.includes(second)) {
            const next = findNext(seconds, second, 59);
            if (next.wrapped) {
                current.setMinutes(current.getMinutes() + 1);
                current.setSeconds(next.value);
            } else {
                current.setSeconds(next.value);
            }
            continue;
        }
        
        results.push(new Date(current));
        current.setSeconds(current.getSeconds() + 1);
    }
    
    return results;
}

function generateHumanReadable(cronParts: string[], language: 'zh' | 'en'): string {
    const hasSixFields = cronParts.length === 6;
    const [second, minute, hour, day, month, weekday] = hasSixFields
        ? cronParts
        : ['0', ...cronParts];
    
    const weekdayNamesZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekdayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNamesEn = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const formatTime = (h: string, m: string, s: string) => {
        const hh = h.padStart(2, '0');
        const mm = m.padStart(2, '0');
        if (s !== '0' && s !== '*') return `${hh}:${mm}:${s.padStart(2, '0')}`;
        return `${hh}:${mm}`;
    };
    
    const formatWeekday = (w: string, lang: 'zh' | 'en') => {
        if (w === '*') return '';
        if (w === '1-5') return lang === 'zh' ? '工作日' : 'weekdays';
        if (w === '0,6') return lang === 'zh' ? '周末' : 'weekends';
        const idx = parseInt(w, 10);
        if (!isNaN(idx) && idx >= 0 && idx <= 6) {
            return lang === 'zh' ? weekdayNamesZh[idx] : weekdayNamesEn[idx];
        }
        return lang === 'zh' ? `周${w}` : `day ${w}`;
    };
    
    if (language === 'zh') {
        const timePart = (hour === '*' && minute === '*') 
            ? '每分钟' 
            : (hour === '*' 
                ? `每小时的第 ${minute} 分` 
                : (minute === '*' 
                    ? `${hour} 点的每分钟` 
                    : formatTime(hour, minute, second)));
        
        let datePart = '';
        if (month !== '*' && day !== '*') {
            datePart = `${month}月${day}日 `;
        } else if (month !== '*') {
            datePart = `每年${month}月的每天 `;
        } else if (day !== '*') {
            datePart = `每月${day}日 `;
        }
        
        let weekdayPart = '';
        if (weekday !== '*') {
            const wdStr = formatWeekday(weekday, 'zh');
            if (datePart) {
                weekdayPart = `（${wdStr}）`;
            } else {
                weekdayPart = `每${wdStr} `;
            }
        } else if (!datePart) {
            datePart = '每天 ';
        }
        
        return `${datePart}${weekdayPart}${timePart}`;
    } else {
        const timePart = (hour === '*' && minute === '*')
            ? 'every minute'
            : (hour === '*'
                ? `at minute ${minute} of every hour`
                : (minute === '*'
                    ? `every minute of hour ${hour}`
                    : `at ${formatTime(hour, minute, second)}`));
        
        let datePart = '';
        if (month !== '*' && day !== '*') {
            datePart = `${monthNamesEn[parseInt(month)] || `month ${month}`} ${day}, `;
        } else if (month !== '*') {
            datePart = `every day in ${monthNamesEn[parseInt(month)] || `month ${month}`}, `;
        } else if (day !== '*') {
            datePart = `on day ${day} of every month, `;
        }
        
        let weekdayPart = '';
        if (weekday !== '*') {
            const wdStr = formatWeekday(weekday, 'en');
            if (datePart) {
                weekdayPart = `(${wdStr}) `;
            } else {
                weekdayPart = `every ${wdStr}, `;
            }
        } else if (!datePart) {
            datePart = 'every day, ';
        }
        
        return `${datePart}${weekdayPart}${timePart}`;
    }
}

function validateCronExpression(expression: string): boolean {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5 && parts.length !== 6) return false;
    
    const fieldPatterns = /^(\*|[0-9]+(-[0-9]+)?(\/[0-9]+)?)(,(\*|[0-9]+(-[0-9]+)?(\/[0-9]+)?))*$/;
    
    if (!parts.every(part => fieldPatterns.test(part))) return false;
    
    const hasSixFields = parts.length === 6;
    const ranges = hasSixFields
        ? [[0, 59], [0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]
        : [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const [min, max] = ranges[i];
        
        if (part === '*') continue;
        
        const segments = part.split(',');
        for (const seg of segments) {
            const base = seg.split('/')[0];
            if (base === '*') continue;
            
            const nums = base.split('-').map(n => parseInt(n, 10));
            for (const num of nums) {
                if (isNaN(num) || num < min || num > max) return false;
            }
        }
    }
    
    return true;
}

export default function CronParserPage() {
    const [input, setInput] = useState('0 0 * * *');
    const [nextCount, setNextCount] = useState(5);
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();
    
    const t = (key: string) => getTranslation(language, key);
    
    const parseCron = useCallback((expression: string): ParsedCron | null => {
        if (!expression.trim()) return null;
        
        const isValid = validateCronExpression(expression);
        if (!isValid) return { fields: [], isValid: false, humanReadable: '', hasSixFields: false };
        
        const parts = expression.trim().split(/\s+/);
        const hasSixFields = parts.length === 6;
        
        const fieldNames = hasSixFields
            ? ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
            : ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
        
        const fieldRanges = hasSixFields
            ? ['0-59', '0-59', '0-23', '1-31', '1-12', '0-6']
            : ['0-59', '0-23', '1-31', '1-12', '0-6'];
        
        const fields: CronField[] = parts.map((value, index) => ({
            name: fieldNames[index],
            value,
            description: t(`toolPages.cronParser.fields.${fieldNames[index]}`),
            range: fieldRanges[index],
        }));
        
        const humanReadable = generateHumanReadable(parts, language as 'zh' | 'en');
        
        return { fields, isValid: true, humanReadable, hasSixFields };
    }, [language, t]);
    
    const parsed = parseCron(input);
    const nextExecutions = parsed?.isValid ? getNextExecutions(input.trim().split(/\s+/), nextCount) : [];
    
    const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(input);
            showToast(t('toolPages.common.copySuccess'));
        } catch {
            showToast(t('toolPages.common.copyFailed'));
        }
    };
    
    const handleClear = () => {
        setInput('');
    };
    
    const handleExpressionClick = (cron: string) => {
        setInput(cron);
    };
    
    const inputStyle: React.CSSProperties = {
        padding: '12px 16px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        fontSize: '16px',
        fontFamily: 'JetBrains Mono, monospace',
        outline: 'none',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        width: '100%',
    };
    
    const btnStyle: React.CSSProperties = {
        padding: '8px 16px',
        border: '1px solid var(--primary)',
        borderRadius: '4px',
        background: 'var(--bg-primary)',
        color: 'var(--primary)',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };
    
    const tagStyle: React.CSSProperties = {
        padding: '6px 12px',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'JetBrains Mono, monospace',
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
                    <h1 className="tool-title">{t('toolPages.cronParser.title')}</h1>
                </div>
                
                <div className="single-panel" style={{ maxWidth: '100%' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {t('toolPages.cronParser.inputLabel')}
                        </label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('toolPages.cronParser.inputPlaceholder')}
                            />
                            <button style={btnStyle} onClick={handleCopy}>
                                <Copy size={16} />
                                {t('toolPages.cronParser.copyBtn')}
                            </button>
                            <button style={btnStyle} onClick={handleClear}>
                                <Trash2 size={16} />
                                {t('toolPages.cronParser.clearBtn')}
                            </button>
                        </div>
                        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {t('toolPages.cronParser.supportsSixFields')}
                        </p>
                    </div>
                    
                    {parsed && !parsed.isValid && input.trim() && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: '#ef4444',
                            marginBottom: '24px',
                        }}>
                            {t('toolPages.cronParser.invalidCron')}
                        </div>
                    )}
                    
                    {parsed?.isValid && (
                        <>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ color: 'var(--primary)', fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>
                                    {t('toolPages.cronParser.humanReadable')}
                                </h3>
                                <div style={{
                                    padding: '16px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '6px',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                }}>
                                    {parsed.humanReadable}
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ color: 'var(--primary)', fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>
                                    {t('toolPages.cronParser.fieldExplanation')}
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                                {language === 'zh' ? '字段' : 'Field'}
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                                {language === 'zh' ? '值' : 'Value'}
                                            </th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                                                {language === 'zh' ? '范围' : 'Range'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsed.fields.map((field, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                                                    {field.description}
                                                </td>
                                                <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                                                    {field.value}
                                                </td>
                                                <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                    {field.range}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <h3 style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                                        {t('toolPages.cronParser.nextExecutions')}
                                    </h3>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {t('toolPages.cronParser.nextExecutionsCount')}:
                                        <select
                                            value={nextCount}
                                            onChange={(e) => setNextCount(parseInt(e.target.value))}
                                            style={{
                                                padding: '4px 8px',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                        </select>
                                    </label>
                                </div>
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '6px',
                                    padding: '16px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '14px',
                                }}>
                                    {nextExecutions.length > 0 ? (
                                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'decimal' }}>
                                            {nextExecutions.map((date, index) => (
                                                <li key={index} style={{ padding: '4px 0' }}>
                                                    {formatDate(date)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                            {t('toolPages.cronParser.invalidCron')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ color: 'var(--primary)', fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>
                            {t('toolPages.cronParser.commonExpressions')}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {COMMON_EXPRESSIONS.map((item) => (
                                <button
                                    key={item.cron}
                                    style={tagStyle}
                                    onClick={() => handleExpressionClick(item.cron)}
                                >
                                    <span style={{ fontWeight: 600 }}>{item.cron}</span>
                                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
                                        {t(`toolPages.cronParser.expressions.${item.key}`)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h3 style={{ color: 'var(--primary)', fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>
                            {t('toolPages.cronParser.specialChars')}
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '12px',
                        }}>
                            {['asterisk', 'comma', 'hyphen', 'slash'].map((char) => (
                                <div
                                    key={char}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                    }}
                                >
                                    {t(`toolPages.cronParser.specialCharDescriptions.${char}`)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
