'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Product } from '@/types/product';
import { formatImageUrl } from '@/lib/imageHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  const rawPrimary =
    product.media?.find((m) => m.type === 'IMAGE' && m.is_primary)?.url ||
    product.media?.find((m) => m.type === 'IMAGE')?.url ||
    product.variants?.[0]?.image ||
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80';

  const primaryImage = formatImageUrl(rawPrimary);
  const secondaryImage = formatImageUrl(product.media?.filter((m) => m.type === 'IMAGE')[1]?.url) || primaryImage;

  const minPrice = product.min_price || product.variants?.[0]?.price || 0;
  const comparePrice = product.variants?.[0]?.compare_at_price || 0;
  const discountPct =
    comparePrice > minPrice
      ? Math.round(((comparePrice - minPrice) / comparePrice) * 100)
      : 0;

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {product.is_sale && discountPct > 0 && (
          <span className="badge badge-rose">-{discountPct}%</span>
        )}
        {product.is_new && <span className="badge badge-orange">NEW</span>}
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="image-wrapper">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          loading="lazy"
        />
      </Link>

      {/* Product Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Brand / Category */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {product.brand_name || 'Sneaker'}
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-main)',
            lineHeight: '1.4',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Link>

        {/* Available Sizes Preview */}
        {product.available_sizes && product.available_sizes.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {product.available_sizes.slice(0, 5).map((size) => (
              <span
                key={size}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {size}
              </span>
            ))}
            {product.available_sizes.length > 5 && (
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', alignSelf: 'center' }}>
                +{product.available_sizes.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price Row */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {minPrice.toLocaleString('vi-VN')}đ
          </span>
          {comparePrice > minPrice && (
            <span style={{ fontSize: '13px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              {comparePrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
