/**
 * Google Search Console API - 索引状态检查脚本
 *
 * 查看网站在 Google 上的搜索表现数据
 *
 * 使用方式：
 * npm run check-indexing
 */

import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
// 域名资源使用 sc-domain: 前缀
const SITE_URL = 'sc-domain:localtools.cc';
const KEY_FILE_PATH = path.join(__dirname, '..', 'google-service-account.json');

async function main() {
    if (!fs.existsSync(KEY_FILE_PATH)) {
        console.error('❌ 错误：找不到服务账号密钥文件');
        console.log('请先运行 npm run submit-sitemap 查看设置说明');
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        console.log('🔄 正在获取搜索分析数据...\n');

        // 获取最近 7 天的搜索表现数据
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const formatDate = (date) => date.toISOString().split('T')[0];

        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                dimensions: ['page'],
                rowLimit: 20,
            },
        });

        console.log(`📊 搜索表现 (${formatDate(startDate)} ~ ${formatDate(endDate)})\n`);

        const rows = response.data.rows || [];
        if (rows.length === 0) {
            console.log('⚠️  暂无搜索数据，新提交的站点可能需要几天时间才能开始收录');
        } else {
            console.log('热门页面：');
            console.log('─'.repeat(80));
            console.log(`${'页面'.padEnd(50)} ${'点击'.padStart(8)} ${'展示'.padStart(10)}`);
            console.log('─'.repeat(80));

            rows.forEach(row => {
                const page = row.keys[0].replace(SITE_URL, '/').substring(0, 48);
                console.log(`${page.padEnd(50)} ${String(row.clicks).padStart(8)} ${String(row.impressions).padStart(10)}`);
            });

            console.log('─'.repeat(80));
        }

        // 获取按查询关键词的数据
        const queryResponse = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                dimensions: ['query'],
                rowLimit: 10,
            },
        });

        const queryRows = queryResponse.data.rows || [];
        if (queryRows.length > 0) {
            console.log('\n🔍 热门搜索关键词：');
            console.log('─'.repeat(60));
            queryRows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.keys[0]} (点击: ${row.clicks}, 展示: ${row.impressions})`);
            });
        }

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
