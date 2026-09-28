'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types/product';

interface CategorySectionProps {
  categories: Category[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  return (
    <section style={{ padding: '40px 0 60px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              BỘ SƯU TẬP
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
              Khám Phá Theo Danh Mục
            </h2>
          </div>
          <Link href="/products" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Xem tất cả <ArrowUpRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.category_id}
              href={`/products?category=${cat.category_id}`}
              style={{
                position: 'relative',
                height: '240px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '24px',
                transition: 'transform var(--transition-smooth)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.0)';
              }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                  filter: 'brightness(0.65)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Xem danh mục <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
