'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/lib/tools';
import { useTranslation } from '@/components/LanguageContext';

export default function Home() {
  const { tCategory, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="main">
        <div className="category-tabs">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon size={16} />
                {tCategory(category.id)}
              </button>
            );
          })}
        </div>

        <div className="tools-grid">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
          }}>
            <p style={{ fontSize: '1.1rem' }}>{t('home.noTools')}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
              {t('home.tryOther')}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
