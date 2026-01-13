/**
 * Google Indexing API - 单个 URL 提交脚本
 *
 * 用于快速通知 Google 索引新增或更新的页面
 *
 * 使用方式：
 * npm run submit-url -- https://www.localtools.cc/tools/new-tool
 * npm run submit-url -- /tools/new-tool
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// 配置
const BASE_URL = 'https://www.localtools.cc';
const KEY_FILE_PATH = path.join(__dirname, '..', 'google-service-account.json');

async function main() {
    // 获取命令行参数中的 URL
    let targetUrl = process.argv[2];

    if (!targetUrl) {
        console.log('❌ 请提供要提交的 URL');
        console.log('\n使用方式：');
        console.log('  npm run submit-url -- https://www.localtools.cc/tools/new-tool');
        console.log('  npm run submit-url -- /tools/new-tool');
        console.log('\n批量提交多个 URL：');
        console.log('  npm run submit-url -- /tools/tool1 /tools/tool2 /tools/tool3');
        process.exit(1);
    }

    if (!fs.existsSync(KEY_FILE_PATH)) {
        console.error('❌ 错误：找不到服务账号密钥文件');
        process.exit(1);
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing({ version: 'v3', auth });

        // 获取所有要提交的 URL（支持多个）
        const urls = process.argv.slice(2).map(url => {
            // 如果是相对路径，添加基础 URL
            if (url.startsWith('/')) {
                return BASE_URL + url;
            }
            return url;
        });

        console.log(`🔄 正在提交 ${urls.length} 个 URL 到 Google Indexing API...\n`);

        for (const url of urls) {
            try {
                console.log(`📤 提交: ${url}`);

                const response = await indexing.urlNotifications.publish({
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED', // URL_UPDATED 用于新增或更新，URL_DELETED 用于删除
                    },
                });

                console.log(`   ✅ 成功！通知时间: ${response.data.urlNotificationMetadata?.latestUpdate?.notifyTime || '已接收'}`);
            } catch (error) {
                console.log(`   ❌ 失败: ${error.message}`);

                // 如果是 403 错误，说明 Indexing API 限制
                if (error.code === 403) {
                    console.log('\n⚠️  注意：Google Indexing API 官方仅支持以下内容类型：');
                    console.log('   - JobPosting（招聘信息）');
                    console.log('   - BroadcastEvent 和 VideoObject（直播内容）');
                    console.log('\n   对于其他类型的内容，建议使用 sitemap 方式提交。');
                }
            }
        }

        console.log('\n🎉 完成！');

    } catch (error) {
        console.error('❌ 发生错误:', error.message);
        process.exit(1);
    }
}

main();
