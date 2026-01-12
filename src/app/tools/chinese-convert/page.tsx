'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import * as OpenCC from 'opencc-js';

type ConvertMode = 'simplified' | 'traditional' | 'martian';

// 火星文转换映射表（示例部分常用字）
const martianMap: { [key: string]: string } = {
    '的': '哋', '一': '①', '是': '昰', '了': '孓', '我': '莪', '不': '卟', '人': '亾',
    '在': '洅', '他': '怹', '有': '冇', '这': '這', '个': '個', '上': '丄', '们': '們',
    '来': '來', '到': '菿', '时': '溡', '大': '汏', '地': '哋', '为': '為', '子': '孓',
    '中': 'ф', '你': '伱', '说': '說', '生': '苼', '国': '國', '年': '哖', '着': '着',
    '就': '僦', '那': '嗱', '和': '啝', '要': '崾', '她': '袔', '出': '炪', '也': '吔',
    '得': '嘚', '里': '裡', '后': '後', '自': '洎', '以': '姒', '会': '會', '家': '傢',
    '可': '岢', '下': '丅', '而': '洏', '过': '過', '天': '兲', '去': '呿', '能': '能',
    '对': '對', '小': '尐', '多': '哆', '然': '嘫', '于': '於', '心': '杺', '学': '學',
    '么': '庅', '之': 'の', '都': '嘟', '好': '恏', '看': '看', '起': '起', '发': '發',
    '当': '當', '没': '沒', '成': '荿', '只': '呮', '如': '洳', '事': '倳', '把': '紦',
    '还': '還', '用': '鼡', '第': '苐', '样': '樣', '道': '噵', '想': '想', '作': '莋',
    '种': '種', '开': '開', '美': '媄', '总': '總', '从': '從', '无': '無', '情': '啨',
    '己': '己', '面': '緬', '最': '朂', '女': '釹', '但': '泹', '现': '現', '前': '偂',
    '些': '些', '所': '所', '同': '衕', '日': 'ㄖ', '手': '掱', '又': '叒', '行': '荇',
    '意': '噫', '动': '動', '方': '汸', '期': '棋', '它': '咜', '头': '頭', '经': '經',
    '长': '長', '儿': '児', '回': '囬', '位': '莅', '分': '汾', '爱': '嬡', '老': '咾',
    '因': '洇', '很': '佷', '给': '給', '名': '洺', '法': '灋', '间': '間', '斯': '斯',
    '知': '倁', '世': '世', '什': '什', '两': '両', '次': '佽', '使': '使', '身': '裑',
    '者': '者', '被': '被', '高': '髙', '已': '巳', '亲': '親', '其': '其', '进': '進',
    '此': '茈', '话': '話', '常': '瑺', '与': '與', '活': '萿', '正': '㊣', '感': '感',
};

export default function ChineseConvertPage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [mode, setMode] = useState<ConvertMode>('traditional');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();

    const t = (key: string) => getTranslation(language, key);

    // 简体转繁体
    const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    // 繁体转简体
    const t2sConverter = OpenCC.Converter({ from: 'tw', to: 'cn' });

    const toMartian = (text: string): string => {
        return text.split('').map(char => martianMap[char] || char).join('');
    };

    const fromMartian = (text: string): string => {
        const reverseMap: { [key: string]: string } = {};
        Object.entries(martianMap).forEach(([key, value]) => {
            reverseMap[value] = key;
        });
        return text.split('').map(char => reverseMap[char] || char).join('');
    };

    useEffect(() => {
        if (!input) {
            setResult('');
            return;
        }

        try {
            switch (mode) {
                case 'simplified':
                    setResult(t2sConverter(input));
                    break;
                case 'traditional':
                    setResult(s2tConverter(input));
                    break;
                case 'martian':
                    setResult(toMartian(input));
                    break;
            }
        } catch {
            setResult(input);
        }
    }, [input, mode]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(result);
        showToast(t('toolPages.common.copied'));
    };

    const clearAll = () => {
        setInput('');
        setResult('');
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
                    <h1 className="tool-title">{t('toolPages.chineseConvert.title')}</h1>
                </div>

                <div className="action-row" style={{ marginBottom: '16px' }}>
                    <button
                        className={`action-btn ${mode === 'simplified' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('simplified')}
                    >
                        {t('toolPages.chineseConvert.toSimplified')}
                    </button>
                    <button
                        className={`action-btn ${mode === 'traditional' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('traditional')}
                    >
                        {t('toolPages.chineseConvert.toTraditional')}
                    </button>
                    <button
                        className={`action-btn ${mode === 'martian' ? 'primary' : 'secondary'}`}
                        onClick={() => setMode('martian')}
                    >
                        {t('toolPages.chineseConvert.toMartian')}
                    </button>
                </div>

                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.chineseConvert.inputText')}</span>
                            <button className="editor-btn" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('toolPages.chineseConvert.placeholder')}
                        />
                    </div>

                    <div className="editor-panel">
                        <div className="editor-header">
                            <span className="editor-title">{t('toolPages.chineseConvert.result')}</span>
                            <button className="editor-btn" onClick={copyToClipboard} disabled={!result}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <textarea
                            className="editor-textarea"
                            value={result}
                            readOnly
                            placeholder={language === 'zh' ? '转换结果将显示在这里...' : 'Conversion result will appear here...'}
                        />
                    </div>
                </div>
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
