# AGENTS.md - LocalTools.cc

This repository is a bilingual (Chinese/English) Next.js developer tools application with PWA support. All tools run locally in the browser - no server-side processing.

## Build & Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint (no single test command - no tests in project)
```

## Code Style Guidelines

### File Structure
- **Tools**: `src/app/tools/{tool-id}/page.tsx` (main component) + `layout.tsx` (optional)
- **Components**: `src/components/{ComponentName}.tsx`
- **Libraries**: `src/lib/{name}.ts` (utilities, i18n, tools data)
- **Path alias**: Use `@/*` for `./src/*` (configured in tsconfig.json)

### Imports
```tsx
// React hooks - named imports
import { useState, useEffect, useCallback } from 'react';
// Next.js components
import Link from 'next/link';
import Image from 'next/image';
// Icons - named imports from lucide-react
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
// Local imports with path alias
import Header from '@/components/Header';
import { tools } from '@/lib/tools';
import { getTranslation } from '@/lib/i18n';
```

### Component Patterns
- **Client components**: Start with `'use client';` at the top
- **Page components**: Default export (e.g., `export default function JsonSortPage()`)
- **Layout components**: Default export accepting `{ children }: { children: React.ReactNode }`
- **Function components**: Use function declarations, not arrow functions for exports

### TypeScript & Types
```tsx
// Interfaces for object shapes
interface Tool {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: string;
}

// Type aliases for unions
type SortOrder = 'asc' | 'desc';
type Language = 'zh' | 'en';

// Explicit types for complex inferred cases
const sortedObj: Record<string, unknown> = {};
```

### Naming Conventions
- **Components**: PascalCase (`JsonSortPage`, `Header`, `Toast`)
- **Functions/Variables**: camelCase (`sortObject`, `handleInputChange`, `clearAll`)
- **Constants**: UPPER_SNAKE_CASE (`LANGUAGE_STORAGE_KEY`)
- **Props**: Descriptive camelCase props with TypeScript interfaces
- **Event handlers**: Prefix with `handle` (`handleInputChange`, `handleClick`)

### State Management
```tsx
// Basic state
const [input, setInput] = useState('');
const [error, setError] = useState('');

// Custom hooks for context
const { language, setLanguage } = useLanguage();
const { toast, showToast, hideToast } = useToast();

// i18n helper
const t = (key: string) => getTranslation(language, key);
```

### Error Handling
```tsx
try {
    const parsed = JSON.parse(input);
    // Process data
    setOutput(result);
    setError('');
} catch (e) {
    setError(`${t('toolPages.common.jsonError')}: ${(e as Error).message}`);
    setOutput('');
}
```

### Component Structure (Tool Pages)
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon1, Icon2 } from 'lucide-react';
import Header from '@/components/Header';
import ToolMenu from '@/components/ToolMenu';
import Toast, { useToast } from '@/components/Toast';
import { useLanguage } from '@/components/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function ToolPage() {
    // State
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const { toast, showToast, hideToast } = useToast();
    const { language } = useLanguage();
    const t = (key: string) => getTranslation(language, key);

    // Effects (real-time processing)
    useEffect(() => {
        if (!input) {
            setOutput('');
            return;
        }
        // Process input
        try {
            const result = process(input);
            setOutput(result);
            setError('');
        } catch (e) {
            setError(`${t('error.key')}: ${(e as Error).message}`);
        }
    }, [input]);

    // Event handlers
    const clearAll = () => {
        setInput('');
        setOutput('');
        setError('');
    };

    return (
        <>
            <Header />
            <ToolMenu />
            <div className="tool-page">
                {/* Tool content */}
            </div>
            <Toast message={toast.message} show={toast.show} onClose={hideToast} />
        </>
    );
}
```

### Layout Files
```tsx
import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('tool-id');

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
```

### Styling
- **Framework**: Tailwind CSS v4 (via @tailwindcss/postcss plugin)
- **Pattern**: Utility-first with CSS custom properties
- **Theme**: Dark mode support via CSS variables (defined in global styles)
- **Common classes**: `tool-page`, `tool-header`, `editor-container`, `editor-panel`, `action-btn`, `toast`

### Internationalization (i18n)
- **Languages**: Chinese (`zh`) and English (`en`)
- **Helper**: `t(key)` returns translated string from `src/lib/i18n.ts`
- **Tool translations**: `tTool(toolId, 'name' | 'description')` for tool names
- **Category translations**: `tCategory(categoryId)` for category names
- **Context**: Wrap components in `LanguageProvider` (already in app layout)

### SEO & Metadata
```tsx
import { getToolMetadata } from '@/lib/seo';

export const metadata = getToolMetadata('tool-id');
```
Use tool IDs from `src/lib/tools.ts` for consistent metadata.

## Configuration
- **Next.js**: 16.1.1 with App Router
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js core-web-vitals + typescript config
- **Tailwind**: v4 with PostCSS plugin
- **React Compiler**: Enabled in `next.config.ts`

## Key Files to Reference
- `src/lib/tools.ts` - All tool definitions (ids, names, icons, categories)
- `src/lib/i18n.ts` - Translation strings (very large file - use search)
- `src/lib/seo.ts` - SEO metadata generation
- `src/components/Header.tsx` - Header component with search (good reference)
- `src/app/tools/json-sort/page.tsx` - Example tool implementation
