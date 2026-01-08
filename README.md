# LocalTools.cc - 本地开发者工具集合

<p align="center">
  <strong>🛠️ Local Developer Tools - Your Data Never Leaves the Browser</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tools">Tools</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  English | <a href="./README_CN.md">简体中文</a>
</p>

---

## ✨ Features

- 🌐 **Bilingual Support** - Full Chinese and English internationalization
- 🌙 **Dark Mode** - Eye-friendly dark theme support
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔒 **Privacy First** - All data processing happens locally in your browser
- ⚡ **Fast & Lightweight** - Built with Next.js for optimal performance
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations
- 📲 **PWA Support** - Install as app, works offline after first visit

## 🛠️ Tools

### JSON Tools
| Tool | Description |
|------|-------------|
| JSON Formatter | Format, validate, and compress JSON |
| JSON Compress | JSON string compression and escaping |
| JSON Sort | Sort JSON objects by key names |
| JSONPath | JSON data extraction and query |
| JSON5 | JSON5 parsing and validation |
| JSON Viewer | Tree structure JSON display |
| JSON Editor | Visual JSON editing |

### JWT Tools
| Tool | Description |
|------|-------------|
| JWT Encoder/Decoder | JWT Token encoding and decoding |
| JWT Decoder Pro | Precise JWT parts parsing |

### Conversion Tools
| Tool | Description |
|------|-------------|
| JSON to SQL | Convert JSON data to SQL statements |
| SQL to JSON | Convert SQL to JSON structure |
| SQL to Java | Convert SQL table to Java entity class |
| JSON to Java | Convert JSON to Java POJO class |
| JSON to Python | Convert JSON to Python dataclass |
| JSON to Schema | Generate JSON Schema from JSON |
| JSON to ObjectiveC | Convert JSON to OC model class |
| Lottie Preview | Preview Lottie JSON animations |

### Encoding & Encryption
| Tool | Description |
|------|-------------|
| Base64 Encode/Decode | Text and Base64 conversion with image support |
| URL Encode/Decode | URL encoding and decoding |
| MD5 Hash | MD5 hash calculation |
| Hash Calculator | SHA1/SHA256/SHA512 hash calculation |
| UUID Generator | Generate UUID/GUID online |
| Password Generator | Generate secure random passwords |


### Date & Time
| Tool | Description |
|------|-------------|
| Unix Timestamp | Timestamp and datetime conversion |

### Code & Text
| Tool | Description |
|------|-------------|
| Code Formatter | JS/CSS/HTML/SQL code formatting |
| Color Converter | HEX/RGB/HSL color format conversion |
| Text Diff | Online text content comparison |
| Case Converter | Camel/snake/upper/lower case conversion |

### Image Tools
| Tool | Description |
|------|-------------|
| Image Grid | Split image into 9-grid with batch download |
| Image Compress | Compress image with quality control |
| Image Crop | Custom crop image area |
| Image Flip | Flip image horizontally or vertically |
| Image Rotate | Rotate image angle |
| Image Resize | Adjust image dimensions |
| Image Watermark | Add text watermark to images |
| ID Photo Background | Change ID photo background color |
| QR Code Generator | Generate custom QR codes |
| QR Code Scanner | Scan and parse QR code content |
| Image to SVG | Convert bitmap to SVG vector |
| PDF to Image | Convert PDF files to images |
| Image to PDF | Convert images to PDF file |
| Gemini Watermark Remover | Remove watermarks from AI generated images |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lwmxiaobei/devtools.git
cd devtools
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm run start
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Processing**: pdf.js, jsPDF
- **QR Code**: qrcode, jsqr
- **Crypto**: crypto-js

## 📁 Project Structure

```
devtools/
├── public/             # Static assets
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── tools/     # Individual tool pages
│   │   ├── privacy/   # Privacy policy
│   │   └── terms/     # Terms of service
│   ├── components/    # Reusable React components
│   ├── lib/           # Utility functions and i18n
│   └── contexts/      # React contexts (theme, language)
├── scripts/           # Build and utility scripts
└── package.json
```

## 🌐 Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lwmxiaobei/devtools)

Alternatively, you can deploy to any platform that supports Node.js:

- Netlify
- Railway
- Docker
- Self-hosted

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

If you have any questions or suggestions, please feel free to open an issue.

---

<p align="center">Made with ❤️ for developers</p>
