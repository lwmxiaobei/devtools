export type Language = 'zh' | 'en';

export interface Translations {
    [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
    zh: {
        // Header
        nav: {
            tools: '工具',
        },
        search: {
            placeholder: '搜索工具...',
            noResults: '未找到相关工具',
        },
        // Footer
        footer: {
            tagline: '开发者在线工具集合，让开发更高效',
            legal: '法律条款',
            privacy: '隐私政策',
            terms: '服务条款',
            contact: '联系我们',
            copyright: '© {year} DevTools.',
            madeWith: 'Made with ❤️ for developers',
        },
        // Home page
        home: {
            noTools: '未找到匹配的工具',
            tryOther: '尝试其他关键词或切换分类',
        },
        // Categories
        categories: {
            all: '全部工具',
            json: 'JSON工具',
            jwt: 'JWT工具',
            encode: '编码加密',
            time: '时间日期',
            format: '代码格式化',
            text: '文本处理',
            image: '图片工具',
        },
        // Common actions
        actions: {
            copy: '复制',
            copied: '已复制到剪贴板',
            clear: '清空',
            format: '格式化',
            compress: '压缩',
            download: '下载',
            upload: '上传',
            reset: '重置',
            save: '保存',
            cancel: '取消',
            confirm: '确认',
            delete: '删除',
            edit: '编辑',
            preview: '预览',
            lineNumbers: '行号',
            showLineNumbers: '显示行号',
            hideLineNumbers: '隐藏行号',
        },
        // Common labels
        labels: {
            input: '输入',
            output: '输出',
            inputJson: '输入 JSON',
            outputResult: '输出结果',
            realtime: '实时',
        },
        // Common messages
        messages: {
            jsonError: 'JSON格式错误',
            emptyResult: '格式化或压缩后的结果将显示在这里',
        },
        // Tool names and descriptions
        tools: {
            'json-formatter': {
                name: 'JSON格式化',
                description: '在线JSON格式化、验证、压缩工具',
            },
            'json-compress': {
                name: 'JSON压缩转义',
                description: 'JSON字符串压缩、转义和反转义',
            },
            'json-sort': {
                name: 'JSON排序',
                description: '按键名对JSON对象进行排序',
            },
            'jsonpath': {
                name: 'JSONPath',
                description: 'JSON数据提取、查询',
            },
            'json5': {
                name: 'JSON5',
                description: 'JSON5解析验证',
            },
            'json-viewer': {
                name: 'JSON视图',
                description: '树形结构展示JSON',
            },
            'json-editor': {
                name: 'JSON编辑器',
                description: '可视化编辑JSON',
            },
            'jwt': {
                name: 'JWT加解密',
                description: 'JWT Token编码解码',
            },
            'jwt-decode': {
                name: 'JWT解密 高精度版',
                description: '精确解析JWT各部分',
            },
            'json-to-sql': {
                name: 'JSON转SQL',
                description: '将JSON数据转换为SQL语句',
            },
            'sql-to-json': {
                name: 'SQL转JSON',
                description: 'SQL转JSON结构',
            },
            'sql-to-java': {
                name: 'SQL转Java',
                description: 'SQL表结构转Java实体类',
            },
            'json-to-java': {
                name: 'JSON转Java实体',
                description: 'JSON转Java POJO类',
            },
            'json-to-python': {
                name: 'JSON转Python类',
                description: 'JSON转Python dataclass',
            },
            'json-to-schema': {
                name: 'JSON转JSON Schema',
                description: '从JSON生成JSON Schema',
            },
            'json-to-objc': {
                name: 'JSON转ObjectiveC',
                description: 'JSON转OC模型类',
            },
            'lottie-preview': {
                name: 'Lottie动画预览',
                description: '预览Lottie JSON动画',
            },
            'base64': {
                name: 'Base64编解码',
                description: '文本与Base64互转，支持图片',
            },
            'url-encode': {
                name: 'URL编解码',
                description: 'URL编码与解码转换工具',
            },
            'md5': {
                name: 'MD5加密',
                description: 'MD5哈希值计算工具',
            },
            'uuid': {
                name: 'UUID生成器',
                description: '在线生成UUID/GUID',
            },
            'timestamp': {
                name: 'Unix时间戳',
                description: '时间戳与日期时间互转',
            },
            'code-formatter': {
                name: '代码格式化',
                description: 'JS/CSS/HTML/SQL代码格式化',
            },
            'color-converter': {
                name: '颜色转换',
                description: 'HEX/RGB/HSL颜色格式互转',
            },
            'hash': {
                name: '哈希计算',
                description: 'SHA1/SHA256/SHA512哈希计算',
            },
            'text-diff': {
                name: '文本对比',
                description: '在线文本内容对比工具',
            },
            'case-converter': {
                name: '大小写转换',
                description: '驼峰/下划线/大小写转换',
            },
            'image-grid': {
                name: '九宫格切图',
                description: '将图片分割为9宫格，支持单独或批量下载',
            },
            'image-compress': {
                name: '图片压缩',
                description: '压缩图片文件大小，支持质量调节',
            },
            'image-crop': {
                name: '图片裁剪',
                description: '自定义裁剪图片区域',
            },
            'image-flip': {
                name: '图片翻转',
                description: '水平或垂直翻转图片',
            },
            'image-rotate': {
                name: '图片旋转',
                description: '旋转图片角度',
            },
            'image-resize': {
                name: '缩放照片',
                description: '调整图片尺寸大小',
            },
            'image-watermark': {
                name: '图片加水印',
                description: '给图片添加文字水印',
            },
            'id-photo-bg': {
                name: '证件照背景',
                description: '更换证件照背景颜色',
            },
            'qrcode-generate': {
                name: '二维码生成',
                description: '生成自定义二维码',
            },
            'qrcode-scan': {
                name: '二维码解析识别',
                description: '识别并解析二维码内容',
            },
            'image-to-svg': {
                name: '图片转SVG',
                description: '将位图转换为SVG矢量图',
            },
            'pdf-to-image': {
                name: 'PDF转图片',
                description: '将PDF文件转换为图片',
            },
            'image-to-pdf': {
                name: '图片转PDF',
                description: '将图片转换为PDF文件',
            },
            'gemini-watermark': {
                name: '去Gemini水印',
                description: '去除Gemini AI生成图片的水印',
            },
        },
    },
    en: {
        // Header
        nav: {
            tools: 'Tools',
        },
        search: {
            placeholder: 'Search tools...',
            noResults: 'No tools found',
        },
        // Footer
        footer: {
            tagline: 'Developer tools collection for efficient development',
            legal: 'Legal',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            contact: 'Contact Us',
            copyright: '© {year} DevTools.',
            madeWith: 'Made with ❤️ for developers',
        },
        // Home page
        home: {
            noTools: 'No matching tools found',
            tryOther: 'Try other keywords or switch category',
        },
        // Categories
        categories: {
            all: 'All Tools',
            json: 'JSON Tools',
            jwt: 'JWT Tools',
            encode: 'Encoding',
            time: 'Date & Time',
            format: 'Code Format',
            text: 'Text Tools',
            image: 'Image Tools',
        },
        // Common actions
        actions: {
            copy: 'Copy',
            copied: 'Copied to clipboard',
            clear: 'Clear',
            format: 'Format',
            compress: 'Compress',
            download: 'Download',
            upload: 'Upload',
            reset: 'Reset',
            save: 'Save',
            cancel: 'Cancel',
            confirm: 'Confirm',
            delete: 'Delete',
            edit: 'Edit',
            preview: 'Preview',
            lineNumbers: 'Line #',
            showLineNumbers: 'Show line numbers',
            hideLineNumbers: 'Hide line numbers',
        },
        // Common labels
        labels: {
            input: 'Input',
            output: 'Output',
            inputJson: 'Input JSON',
            outputResult: 'Output Result',
            realtime: 'Real-time',
        },
        // Common messages
        messages: {
            jsonError: 'JSON format error',
            emptyResult: 'Formatted or compressed result will be displayed here',
        },
        // Tool names and descriptions
        tools: {
            'json-formatter': {
                name: 'JSON Formatter',
                description: 'Online JSON formatting, validation, compression',
            },
            'json-compress': {
                name: 'JSON Compress',
                description: 'JSON string compression, escape and unescape',
            },
            'json-sort': {
                name: 'JSON Sort',
                description: 'Sort JSON objects by key names',
            },
            'jsonpath': {
                name: 'JSONPath',
                description: 'JSON data extraction and query',
            },
            'json5': {
                name: 'JSON5',
                description: 'JSON5 parsing and validation',
            },
            'json-viewer': {
                name: 'JSON Viewer',
                description: 'Display JSON in tree structure',
            },
            'json-editor': {
                name: 'JSON Editor',
                description: 'Visual JSON editing',
            },
            'jwt': {
                name: 'JWT Encoder/Decoder',
                description: 'JWT Token encoding and decoding',
            },
            'jwt-decode': {
                name: 'JWT Decoder Pro',
                description: 'Precise JWT parts parsing',
            },
            'json-to-sql': {
                name: 'JSON to SQL',
                description: 'Convert JSON data to SQL statements',
            },
            'sql-to-json': {
                name: 'SQL to JSON',
                description: 'Convert SQL to JSON structure',
            },
            'sql-to-java': {
                name: 'SQL to Java',
                description: 'Convert SQL table to Java entity class',
            },
            'json-to-java': {
                name: 'JSON to Java',
                description: 'Convert JSON to Java POJO class',
            },
            'json-to-python': {
                name: 'JSON to Python',
                description: 'Convert JSON to Python dataclass',
            },
            'json-to-schema': {
                name: 'JSON to Schema',
                description: 'Generate JSON Schema from JSON',
            },
            'json-to-objc': {
                name: 'JSON to ObjectiveC',
                description: 'Convert JSON to OC model class',
            },
            'lottie-preview': {
                name: 'Lottie Preview',
                description: 'Preview Lottie JSON animations',
            },
            'base64': {
                name: 'Base64 Encode/Decode',
                description: 'Text and Base64 conversion, supports images',
            },
            'url-encode': {
                name: 'URL Encode/Decode',
                description: 'URL encoding and decoding tool',
            },
            'md5': {
                name: 'MD5 Hash',
                description: 'MD5 hash calculation tool',
            },
            'uuid': {
                name: 'UUID Generator',
                description: 'Generate UUID/GUID online',
            },
            'timestamp': {
                name: 'Unix Timestamp',
                description: 'Timestamp and datetime conversion',
            },
            'code-formatter': {
                name: 'Code Formatter',
                description: 'JS/CSS/HTML/SQL code formatting',
            },
            'color-converter': {
                name: 'Color Converter',
                description: 'HEX/RGB/HSL color format conversion',
            },
            'hash': {
                name: 'Hash Calculator',
                description: 'SHA1/SHA256/SHA512 hash calculation',
            },
            'text-diff': {
                name: 'Text Diff',
                description: 'Online text content comparison tool',
            },
            'case-converter': {
                name: 'Case Converter',
                description: 'Camel/snake/upper/lower case conversion',
            },
            'image-grid': {
                name: 'Image Grid',
                description: 'Split image into 9-grid, batch download supported',
            },
            'image-compress': {
                name: 'Image Compress',
                description: 'Compress image file size with quality control',
            },
            'image-crop': {
                name: 'Image Crop',
                description: 'Custom crop image area',
            },
            'image-flip': {
                name: 'Image Flip',
                description: 'Flip image horizontally or vertically',
            },
            'image-rotate': {
                name: 'Image Rotate',
                description: 'Rotate image angle',
            },
            'image-resize': {
                name: 'Image Resize',
                description: 'Adjust image dimensions',
            },
            'image-watermark': {
                name: 'Image Watermark',
                description: 'Add text watermark to images',
            },
            'id-photo-bg': {
                name: 'ID Photo Background',
                description: 'Change ID photo background color',
            },
            'qrcode-generate': {
                name: 'QR Code Generator',
                description: 'Generate custom QR codes',
            },
            'qrcode-scan': {
                name: 'QR Code Scanner',
                description: 'Scan and parse QR code content',
            },
            'image-to-svg': {
                name: 'Image to SVG',
                description: 'Convert bitmap to SVG vector',
            },
            'pdf-to-image': {
                name: 'PDF to Image',
                description: 'Convert PDF files to images',
            },
            'image-to-pdf': {
                name: 'Image to PDF',
                description: 'Convert images to PDF file',
            },
            'gemini-watermark': {
                name: 'Gemini Watermark Remover',
                description: 'Remove watermarks from Gemini AI generated images',
            },
        },
    },
};

export function getTranslation(lang: Language, key: string): string {
    const keys = key.split('.');
    let result: string | Translations = translations[lang];

    for (const k of keys) {
        if (typeof result === 'object' && result !== null && k in result) {
            result = result[k];
        } else {
            return key; // Return key if translation not found
        }
    }

    return typeof result === 'string' ? result : key;
}

export function getToolTranslation(lang: Language, toolId: string, field: 'name' | 'description'): string {
    const toolKey = `tools.${toolId}.${field}`;
    return getTranslation(lang, toolKey);
}

export function getCategoryTranslation(lang: Language, categoryId: string): string {
    return getTranslation(lang, `categories.${categoryId}`);
}

export default translations;
