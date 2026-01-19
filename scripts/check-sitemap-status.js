/**
 * Google Search Console API - Sitemap 状态检查脚本
 *
 * 检查 sitemap 中的所有页面提交状态
 *
 * 使用方式：
 * npm run check-sitemap
 */

import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const SITE_URL = 'sc-domain:localtools.cc';
const SITEMAP_URL = 'https://www.localtools.cc/sitemap.xml';
const KEY_FILE_PATH = path.join(__dirname, '..', 'google-service-account.json');

// 从 URL 获取内容
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

// 解析 sitemap XML 获取所有 URL
function parseSitemapUrls(xml) {
    const urls = [];
    const regex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        urls.push(match[1]);
    }
    return urls;
}

async function main() {
    if (!fs.existsSync(KEY_FILE_PATH)) {
        console.error('❌ 错误：找不到服务账号密钥文件');
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/webmasters'],
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        console.log('🔄 正在获取 sitemap 信息...\n');

        // 1. 获取 sitemap 中的所有 URL
        console.log(`📥 正在下载 sitemap: ${SITEMAP_URL}`);
        const sitemapXml = await fetchUrl(SITEMAP_URL);
        const sitemapUrls = parseSitemapUrls(sitemapXml);
        console.log(`   找到 ${sitemapUrls.length} 个 URL\n`);

        // 2. 获取 Search Console 中的 sitemap 状态
        console.log('📋 Search Console 中的 sitemap 状态：');
        const sitemapsRes = await searchconsole.sitemaps.list({
            siteUrl: SITE_URL,
        });

        const sitemaps = sitemapsRes.data.sitemap || [];
        let totalSubmitted = 0;
        let totalIndexed = 0;

        sitemaps.forEach(sitemap => {
            console.log(`\n   📄 ${sitemap.path}`);
            console.log(`   最后提交时间: ${sitemap.lastSubmitted || '未知'}`);
            console.log(`   最后下载时间: ${sitemap.lastDownloaded || '未知'}`);
            console.log(`   警告: ${sitemap.warnings || 0}, 错误: ${sitemap.errors || 0}`);

            if (sitemap.contents) {
                sitemap.contents.forEach(content => {
                    console.log(`   ${content.type}: 已提交 ${content.submitted} 个, 已索引 ${content.indexed} 个`);
                    totalSubmitted += parseInt(content.submitted) || 0;
                    totalIndexed += parseInt(content.indexed) || 0;
                });
            }
        });

        // 3. 汇总统计
        console.log('\n' + '═'.repeat(60));
        console.log('📊 汇总统计');
        console.log('═'.repeat(60));
        console.log(`   Sitemap 中的 URL 数量: ${sitemapUrls.length}`);
        console.log(`   已提交到 Google 的数量: ${totalSubmitted}`);
        console.log(`   已被 Google 索引的数量: ${totalIndexed}`);

        if (totalSubmitted > 0) {
            const indexRate = ((totalIndexed / totalSubmitted) * 100).toFixed(1);
            console.log(`   索引率: ${indexRate}%`);
        }

        // 4. 显示 sitemap 中的所有 URL
        console.log('\n' + '─'.repeat(60));
        console.log('📝 Sitemap 中的所有 URL：');
        console.log('─'.repeat(60));
        sitemapUrls.forEach((url, index) => {
            const shortUrl = url.replace('https://www.localtools.cc', '');
            console.log(`   ${String(index + 1).padStart(3)}. ${shortUrl || '/'}`);
        });

        console.log('\n💡 提示：');
        console.log('   - 新提交的 sitemap 可能需要几天时间才能被完全索引');
        console.log('   - 你可以在 Search Console 网页版查看更详细的索引状态');
        console.log('   - 访问: https://search.google.com/search-console/sitemaps');
        console.log('\n🎉 完成！');

    } catch (error) {
        console.error('❌ 发生错误:', error.message);
        if (error.response) {
            console.error('详细信息:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

main();
