const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '../src/app/tools');

const tools = fs.readdirSync(toolsDir).filter(f => {
    return fs.statSync(path.join(toolsDir, f)).isDirectory();
});

console.log(`Found ${tools.length} tool directories`);

tools.forEach(toolId => {
    const layoutPath = path.join(toolsDir, toolId, 'layout.tsx');
    const layoutContent = `import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('${toolId}');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
`;

    fs.writeFileSync(layoutPath, layoutContent);
    console.log(`Created layout for: ${toolId}`);
});

console.log('Done!');
