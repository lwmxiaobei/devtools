import { Metadata } from 'next';
import { tools } from './tools';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtools.example.com';

interface ToolSeoConfig {
    toolId: string;
    additionalKeywords?: string[];
}

/**
 * 为工具页面生成 SEO 元数据
 * @param config 工具 SEO 配置
 * @returns Next.js Metadata 对象
 */
export function generateToolMetadata(config: ToolSeoConfig): Metadata {
    const tool = tools.find(t => t.id === config.toolId);

    if (!tool) {
        return {
            title: 'DevTools - 开发者工具',
            description: '开发者在线工具',
        };
    }

    const title = `${tool.name} - 在线${tool.name}工具`;
    const description = `${tool.description}。免费在线使用，无需下载安装，支持实时处理。DevTools 开发者工具箱。`;

    // 基础关键词
    const baseKeywords = [
        tool.name,
        `在线${tool.name}`,
        `${tool.name}工具`,
        tool.description,
        '开发者工具',
        '在线工具',
    ];

    // 合并额外关键词
    const keywords = [...baseKeywords, ...(config.additionalKeywords || [])];

    return {
        title,
        description,
        keywords,
        openGraph: {
            type: 'website',
            locale: 'zh_CN',
            url: `${siteUrl}${tool.path}`,
            siteName: 'DevTools - 开发者在线工具集合',
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
        },
    };
}

/**
 * 预定义的工具 SEO 配置
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
