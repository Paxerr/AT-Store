import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, CheckCircle2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { ProductService } from '@/services/productService';
import { HeroSection } from '@/components/storefront/HeroSection';
import { CategorySection } from '@/components/storefront/CategorySection';
import { ProductCard } from '@/components/storefront/ProductCard';

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const productService = new ProductService();
  const products = await productService.getAllProducts();
  const categories = await productService.getAllCategories();

  const allFeaturedProducts = products.filter((p) => p.featured && p.status === 'ACTIVE');
  const featuredProducts = allFeaturedProducts.slice(0, 4);
  const newArrivals = products.filter((p) => p.is_new).slice(0, 4);

  return (
    <div>
      {/* 1. Hero Storytelling */}
      <HeroSection featuredProducts={allFeaturedProducts} />

      {/* 2. Shop By Category */}
      <CategorySection categories={categories} />

      {/* 3. Featured Products Showcase */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                <Flame size={14} /> SẢN PHẨM NỔI BẬT
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
                Được Yêu Thích Nhất
              </h2>
            </div>
            <Link href="/products?featured=true" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
            }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Brand Showcase & Editorial Banner */}
      <section
        style={{
          padding: '60px 0',
          position: 'relative',
        }}
      >
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #161c28 0%, #0d1017 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: 'clamp(32px, 5vw, 56px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Left Visual Image */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img
                src="/hero_banner.jpg"
                alt="Anh Thư Sneaker Collection"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '380px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            </div>

            {/* Right Information & CTA */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 70, 46, 0.15)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                <Sparkles size={14} />
                CHUẨN PHONG CÁCH STREETWEAR
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 36px)',
                  fontWeight: 800,
                  lineHeight: '1.2',
                  marginBottom: '16px',
                  color: '#ffffff',
                }}
              >
                Sneaker Chính Hãng <br />
                Đẳng Cấp & Thời Thượng
              </h2>

              <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', marginBottom: '28px' }}>
                Mỗi đôi giày tại Anh Thư Sneaker đều được tuyển chọn kỹ lưỡng về phom dáng, chất liệu và phối màu, mang đến cho bạn sự tự tin tối đa trong từng bước đi.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                  <ShieldCheck size={20} color="var(--accent-primary)" />
                  100% Sản phẩm tuyển chọn
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                  <Truck size={20} color="var(--accent-primary)" />
                  Giao nhanh 3–5 ngày toàn quốc
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#ffffff', fontWeight: 500 }}>
                  <RefreshCw size={20} color="var(--accent-primary)" />
                  Đổi size linh hoạt trong 7 ngày
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/products"
                  className="btn btn-primary btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  Khám phá toàn bộ sản phẩm
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                <Sparkles size={14} /> HÀNG MỚI VỀ
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
                Xu Hướng Sneaker Mới Nhất
              </h2>
            </div>
            <Link href="/products?is_new=true" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Xem thêm <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
            }}
          >
            {newArrivals.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
