import { Metadata } from 'next';
import { tools } from './tools';
import { Language } from './i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

interface ToolSeoConfig {
    toolId: string;
    additionalKeywords?: string[];
    language?: Language;
}

/**
 * 为工具页面生成 SEO 元数据
 * @param config 工具 SEO 配置
 * @returns Next.js Metadata 对象
 */
export function generateToolMetadata(config: ToolSeoConfig): Metadata {
    const tool = tools.find(t => t.id === config.toolId);
    const language = config.language || 'zh';

    if (!tool) {
        return {
            title: language === 'zh' ? 'LocalTools.cc - 本地开发者工具' : 'LocalTools.cc - Local Developer Tools',
            description: language === 'zh' ? '本地开发者工具' : 'Local developer tools',
        };
    }

    // Get tool name and description based on language
    let toolName: string;
    let toolDescription: string;

    if (language === 'en' && toolNamesEn[config.toolId]) {
        toolName = toolNamesEn[config.toolId].name;
        toolDescription = toolNamesEn[config.toolId].description;
    } else {
        toolName = tool.name;
        toolDescription = tool.description;
    }

    // Generate title and description
    const title = language === 'zh'
        ? `${toolName} - 在线${toolName}工具`
        : `${toolName} - Online ${toolName} Tool`;

    const description = language === 'zh'
        ? `${toolDescription}。数据本地处理，不离开浏览器，安全可靠。LocalTools.cc 本地开发者工具箱。`
        : `${toolDescription}. Data processed locally in your browser, secure and reliable. LocalTools.cc developer toolbox.`;

    // Base keywords
    const baseKeywords = language === 'zh'
        ? [
            toolName,
            `在线${toolName}`,
            `${toolName}工具`,
            toolDescription,
            '开发者工具',
            '在线工具',
        ]
        : [
            toolName,
            `online ${toolName}`,
            `${toolName} tool`,
            toolDescription,
            'developer tools',
            'online tools',
        ];

    // Merge with additional keywords
    const additionalKeywords = language === 'zh'
        ? (toolSeoConfigs[config.toolId] || [])
        : (toolSeoConfigsEn[config.toolId] || []);
    const keywords = [...baseKeywords, ...additionalKeywords, ...(config.additionalKeywords || [])];

    const locale = language === 'zh' ? 'zh_CN' : 'en_US';
    const siteName = language === 'zh' ? 'LocalTools.cc - 本地开发者工具集合' : 'LocalTools.cc - Local Developer Tools';

    return {
        title,
        description,
        keywords,
        openGraph: {
            type: 'website',
            locale: locale,
            alternateLocale: language === 'zh' ? ['en_US'] : ['zh_CN'],
            url: `${siteUrl}${tool.path}`,
            siteName,
            title,
            description,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
        alternates: {
            canonical: `${siteUrl}${tool.path}`,
            languages: {
                'zh-CN': `${siteUrl}${tool.path}`,
                'en': `${siteUrl}${tool.path}`,
            },
        },
    };
}

/**
 * 预定义的工具 SEO 配置 (中文)
 */
export const toolSeoConfigs: Record<string, string[]> = {
    'json-formatter': ['JSON美化', 'JSON验证', 'JSON格式化工具', 'JSON pretty print', 'JSON beautify'],
    'json-compress': ['JSON压缩', 'JSON转义', 'JSON反转义', 'JSON minify', 'JSON字符串处理'],
    'json-sort': ['JSON键名排序', 'JSON对象排序', 'JSON属性排序'],
    'jsonpath': ['JSONPath查询', 'JSON数据提取', 'JSON路径查询'],
    'json5': ['JSON5解析', 'JSON5验证', 'JSON5转JSON'],
    'json-viewer': ['JSON树形视图', 'JSON可视化', 'JSON查看器'],
    'json-editor': ['JSON在线编辑', 'JSON可视化编辑', 'JSON编辑工具'],
    'jwt': ['JWT编码', 'JWT解码', 'JWT Token', 'JSON Web Token'],
    'jwt-decode': ['JWT解析', 'JWT Token解密', 'JWT详细解析'],
    'json-to-sql': ['JSON转SQL语句', 'JSON生成INSERT语句'],
    'sql-to-json': ['SQL转JSON', 'SQL结果转JSON'],
    'sql-to-java': ['SQL转Java实体类', 'DDL转Java', '数据库表转Java'],
    'json-to-java': ['JSON转Java POJO', 'JSON转Java类', 'JSON to Java Bean'],
    'json-to-python': ['JSON转Python类', 'JSON转dataclass', 'JSON to Python'],
    'json-to-schema': ['JSON Schema生成', 'JSON转Schema', '自动生成JSON Schema'],
    'json-to-objc': ['JSON转OC模型', 'JSON转Objective-C', 'iOS模型生成'],
    'lottie-preview': ['Lottie预览', 'Lottie动画', 'Lottie JSON', '动画预览'],
    'base64': ['Base64编码', 'Base64解码', '图片Base64', 'Base64转换'],
    'url-encode': ['URL编码', 'URL解码', 'encodeURIComponent', 'URL转义'],
    'md5': ['MD5加密', 'MD5哈希', 'MD5在线计算', 'MD5 hash'],
    'uuid': ['UUID生成', 'GUID生成', '随机UUID', 'UUID v4'],
    'timestamp': ['时间戳转换', 'Unix时间戳', '时间戳计算', '日期转时间戳'],
    'code-formatter': ['代码格式化', 'JavaScript格式化', 'CSS格式化', 'HTML格式化', 'SQL格式化'],
    'color-converter': ['颜色转换', 'HEX转RGB', 'RGB转HSL', '颜色代码转换'],
    'hash': ['哈希计算', 'SHA1', 'SHA256', 'SHA512', '哈希值生成'],
    'text-diff': ['文本对比', '代码对比', '差异比较', 'diff工具'],
    'case-converter': ['大小写转换', '驼峰命名', '下划线命名', 'camelCase', 'snake_case'],
    'image-grid': ['九宫格切图', '图片分割', '朋友圈九宫格', '图片切割'],
    'image-compress': ['图片压缩', '图片优化', '压缩图片大小', '图片减肥'],
    'image-crop': ['图片裁剪', '在线裁图', '图片剪切', '自定义裁剪'],
    'image-flip': ['图片翻转', '水平翻转', '垂直翻转', '图片镜像'],
    'image-rotate': ['图片旋转', '旋转图片', '图片角度调整'],
    'image-resize': ['图片缩放', '调整图片大小', '图片尺寸调整', '图片放大缩小'],
    'image-watermark': ['图片水印', '添加水印', '文字水印', '图片加字'],
    'id-photo-bg': ['证件照背景', '证件照换底色', '一寸照片', '证件照制作'],
    'qrcode-generate': ['二维码生成', '生成二维码', '二维码制作', 'QR Code'],
    'qrcode-scan': ['二维码识别', '二维码解析', '扫描二维码', '识别二维码'],
    'image-to-svg': ['图片转SVG', '位图转矢量', 'PNG转SVG', '图片矢量化'],
    'pdf-to-image': ['PDF转图片', 'PDF转JPG', 'PDF转PNG', 'PDF提取图片'],
    'image-to-pdf': ['图片转PDF', 'JPG转PDF', 'PNG转PDF', '多图合并PDF'],
    'image-to-gif': ['图片转GIF', '图片合成GIF', 'GIF制作', '动图制作', '多图转GIF', 'GIF动画'],
    'string-concat': ['字符串拼接', '文本拼接', '多行拼接', '字符串合并', '文本合并'],
    'fullwidth-halfwidth': ['全角半角转换', '全角转半角', '半角转全角', '全半角互转', '英文全角'],
    'html-strip': ['去除HTML标签', '移除HTML', 'HTML转纯文本', '去除格式', '提取纯文本'],
    'html-escape': ['HTML转义', 'HTML编码', 'HTML解码', 'HTML实体转换', '特殊字符编码'],
    'chinese-pinyin': ['汉字转拼音', '拼音转换', '中文拼音', '声调拼音', '拼音生成'],
    'chinese-convert': ['简繁转换', '繁体转简体', '简体转繁体', '火星文转换', '中文转换'],
    'vertical-text': ['竖排文字', '文字竖排', '横排转竖排', '竖版文字', '古风排版'],
    'colorful-text': ['彩色文字', '渐变文字', '彩虹文字', '文字特效', '炫彩文字'],
    'text-spacing': ['文字间隔', '字符间隔', '加空格', '文本间距', '字符分隔'],
    'ascii-art': ['ASCII艺术字', 'ASCII画', '字符画', '文字艺术', 'FIGlet'],
    'number-sum': ['数值求和', '数字求和', '多行求和', '数值统计', '求和计算'],
    'text-shuffle': ['文本打乱', '随机排序', '打乱顺序', '文本随机', '行随机排序'],
    'char-count': ['字符统计', '字符频率', '字符计数', '字母频率', '文字统计'],
    'string-count': ['字符串统计', '关键词统计', '字符串计数', '文本搜索', '出现次数'],
    'password-generator': ['密码生成', '随机密码', '安全密码', '强密码生成', '密码工具'],
    'file-hash': ['文件哈希', '文件MD5', '文件SHA', '文件校验', '文件摘要'],
    'gemini-watermark': ['去Gemini水印', 'Gemini水印', 'AI水印去除', '图片去水印'],
    'json-to-xml': ['JSON转XML', 'JSON to XML', 'JSON格式转换', 'XML转换'],
    'xml-to-json': ['XML转JSON', 'XML to JSON', 'XML格式转换', 'JSON转换'],
};

/**
 * 预定义的工具 SEO 配置 (英文)
 */
export const toolSeoConfigsEn: Record<string, string[]> = {
    'json-formatter': ['JSON beautify', 'JSON validator', 'JSON formatter tool', 'JSON pretty print', 'format JSON online'],
    'json-compress': ['JSON compress', 'JSON minify', 'JSON escape', 'JSON unescape', 'minify JSON'],
    'json-sort': ['JSON sort keys', 'sort JSON object', 'JSON key sorter'],
    'jsonpath': ['JSONPath query', 'JSON data extraction', 'JSONPath expression'],
    'json5': ['JSON5 parser', 'JSON5 validator', 'JSON5 to JSON'],
    'json-viewer': ['JSON tree view', 'JSON visualizer', 'JSON viewer'],
    'json-editor': ['JSON editor online', 'visual JSON editor', 'edit JSON'],
    'jwt': ['JWT encode', 'JWT decode', 'JWT Token', 'JSON Web Token'],
    'jwt-decode': ['JWT parser', 'JWT Token decoder', 'decode JWT'],
    'json-to-sql': ['JSON to SQL', 'generate INSERT statement from JSON'],
    'sql-to-json': ['SQL to JSON', 'convert SQL result to JSON'],
    'sql-to-java': ['SQL to Java entity', 'DDL to Java', 'database table to Java'],
    'json-to-java': ['JSON to Java POJO', 'JSON to Java class', 'JSON to Java Bean'],
    'json-to-python': ['JSON to Python class', 'JSON to dataclass', 'JSON to Python'],
    'json-to-schema': ['JSON Schema generator', 'JSON to Schema', 'auto generate JSON Schema'],
    'json-to-objc': ['JSON to Objective-C', 'JSON to OC model', 'iOS model generator'],
    'lottie-preview': ['Lottie preview', 'Lottie animation', 'Lottie JSON', 'animation preview'],
    'base64': ['Base64 encode', 'Base64 decode', 'image to Base64', 'Base64 converter'],
    'url-encode': ['URL encode', 'URL decode', 'encodeURIComponent', 'URL encoding'],
    'md5': ['MD5 hash', 'MD5 encryption', 'calculate MD5', 'MD5 generator'],
    'uuid': ['UUID generator', 'GUID generator', 'random UUID', 'UUID v4'],
    'timestamp': ['timestamp converter', 'Unix timestamp', 'epoch converter', 'date to timestamp'],
    'code-formatter': ['code formatter', 'JavaScript formatter', 'CSS formatter', 'HTML formatter', 'SQL formatter'],
    'color-converter': ['color converter', 'HEX to RGB', 'RGB to HSL', 'color code converter'],
    'hash': ['hash calculator', 'SHA1', 'SHA256', 'SHA512', 'hash generator'],
    'text-diff': ['text diff', 'code diff', 'compare text', 'diff tool'],
    'case-converter': ['case converter', 'camelCase', 'snake_case', 'PascalCase', 'kebab-case'],
    'image-grid': ['image grid split', 'split image', '9-grid cutter', 'image splitter'],
    'image-compress': ['image compressor', 'compress image', 'reduce image size', 'image optimizer'],
    'image-crop': ['crop image', 'image cropper', 'cut image', 'custom crop'],
    'image-flip': ['flip image', 'horizontal flip', 'vertical flip', 'mirror image'],
    'image-rotate': ['rotate image', 'image rotation', 'adjust image angle'],
    'image-resize': ['resize image', 'scale image', 'change image size', 'image resizer'],
    'image-watermark': ['image watermark', 'add watermark', 'text watermark', 'watermark tool'],
    'id-photo-bg': ['ID photo background', 'change photo background', 'passport photo', 'ID photo maker'],
    'qrcode-generate': ['QR code generator', 'generate QR code', 'create QR code', 'QR Code maker'],
    'qrcode-scan': ['QR code scanner', 'QR code reader', 'scan QR code', 'decode QR code'],
    'image-to-svg': ['image to SVG', 'bitmap to vector', 'PNG to SVG', 'vectorize image'],
    'pdf-to-image': ['PDF to image', 'PDF to JPG', 'PDF to PNG', 'extract images from PDF'],
    'image-to-pdf': ['image to PDF', 'JPG to PDF', 'PNG to PDF', 'merge images to PDF'],
    'image-to-gif': ['image to GIF', 'create GIF', 'GIF maker', 'animated GIF', 'multiple images to GIF', 'GIF generator'],
    'gemini-watermark': ['remove Gemini watermark', 'Gemini watermark remover', 'AI image watermark removal'],
    'string-concat': ['string concatenation', 'join strings', 'merge text', 'text concat', 'combine strings'],
    'fullwidth-halfwidth': ['fullwidth halfwidth converter', 'full half width', 'width converter', 'character width'],
    'html-strip': ['strip HTML tags', 'remove HTML', 'HTML to plain text', 'extract text', 'remove formatting'],
    'html-escape': ['HTML escape', 'HTML encode', 'HTML decode', 'HTML entities', 'escape special characters'],
    'chinese-pinyin': ['Chinese to Pinyin', 'Pinyin converter', 'Hanzi to Pinyin', 'Pinyin generator', 'tone marks'],
    'chinese-convert': ['Chinese converter', 'Traditional to Simplified', 'Simplified to Traditional', 'Chinese text converter'],
    'vertical-text': ['vertical text', 'text direction', 'vertical writing', 'text layout', 'vertical display'],
    'colorful-text': ['colorful text', 'gradient text', 'rainbow text', 'text effects', 'color text generator'],
    'text-spacing': ['text spacing', 'character spacing', 'add spaces', 'text separator', 'character separator'],
    'ascii-art': ['ASCII art', 'text art', 'FIGlet', 'character art', 'ASCII generator'],
    'number-sum': ['number sum', 'sum calculator', 'add numbers', 'total calculator', 'number addition'],
    'text-shuffle': ['shuffle text', 'randomize text', 'text randomizer', 'random order', 'line shuffler'],
    'char-count': ['character count', 'letter frequency', 'char frequency', 'character statistics', 'text analysis'],
    'string-count': ['string count', 'word count', 'keyword count', 'text search', 'occurrence counter'],
    'password-generator': ['password generator', 'random password', 'secure password', 'strong password', 'password tool'],
    'file-hash': ['file hash', 'file MD5', 'file SHA', 'file checksum', 'file digest'],
    'json-to-xml': ['JSON to XML', 'convert JSON to XML', 'JSON XML converter', 'format converter'],
    'xml-to-json': ['XML to JSON', 'convert XML to JSON', 'XML JSON converter', 'format converter'],
};

/**
 * 工具名称和描述的英文翻译
 */
export const toolNamesEn: Record<string, { name: string; description: string }> = {
    'json-formatter': { name: 'JSON Formatter', description: 'Online JSON formatter, validator, and compressor' },
    'json-compress': { name: 'JSON Compress', description: 'JSON string compression, escape and unescape' },
    'json-sort': { name: 'JSON Sort', description: 'Sort JSON objects by key names' },
    'jsonpath': { name: 'JSONPath', description: 'JSON data extraction and query' },
    'json5': { name: 'JSON5', description: 'JSON5 parser and validator' },
    'json-viewer': { name: 'JSON Viewer', description: 'Tree structure JSON viewer' },
    'json-editor': { name: 'JSON Editor', description: 'Visual JSON editor' },
    'jwt': { name: 'JWT Encode/Decode', description: 'JWT Token encoder and decoder' },
    'jwt-decode': { name: 'JWT Decode Pro', description: 'Precise JWT parser' },
    'json-to-sql': { name: 'JSON to SQL', description: 'Convert JSON data to SQL statements' },
    'sql-to-json': { name: 'SQL to JSON', description: 'Convert SQL to JSON structure' },
    'sql-to-java': { name: 'SQL to Java', description: 'Convert SQL table to Java entity class' },
    'json-to-java': { name: 'JSON to Java', description: 'Convert JSON to Java POJO class' },
    'json-to-python': { name: 'JSON to Python', description: 'Convert JSON to Python dataclass' },
    'json-to-schema': { name: 'JSON to Schema', description: 'Generate JSON Schema from JSON' },
    'json-to-objc': { name: 'JSON to Objective-C', description: 'Convert JSON to OC model class' },
    'lottie-preview': { name: 'Lottie Preview', description: 'Preview Lottie JSON animations' },
    'base64': { name: 'Base64 Encode/Decode', description: 'Text and Base64 converter, supports images' },
    'url-encode': { name: 'URL Encode/Decode', description: 'URL encoding and decoding tool' },
    'md5': { name: 'MD5 Hash', description: 'MD5 hash calculator tool' },
    'uuid': { name: 'UUID Generator', description: 'Online UUID/GUID generator' },
    'timestamp': { name: 'Unix Timestamp', description: 'Timestamp and datetime converter' },
    'code-formatter': { name: 'Code Formatter', description: 'JS/CSS/HTML/SQL code formatter' },
    'color-converter': { name: 'Color Converter', description: 'HEX/RGB/HSL color format converter' },
    'hash': { name: 'Hash Calculator', description: 'SHA1/SHA256/SHA512 hash calculator' },
    'text-diff': { name: 'Text Diff', description: 'Online text comparison tool' },
    'case-converter': { name: 'Case Converter', description: 'camelCase/snake_case/uppercase converter' },
    'image-grid': { name: 'Image Grid Split', description: 'Split image into 9 grids, support batch download' },
    'image-compress': { name: 'Image Compress', description: 'Compress image file size with quality control' },
    'image-crop': { name: 'Image Crop', description: 'Custom crop image area' },
    'image-flip': { name: 'Image Flip', description: 'Flip image horizontally or vertically' },
    'image-rotate': { name: 'Image Rotate', description: 'Rotate image angle' },
    'image-resize': { name: 'Image Resize', description: 'Resize image dimensions' },
    'image-watermark': { name: 'Image Watermark', description: 'Add text watermark to image' },
    'id-photo-bg': { name: 'ID Photo Background', description: 'Change ID photo background color' },
    'qrcode-generate': { name: 'QR Code Generator', description: 'Generate custom QR code' },
    'qrcode-scan': { name: 'QR Code Scanner', description: 'Recognize and decode QR code content' },
    'image-to-svg': { name: 'Image to SVG', description: 'Convert bitmap to SVG vector' },
    'pdf-to-image': { name: 'PDF to Image', description: 'Convert PDF file to images' },
    'image-to-pdf': { name: 'Image to PDF', description: 'Convert images to PDF file' },
    'image-to-gif': { name: 'Image to GIF', description: 'Create animated GIF from multiple images' },
    'gemini-watermark': { name: 'Remove Gemini Watermark', description: 'Remove watermark from Gemini AI generated images' },
    'string-concat': { name: 'String Concat', description: 'Concatenate multiple text strings' },
    'fullwidth-halfwidth': { name: 'Fullwidth Halfwidth Converter', description: 'Convert between fullwidth and halfwidth characters' },
    'html-strip': { name: 'Strip HTML Tags', description: 'Remove HTML tags and keep plain text' },
    'html-escape': { name: 'HTML Escape', description: 'Encode and decode HTML special characters' },
    'chinese-pinyin': { name: 'Chinese to Pinyin', description: 'Convert Chinese characters to Pinyin with tones' },
    'chinese-convert': { name: 'Chinese Converter', description: 'Convert between Simplified and Traditional Chinese' },
    'vertical-text': { name: 'Vertical Text', description: 'Convert horizontal text to vertical layout' },
    'colorful-text': { name: 'Colorful Text', description: 'Generate colorful gradient text effects' },
    'text-spacing': { name: 'Text Spacing', description: 'Add spacing between text characters' },
    'ascii-art': { name: 'ASCII Art', description: 'Convert text to ASCII art font' },
    'number-sum': { name: 'Number Sum', description: 'Calculate sum of multi-line numbers' },
    'text-shuffle': { name: 'Text Shuffle', description: 'Randomly shuffle text lines or characters' },
    'char-count': { name: 'Character Count', description: 'Count character frequency in text' },
    'string-count': { name: 'String Count', description: 'Count string occurrence in text' },
    'password-generator': { name: 'Password Generator', description: 'Generate secure random passwords' },
    'file-hash': { name: 'File Hash', description: 'Calculate MD5/SHA1/SHA256/SHA512 hash of files' },
    'json-to-xml': { name: 'JSON to XML', description: 'Convert JSON data to XML format' },
    'xml-to-json': { name: 'XML to JSON', description: 'Convert XML data to JSON format' },
};

/**
 * 获取工具页面的 SEO 元数据
 * @param toolId 工具 ID
 * @returns Next.js Metadata 对象
 */
export function getToolMetadata(toolId: string): Metadata {
    const tool = tools.find(t => t.id === toolId);

    if (!tool) {
        return {
            title: 'LocalTools.cc - 本地开发者工具',
            description: '本地开发者工具',
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

    // 获取中英文工具名称和描述
    const toolNameZh = tool.name;
    const toolDescZh = tool.description;
    const toolNameEn = toolNamesEn[toolId]?.name || toolNameZh;
    const toolDescEn = toolNamesEn[toolId]?.description || toolDescZh;

    // 生成双语标题和描述
    const title = `${toolNameZh} | ${toolNameEn} - 在线工具 Online Tool`;
    const description = `${toolDescZh}。${toolDescEn}. 数据本地处理，不离开浏览器，安全可靠。Data processed locally in browser, secure and reliable.`;

    // 合并中英文关键词
    const keywordsZh = [
        toolNameZh,
        `在线${toolNameZh}`,
        `${toolNameZh}工具`,
        toolDescZh,
        '开发者工具',
        '在线工具',
        ...(toolSeoConfigs[toolId] || []),
    ];

    const keywordsEn = [
        toolNameEn,
        `online ${toolNameEn}`,
        `${toolNameEn} tool`,
        toolDescEn,
        'developer tools',
        'online tools',
        ...(toolSeoConfigsEn[toolId] || []),
    ];

    // 去重合并
    const allKeywords = [...new Set([...keywordsZh, ...keywordsEn])];

    return {
        title,
        description,
        keywords: allKeywords,
        openGraph: {
            type: 'website',
            locale: 'zh_CN',
            alternateLocale: ['en_US'],
            url: `${siteUrl}${tool.path}`,
            siteName: 'LocalTools.cc - 本地开发者工具集合 | Local Developer Tools',
            title,
            description,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
        alternates: {
            canonical: `${siteUrl}${tool.path}`,
            languages: {
                'zh-CN': `${siteUrl}${tool.path}`,
                'en': `${siteUrl}${tool.path}`,
            },
        },
    };
}
