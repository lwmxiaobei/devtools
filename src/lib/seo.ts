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
            title: language === 'zh' ? 'DevTools - 开发者工具' : 'DevTools - Developer Tools',
            description: language === 'zh' ? '开发者在线工具' : 'Online developer tools',
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
        ? `${toolDescription}。免费在线使用，无需下载安装，支持实时处理。DevTools 开发者工具箱。`
        : `${toolDescription}. Free online tool, no download required, supports real-time processing. DevTools developer toolbox.`;

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
    const siteName = language === 'zh' ? 'DevTools - 开发者在线工具集合' : 'DevTools - Online Developer Tools';

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
    'gemini-watermark': ['remove Gemini watermark', 'Gemini watermark remover', 'AI image watermark removal'],
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
    'gemini-watermark': { name: 'Remove Gemini Watermark', description: 'Remove watermark from Gemini AI generated images' },
};

/**
 * 获取工具页面的 SEO 元数据
 * @param toolId 工具 ID
 * @returns Next.js Metadata 对象
 */
export function getToolMetadata(toolId: string): Metadata {
    return generateToolMetadata({
        toolId,
        additionalKeywords: toolSeoConfigs[toolId] || [],
    });
}
