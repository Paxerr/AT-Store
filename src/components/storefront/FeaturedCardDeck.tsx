'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  ArrowRight,
  Tag,
  Eye,
  Pause,
  Play,
} from 'lucide-react';
import { Product } from '@/types/product';
import { formatImageUrl } from '@/lib/imageHelper';

interface FeaturedCardDeckProps {
  initialProducts?: Product[];
}

export const FeaturedCardDeck: React.FC<FeaturedCardDeckProps> = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [animating, setAnimating] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If no initial products provided via SSR, fetch from API
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    fetch('/api/products')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const list: Product[] = Array.isArray(json.data) ? json.data : (json.data.products || []);
          const featured = list.filter((p: Product) => p.featured && p.status === 'ACTIVE');
          setProducts(featured.length > 0 ? featured : list.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialProducts]);

  const total = products.length;

  // Handlers for switching
  const handleNext = useCallback(() => {
    if (total <= 1 || animating) return;
    setAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setAnimating(false), 450);
  }, [total, animating]);

  const handlePrev = useCallback(() => {
    if (total <= 1 || animating) return;
    setAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setAnimating(false), 450);
  }, [total, animating]);

  const handleSelect = (idx: number) => {
    if (idx === currentIndex || animating) return;
    setAnimating(true);
    setCurrentIndex(idx);
    setTimeout(() => setAnimating(false), 450);
  };

  // Autoplay timer (4500ms)
  useEffect(() => {
    if (total <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '440px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
          fontSize: '14px',
        }}
      >
        Đang tải card sản phẩm tiêu biểu...
      </div>
    );
  }

  if (total === 0) {
    return null;
  }

  // Active product and images helper
  const activeProduct = products[currentIndex];

  const getProductFirstImage = (p: Product) => {
    const raw =
      p.media?.find((m) => m.type === 'IMAGE' && m.is_primary)?.url ||
      p.media?.find((m) => m.type === 'IMAGE')?.url ||
      p.media?.[0]?.url ||
      p.variants?.[0]?.image ||
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80';
    return formatImageUrl(raw);
  };

  const minPrice = activeProduct.min_price || activeProduct.variants?.[0]?.price || 0;
  const comparePrice = activeProduct.variants?.[0]?.compare_at_price || 0;
  const discountPct =
    comparePrice > minPrice
      ? Math.round(((comparePrice - minPrice) / comparePrice) * 100)
      : 0;

  // Next and secondary cards for stacked deck illusion
  const nextIndex = (currentIndex + 1) % total;
  const nextProduct = products[nextIndex];
  const thirdIndex = (currentIndex + 2) % total;
  const thirdProduct = total > 2 ? products[thirdIndex] : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        perspective: '1200px',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual Ambient Glow underneath the deck */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          right: '20%',
          bottom: '10%',
          background: 'radial-gradient(ellipse, rgba(255, 70, 46, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(45px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Card Deck Container */}
      <div
        style={{
          position: 'relative',
          minHeight: '490px',
          zIndex: 1,
        }}
      >
        {/* Layer 3: Third Card in background (if >= 3 products) */}
        {thirdProduct && total > 2 && (
          <div
            style={{
              position: 'absolute',
              inset: '16px -12px -16px 12px',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              opacity: 0.35,
              transform: 'scale(0.88) rotate(4deg)',
              transformOrigin: 'bottom right',
              zIndex: 1,
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        )}

        {/* Layer 2: Next Card peeking out behind (if >= 2 products) */}
        {total > 1 && (
          <div
            onClick={handleNext}
            title={`Xem thẻ kế tiếp: ${nextProduct.name}`}
            style={{
              position: 'absolute',
              inset: '8px -8px -8px 8px',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              opacity: 0.7,
              transform: 'scale(0.94) rotate(2deg)',
              transformOrigin: 'bottom right',
              zIndex: 2,
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '16px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-dim)',
                background: 'rgba(0,0,0,0.25)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Tiếp: #{nextIndex + 1}
            </span>
          </div>
        )}

        {/* Layer 1: ACTIVE HERO CARD (Foreground) */}
        <div
          key={activeProduct.product_id}
          style={{
            position: 'relative',
            zIndex: 5,
            borderRadius: '24px',
            background: 'linear-gradient(150deg, var(--bg-card) 0%, var(--bg-hover) 100%)',
            border: '1px solid var(--border-subtle)',
            padding: '24px 24px 20px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '490px',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Top Bar of Active Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            {/* Left Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, rgba(255, 70, 46, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
                  border: '1px solid rgba(255, 70, 46, 0.4)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                <Flame size={14} />
                SẢN PHẨM TIÊU BIỂU
              </div>

              {discountPct > 0 && (
                <span className="badge badge-rose" style={{ fontSize: '11px', fontWeight: 800 }}>
                  -{discountPct}%
                </span>
              )}

              {activeProduct.has_3d_model && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    color: '#38bdf8',
                  }}
                >
                  3D View
                </span>
              )}
            </div>

            {/* Right Deck Position Counter */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--text-dim)',
                background: 'var(--bg-main)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                letterSpacing: '0.05em',
                fontFamily: 'monospace',
              }}
            >
              {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
          </div>

          {/* Center Sneaker Image Showcase */}
          <Link
            href={`/products/${activeProduct.slug || activeProduct.product_id}`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 0 16px',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Radial glow directly behind the shoe */}
            <div
              style={{
                position: 'absolute',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 70, 46, 0.18) 0%, rgba(0, 0, 0, 0) 65%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }}
            />

            <img
              src={getProductFirstImage(activeProduct)}
              alt={activeProduct.name}
              style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: '90%',
                maxHeight: '260px',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 18px 24px rgba(0, 0, 0, 0.45))',
                transform: 'rotate(-10deg) scale(1)',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(-4deg) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(-10deg) scale(1)';
              }}
            />
          </Link>

          {/* Bottom Info Section */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}
                >
                  {activeProduct.brand_name || 'Sneaker Chính Hãng'} • {activeProduct.category_name || 'Streetwear'}
                </div>

                <Link
                  href={`/products/${activeProduct.slug || activeProduct.product_id}`}
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {activeProduct.name}
                </Link>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {minPrice.toLocaleString('vi-VN')}đ
                </div>
                {comparePrice > minPrice && (
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    {comparePrice.toLocaleString('vi-VN')}đ
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons & Deck Navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              {/* Left / Right Arrow Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Sản phẩm tiêu biểu trước"
                  title="Thẻ trước"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-main)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Sản phẩm tiêu biểu tiếp theo"
                  title="Thẻ tiếp theo"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-main)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <ChevronRight size={18} />
                </button>

                {/* Autoplay Pause / Play indicator */}
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? 'Tiếp tục tự động chuyển' : 'Tạm dừng tự động chuyển'}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {isPaused ? <Play size={13} /> : <Pause size={13} />}
                </button>
              </div>

              {/* View Product CTA */}
              <Link
                href={`/products/${activeProduct.slug || activeProduct.product_id}`}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Xem chi tiết
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Card Indicators (Dots / Pills) + Autoplay Progress Bar */}
      <div
        style={{
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {products.map((p, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={p.product_id}
              type="button"
              onClick={() => handleSelect(idx)}
              title={`${idx + 1}. ${p.name}`}
              style={{
                height: '8px',
                width: isActive ? '32px' : '8px',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
                outline: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
