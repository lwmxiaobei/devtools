# DevTools - 开发者在线工具集合

<p align="center">
  <strong>🛠️ 让开发更高效的在线工具箱</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#工具列表">工具列表</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#部署">部署</a> •
  <a href="#许可证">许可证</a>
</p>

<p align="center">
  <a href="./README.md">English</a> | 简体中文
</p>

---

## ✨ 功能特性

- 🌐 **双语支持** - 完整的中英文国际化
- 🌙 **暗黑模式** - 护眼的深色主题
- 📱 **响应式设计** - 完美适配桌面端、平板和手机
- 🔒 **隐私优先** - 所有数据在浏览器本地处理，不上传服务器
- ⚡ **快速轻量** - 基于 Next.js 构建，性能优异
- 🎨 **现代界面** - 简洁直观的设计，流畅的动画效果
- 📲 **PWA 支持** - 可安装为应用，首次访问后支持离线使用

## 🛠️ 工具列表

### JSON 工具
| 工具 | 描述 |
|------|------|
| JSON 格式化 | 格式化、验证和压缩 JSON |
| JSON 压缩转义 | JSON 字符串压缩和转义 |
| JSON 排序 | 按键名对 JSON 对象排序 |
| JSONPath | JSON 数据提取和查询 |
| JSON5 | JSON5 解析和验证 |
| JSON 视图 | 树形结构展示 JSON |
| JSON 编辑器 | 可视化编辑 JSON |

### JWT 工具
| 工具 | 描述 |
|------|------|
| JWT 加解密 | JWT Token 编码和解码 |
| JWT 解密 高精度版 | 精确解析 JWT 各部分 |

### 转换工具
| 工具 | 描述 |
|------|------|
| JSON 转 SQL | 将 JSON 数据转换为 SQL 语句 |
| SQL 转 JSON | 将 SQL 转换为 JSON 结构 |
| SQL 转 Java | SQL 表结构转 Java 实体类 |
| JSON 转 Java | JSON 转 Java POJO 类 |
| JSON 转 Python | JSON 转 Python dataclass |
| JSON 转 Schema | 从 JSON 生成 JSON Schema |
| JSON 转 ObjectiveC | JSON 转 OC 模型类 |
| Lottie 预览 | 预览 Lottie JSON 动画 |

### 编码加密
| 工具 | 描述 |
|------|------|
| Base64 编解码 | 文本与 Base64 互转，支持图片 |
| URL 编解码 | URL 编码与解码 |
| MD5 加密 | MD5 哈希值计算 |
| 哈希计算 | SHA1/SHA256/SHA512 哈希计算 |
| UUID 生成器 | 在线生成 UUID/GUID |

### 时间日期
| 工具 | 描述 |
|------|------|
| Unix 时间戳 | 时间戳与日期时间互转 |

### 代码文本
| 工具 | 描述 |
|------|------|
| 代码格式化 | JS/CSS/HTML/SQL 代码格式化 |
| 颜色转换 | HEX/RGB/HSL 颜色格式互转 |
| 文本对比 | 在线文本内容对比 |
| 大小写转换 | 驼峰/下划线/大小写转换 |

### 图片工具
| 工具 | 描述 |
|------|------|
| 九宫格切图 | 将图片分割为 9 宫格，支持批量下载 |
| 图片压缩 | 压缩图片，支持质量调节 |
| 图片裁剪 | 自定义裁剪图片区域 |
| 图片翻转 | 水平或垂直翻转图片 |
| 图片旋转 | 旋转图片角度 |
| 缩放照片 | 调整图片尺寸大小 |
| 图片加水印 | 给图片添加文字水印 |
| 证件照背景 | 更换证件照背景颜色 |
| 二维码生成 | 生成自定义二维码 |
| 二维码识别 | 识别并解析二维码内容 |
| 图片转 SVG | 将位图转换为 SVG 矢量图 |
| PDF 转图片 | 将 PDF 文件转换为图片 |
| 图片转 PDF | 将图片转换为 PDF 文件 |
| 去 Gemini 水印 | 去除 AI 生成图片的水印 |

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm、yarn、pnpm 或 bun

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/lwmxiaobei/devtools.git
cd devtools
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 启动开发服务器：
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 生产环境构建

```bash
npm run build
npm run start
```

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) + App Router
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: [Lucide React](https://lucide.dev/)
- **PDF 处理**: pdf.js, jsPDF
- **二维码**: qrcode, jsqr
- **加密**: crypto-js

## 📁 项目结构

```
devtools/
├── public/             # 静态资源
├── src/
│   ├── app/           # Next.js App Router 页面
│   │   ├── tools/     # 各工具页面
│   │   ├── privacy/   # 隐私政策
│   │   └── terms/     # 服务条款
│   ├── components/    # 可复用 React 组件
│   ├── lib/           # 工具函数和国际化
│   └── contexts/      # React 上下文 (主题、语言)
├── scripts/           # 构建和工具脚本
└── package.json
```

## 🌐 部署

最简单的部署方式是使用 [Vercel 平台](https://vercel.com/new)：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lwmxiaobei/devtools)

也可以部署到其他支持 Node.js 的平台：

- Netlify
- Railway
- Docker
- 自建服务器

### 国内部署建议

为了获得更好的国内访问速度，推荐：
- 阿里云 / 腾讯云 OSS + CDN（需备案）
- Cloudflare Pages（国内节点较多）

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🤝 参与贡献

欢迎提交 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加某个很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📧 联系方式

如有问题或建议，欢迎提交 Issue。

---

<p align="center">用 ❤️ 为开发者打造</p>
