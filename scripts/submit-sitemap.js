/**
 * Google Search Console API - Sitemap 提交脚本
 *
 * 使用前准备：
 * 1. 在 Google Cloud Console 创建项目并启用 Search Console API
 * 2. 创建服务账号并下载 JSON 密钥文件
 * 3. 在 Search Console 中将服务账号邮箱添加为网站所有者
 * 4. 将密钥文件保存为 google-service-account.json（已添加到 .gitignore）
 *
 * 使用方式：
 * npm run submit-sitemap
 */

import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
// 域名资源使用 sc-domain: 前缀，URL 前缀资源使用完整 URL
const SITE_URL = 'sc-domain:localtools.cc';  // 域名资源格式
const SITEMAP_URL = 'https://localtools.cc/sitemap.xml';
const KEY_FILE_PATH = path.join(__dirname, '..', 'google-service-account.json');

async function main() {
    // 检查密钥文件是否存在
    if (!fs.existsSync(KEY_FILE_PATH)) {
        console.error('❌ 错误：找不到服务账号密钥文件');
        console.log('\n请按以下步骤操作：');
        console.log('1. 访问 https://console.cloud.google.com/');
        console.log('2. 创建或选择项目');
        console.log('3. 启用 Google Search Console API');
        console.log('4. 创建服务账号并下载 JSON 密钥');
        console.log('5. 将密钥文件保存到项目根目录，命名为: google-service-account.json');
        console.log('6. 在 Search Console 中将服务账号邮箱添加为网站所有者');
        process.exit(1);
    }

    try {
        // 认证
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/webmasters'],
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        console.log('🔄 正在连接 Google Search Console API...\n');

        // 获取站点列表
        console.log('📋 获取站点列表...');
        const sitesRes = await searchconsole.sites.list();
        const sites = sitesRes.data.siteEntry || [];

        if (sites.length === 0) {
            console.log('⚠️  未找到任何站点，请确保服务账号已添加为网站所有者');
            process.exit(1);
        }

        console.log('已验证的站点：');
        sites.forEach(site => {
            console.log(`  - ${site.siteUrl} (权限: ${site.permissionLevel})`);
        });
        console.log('');

        // 检查目标站点是否在列表中
        const targetSite = sites.find(s => s.siteUrl === SITE_URL);
        if (!targetSite) {
            console.error(`❌ 站点 ${SITE_URL} 未找到，请确保服务账号有访问权限`);
            process.exit(1);
        }

        // 提交站点地图
        console.log(`📤 正在提交站点地图: ${SITEMAP_URL}`);
        await searchconsole.sitemaps.submit({
            siteUrl: SITE_URL,
            feedpath: SITEMAP_URL,
        });
        console.log('✅ 站点地图提交成功！\n');

        // 获取已提交的站点地图列表
        console.log('📋 已提交的站点地图列表：');
        const sitemapsRes = await searchconsole.sitemaps.list({
            siteUrl: SITE_URL,
        });

        const sitemaps = sitemapsRes.data.sitemap || [];
        if (sitemaps.length === 0) {
            console.log('  暂无站点地图');
        } else {
            sitemaps.forEach(sitemap => {
                console.log(`  - ${sitemap.path}`);
                console.log(`    最后提交: ${sitemap.lastSubmitted || '未知'}`);
                console.log(`    状态: ${sitemap.warnings || 0} 警告, ${sitemap.errors || 0} 错误`);
                if (sitemap.contents) {
                    sitemap.contents.forEach(content => {
                        console.log(`    类型: ${content.type}, 已提交: ${content.submitted}, 已索引: ${content.indexed}`);
                    });
                }
                console.log('');
            });
        }

        console.log('🎉 完成！');

    } catch (error) {
        console.error('❌ 发生错误:', error.message);
        if (error.response) {
            console.error('详细信息:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

main();
