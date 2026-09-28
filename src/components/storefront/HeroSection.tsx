import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Product } from '@/types/product';
import { FeaturedCardDeck } from './FeaturedCardDeck';

interface HeroSectionProps {
  featuredProducts?: Product[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ featuredProducts = [] }) => {
  return (
    <section
      style={{
        position: 'relative',
        padding: '60px 0 80px',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '48px',
          }}
        >
          {/* Left Column: Storytelling Headline */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(249, 115, 22, 0.12)',
                border: '1px solid rgba(249, 115, 22, 0.25)',
                color: '#fb923c',
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '20px',
              }}
            >
              <Zap size={14} />
              BỘ SƯU TẬP SNEAKER 2026
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800,
                lineHeight: '1.1',
                letterSpacing: '-0.03em',
                marginBottom: '20px',
              }}
            >
              Step Into Your Style. <br />
              <span style={{ color: 'var(--text-muted)' }}>Khẳng định chất riêng.</span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
                marginBottom: '32px',
                maxWidth: '520px',
              }}
            >
              Tuyển tập những mẫu sneaker thể thao đường phố thịnh hành nhất. Trải nghiệm xem mô hình 3D xoay 360°, đổi size trong 7 ngày và giao hàng toàn quốc 3–5 ngày.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/products" className="btn btn-accent btn-lg">
                Khám phá sản phẩm
                <ArrowRight size={18} />
              </Link>
              <Link href="/products?is_new=true" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-primary)" />
                Hàng mới về
              </Link>
            </div>

            {/* Micro Trust Counters */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>100%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Hàng tuyển chọn</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>3–5 Ngày</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Giao hàng dự kiến</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>7 Ngày</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Đổi size linh hoạt</div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Products Card Deck Banner */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <FeaturedCardDeck initialProducts={featuredProducts} />
          </div>
        </div>
      </div>
    </section>
  );
};
