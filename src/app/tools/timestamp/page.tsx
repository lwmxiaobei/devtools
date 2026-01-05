'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';

export default function TimestampPage() {
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast, showToast, hideToast } = useToast();

    // 第一行：时间戳转日期
    const [timestamp1, setTimestamp1] = useState('');
    const [unit1, setUnit1] = useState('秒');
    const [result1, setResult1] = useState('');

    // 第二行：日期转时间戳
    const [datetime2, setDatetime2] = useState('');
    const [result2, setResult2] = useState('');
    const [unit2, setUnit2] = useState('秒');

    // 第三行：年月日时分秒转时间戳
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [second, setSecond] = useState('');
    const [result3, setResult3] = useState('');
    const [unit3, setUnit3] = useState('秒');

    useEffect(() => {
        const updateCurrentTime = () => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        };
        updateCurrentTime();
        intervalRef.current = setInterval(updateCurrentTime, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleStart = () => {
        if (!isRunning) {
            intervalRef.current = setInterval(() => {
                setCurrentTimestamp(Math.floor(Date.now() / 1000));
            }, 1000);
            setIsRunning(true);
        }
    };

    const handleStop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    };

    const handleRefresh = () => {
        setCurrentTimestamp(Math.floor(Date.now() / 1000));
    };

    const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    // 第一行转换：时间戳 -> 日期
    const convertTimestampToDate = () => {
        try {
            const input = timestamp1.trim();
            if (!input) {
                setResult1('请输入时间戳');
                return;
            }
            let ts = parseInt(input, 10);
            if (isNaN(ts)) {
                setResult1('无效的时间戳');
                return;
            }
            // 如果选择的是秒，转换为毫秒
            if (unit1 === '秒') {
                ts = ts * 1000;
            }
            const date = new Date(ts);
            // 检查日期是否有效
            if (isNaN(date.getTime())) {
                setResult1('无效的时间戳');
                return;
            }
            setResult1(formatDate(date));
        } catch {
            setResult1('无效的时间戳');
        }
    };

    // 解析日期时间字符串 (支持 YYYY-MM-DD HH:mm:ss 格式)
    const parseDateTime = (str: string): Date | null => {
        // 尝试解析 YYYY-MM-DD HH:mm:ss 格式
        const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
        if (match) {
            const [, y, m, d, h, min, s] = match;
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min), parseInt(s));
        }
        // 尝试解析 YYYY-MM-DD 格式
        const matchDate = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (matchDate) {
            const [, y, m, d] = matchDate;
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        }
        // 尝试使用 Date 构造函数解析
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
            return date;
        }
        return null;
    };

    // 第二行转换：日期 -> 时间戳
    const convertDateToTimestamp = () => {
        try {
            const date = parseDateTime(datetime2);
            if (!date) {
                setResult2('无效的日期时间');
                return;
            }
            const ts = unit2 === '秒' ? Math.floor(date.getTime() / 1000) : date.getTime();
            setResult2(ts.toString());
        } catch {
            setResult2('无效的日期时间');
        }
    };

    // 第三行转换：年月日时分秒 -> 时间戳
    const convertFieldsToTimestamp = () => {
        try {
            const y = parseInt(year) || new Date().getFullYear();
            const m = parseInt(month) || 1;
            const d = parseInt(day) || 1;
            const h = parseInt(hour) || 0;
            const min = parseInt(minute) || 0;
            const s = parseInt(second) || 0;
            const date = new Date(y, m - 1, d, h, min, s);
            if (isNaN(date.getTime())) {
                setResult3('无效的日期时间');
                return;
            }
            const ts = unit3 === '秒' ? Math.floor(date.getTime() / 1000) : date.getTime();
            setResult3(ts.toString());
        } catch {
            setResult3('无效的日期时间');
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: '8px 12px',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
    };

    const smallInputStyle: React.CSSProperties = {
        ...inputStyle,
        width: '60px',
        textAlign: 'center',
    };

    const selectStyle: React.CSSProperties = {
        padding: '8px 12px',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '14px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
    };

    const btnStyle: React.CSSProperties = {
        padding: '8px 16px',
        border: '1px solid var(--primary)',
        borderRadius: '4px',
        background: 'var(--bg-primary)',
        color: 'var(--primary)',
        fontSize: '14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
    };

    const labelStyle: React.CSSProperties = {
        minWidth: '180px',
        textAlign: 'right',
        color: 'var(--text-secondary)',
        fontSize: '14px',
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
                    <h1 className="tool-title">Unix 时间戳转换</h1>
                </div>

                <div className="single-panel">
                    {/* 当前时间戳显示 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            现在的Unix时间戳(Unix timestamp)是：
                        </span>
                        <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--primary)',
                        }}>
                            {currentTimestamp}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={btnStyle} onClick={handleStart}>开始</button>
                            <button style={btnStyle} onClick={handleStop}>停止</button>
                            <button style={btnStyle} onClick={handleRefresh}>刷新</button>
                        </div>
                    </div>

                    {/* 第一行：时间戳转日期 */}
                    <div style={rowStyle}>
                        <span style={labelStyle}>Unix时间戳（Unix timestamp）</span>
                        <input
                            type="text"
                            style={{ ...inputStyle, width: '180px' }}
                            value={timestamp1}
                            onChange={(e) => setTimestamp1(e.target.value)}
                            placeholder={currentTimestamp.toString()}
                        />
                        <select style={selectStyle} value={unit1} onChange={(e) => setUnit1(e.target.value)}>
                            <option value="秒">秒</option>
                            <option value="毫秒">毫秒</option>
                        </select>
                        <button style={btnStyle} onClick={convertTimestampToDate}>转换</button>
                        <input
                            type="text"
                            style={{ ...inputStyle, width: '200px' }}
                            value={result1}
                            readOnly
                            placeholder="转换结果"
                        />
                    </div>

                    {/* 第二行：日期转时间戳 */}
                    <div style={rowStyle}>
                        <span style={labelStyle}>时间（年/月/日 时:分:秒）</span>
                        <input
                            type="text"
                            style={{ ...inputStyle, width: '180px' }}
                            value={datetime2}
                            onChange={(e) => setDatetime2(e.target.value)}
                            placeholder="2026-01-04 12:00:00"
                        />
                        <button style={btnStyle} onClick={convertDateToTimestamp}>转换成Unix时间戳</button>
                        <input
                            type="text"
                            style={{ ...inputStyle, width: '180px' }}
                            value={result2}
                            readOnly
                            placeholder="转换结果"
                        />
                        <select style={selectStyle} value={unit2} onChange={(e) => setUnit2(e.target.value)}>
                            <option value="秒">秒</option>
                            <option value="毫秒">毫秒</option>
                        </select>
                    </div>

                    {/* 第三行：年月日时分秒转时间戳 */}
                    <div style={rowStyle}>
                        <span style={labelStyle}>时间</span>
                        <input
                            type="text"
                            style={smallInputStyle}
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="年"
                        />
                        <span>年</span>
                        <input
                            type="text"
                            style={smallInputStyle}
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            placeholder="月"
                        />
                        <span>月</span>
                        <input
                            type="text"
                            style={smallInputStyle}
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            placeholder="日"
                        />
                        <span>日</span>
                        <input
                            type="text"
                            style={smallInputStyle}
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            placeholder="时"
                        />
                        <span>时</span>
                        <input
                            type="text"
                            style={smallInputStyle}
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            placeholder="分"
                        />
                        <span>分</span>
                        <input
                            type="text"
                            style={smallInputStyle}
                            value={second}
                            onChange={(e) => setSecond(e.target.value)}
                            placeholder="秒"
                        />
                        <span>秒</span>
                        <button style={btnStyle} onClick={convertFieldsToTimestamp}>转换Unix时间戳</button>
                        <input
                            type="text"
                            style={{ ...inputStyle, width: '180px' }}
                            value={result3}
                            readOnly
                            placeholder="转换结果"
                        />
                        <select style={selectStyle} value={unit3} onChange={(e) => setUnit3(e.target.value)}>
                            <option value="秒">秒</option>
                            <option value="毫秒">毫秒</option>
                        </select>
                    </div>
                </div>

                {/* 编程语言代码示例 */}
                <div className="single-panel" style={{ marginTop: '24px' }}>
                    {/* 获取当前时间戳 */}
                    <h3 style={{
                        color: 'var(--primary)',
                        fontSize: '16px',
                        marginBottom: '16px',
                        fontWeight: 600
                    }}>
                        如何在不同编程语言中获取现在的Unix时间戳(Unix timestamp)?
                    </h3>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px',
                        marginBottom: '32px'
                    }}>
                        <tbody>
                            {[
                                { lang: 'Java', code: 'time' },
                                { lang: 'JavaScript', code: 'Math.round(new Date().getTime()/1000)\ngetTime()返回数值的单位是毫秒' },
                                { lang: 'Microsoft .NET / C#', code: 'epoch = (DateTime.Now.ToUniversalTime().Ticks - 621355968000000000) / 10000000' },
                                { lang: 'MySQL', code: 'SELECT unix_timestamp(now())' },
                                { lang: 'Perl', code: 'time' },
                                { lang: 'PHP', code: 'time()' },
                                { lang: 'PostgreSQL', code: 'SELECT extract(epoch FROM now())' },
                                { lang: 'Python', code: '先 import time 然后 time.time()' },
                                { lang: 'Ruby', code: '获取Unix时间戳：Time.now 或 Time.new\n显示Unix时间戳：Time.now.to_i' },
                                { lang: 'Go', code: '先 import time 然后 int32(time.Now().Unix())' },
                                { lang: 'SQL Server', code: "SELECT DATEDIFF(s, '1970-01-01 00:00:00', GETUTCDATE())" },
                                { lang: 'Unix / Linux', code: 'date +%s' },
                                { lang: 'VBScript / ASP', code: 'DateDiff("s", "01/01/1970 00:00:00", Now())' },
                                { lang: '其他操作系统\n(如果Perl被安装在系统中)', code: '命令行状态：perl -e "print time"' },
                            ].map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{
                                        padding: '12px 16px',
                                        fontWeight: 500,
                                        whiteSpace: 'pre-wrap',
                                        width: '180px',
                                        verticalAlign: 'top'
                                    }}>{item.lang}</td>
                                    <td style={{
                                        padding: '12px 16px',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '13px',
                                        whiteSpace: 'pre-wrap',
                                        color: 'var(--text-secondary)'
                                    }}>{item.code}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 时间戳转普通时间 */}
                    <h3 style={{
                        color: 'var(--primary)',
                        fontSize: '16px',
                        marginBottom: '16px',
                        fontWeight: 600
                    }}>
                        如何在不同编程语言中实现Unix时间戳(Unix timestamp) → 普通时间?
                    </h3>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px',
                        marginBottom: '32px'
                    }}>
                        <tbody>
                            {[
                                { lang: 'Java', code: 'String date = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new java.util.Date(Unix timestamp * 1000))' },
                                { lang: 'JavaScript', code: '先 var unixTimestamp = new Date(Unix timestamp * 1000) 然后 commonTime = unixTimestamp.toLocaleString()' },
                                { lang: 'Linux', code: 'date -d @Unix timestamp' },
                                { lang: 'MySQL', code: 'from_unixtime(Unix timestamp)' },
                                { lang: 'Perl', code: '先 my $time = Unix timestamp 然后 my ($sec, $min, $hour, $day, $month, $year) = (localtime($time))[0,1,2,3,4,5,6]' },
                                { lang: 'PHP', code: "date('r', Unix timestamp)" },
                                { lang: 'PostgreSQL', code: "SELECT TIMESTAMP WITH TIME ZONE 'epoch' + Unix timestamp) * INTERVAL '1 second';" },
                                { lang: 'Python', code: '先 import time 然后 time.gmtime(Unix timestamp)' },
                                { lang: 'Ruby', code: 'Time.at(Unix timestamp)' },
                                { lang: 'SQL Server', code: "DATEADD(s, Unix timestamp, '1970-01-01 00:00:00')" },
                                { lang: 'VBScript / ASP', code: 'DateAdd("s", Unix timestamp, "01/01/1970 00:00:00")' },
                                { lang: '其他操作系统\n(如果Perl被安装在系统中)', code: '命令行状态：perl -e "print scalar(localtime(Unix timestamp))"' },
                            ].map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{
                                        padding: '12px 16px',
                                        fontWeight: 500,
                                        whiteSpace: 'pre-wrap',
                                        width: '180px',
                                        verticalAlign: 'top'
                                    }}>{item.lang}</td>
                                    <td style={{
                                        padding: '12px 16px',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '13px',
                                        whiteSpace: 'pre-wrap',
                                        color: 'var(--text-secondary)'
                                    }}>{item.code}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 普通时间转时间戳 */}
                    <h3 style={{
                        color: 'var(--primary)',
                        fontSize: '16px',
                        marginBottom: '16px',
                        fontWeight: 600
                    }}>
                        如何在不同编程语言中实现普通时间 → Unix时间戳(Unix timestamp)?
                    </h3>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <tbody>
                            {[
                                { lang: 'Java', code: 'long epoch = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss").parse("01/01/1970 01:00:00");' },
                                { lang: 'JavaScript', code: 'var commonTime = new Date(Date.UTC(year, month - 1, day, hour, minute, second))' },
                                { lang: 'MySQL', code: 'SELECT unix_timestamp(time)\n时间格式: YYYY-MM-DD HH:MM:SS 或 YYMMDD 或 YYYYMMDD' },
                                { lang: 'Perl', code: '先 use Time::Local 然后 my $time = timelocal($sec, $min, $hour, $day, $month, $year);' },
                                { lang: 'PHP', code: 'mktime(hour, minute, second, month, day, year)' },
                                { lang: 'PostgreSQL', code: "SELECT extract(epoch FROM date('YYYY-MM-DD HH:MM:SS'));" },
                                { lang: 'Python', code: "先 import time 然后 int(time.mktime(time.strptime('YYYY-MM-DD HH:MM:SS', '%Y-%m-%d %H:%M:%S')))" },
                                { lang: 'Ruby', code: 'Time.local(year, month, day, hour, minute, second)' },
                                { lang: 'SQL Server', code: "SELECT DATEDIFF(s, '1970-01-01 00:00:00', time)" },
                                { lang: 'Unix / Linux', code: 'date +%s -d"Jan 1, 1970 00:00:01"' },
                                { lang: 'VBScript / ASP', code: 'DateDiff("s", "01/01/1970 00:00:00", time)' },
                            ].map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{
                                        padding: '12px 16px',
                                        fontWeight: 500,
                                        whiteSpace: 'pre-wrap',
                                        width: '180px',
                                        verticalAlign: 'top'
                                    }}>{item.lang}</td>
                                    <td style={{
                                        padding: '12px 16px',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '13px',
                                        whiteSpace: 'pre-wrap',
                                        color: 'var(--text-secondary)'
                                    }}>{item.code}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
