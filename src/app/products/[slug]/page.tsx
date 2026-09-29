'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { formatImageUrl } from '@/lib/imageHelper';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected variant & quantity
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setProduct(json.data);
          if (json.data.variants && json.data.variants.length > 0) {
            setSelectedVariant(json.data.variants[0]);
          }
        } else {
          setError(json.error || 'Không tìm thấy sản phẩm');
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 0);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div
        className="container"
        style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 0',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Đang tải thông tin sneaker...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => router.push('/products')} className="btn btn-primary btn-sm">
          Quay lại danh mục sản phẩm
        </button>
      </div>
    );
  }

  const images = (product.media?.filter((m) => m.type === 'IMAGE') || []).map((m) => formatImageUrl(m.url));
  const currentImage = images[activeImageIndex] || formatImageUrl(selectedVariant?.image) || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80';

  const price = selectedVariant?.price || product.min_price || 0;
  const comparePrice = selectedVariant?.compare_at_price || 0;
  const discountPct = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const availableStock = selectedVariant ? Math.max(0, selectedVariant.stock - (selectedVariant.reserved_stock || 0)) : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      product_id: product.product_id,
      variant_id: selectedVariant.variant_id,
      product_name: product.name,
      variant_title: `Size ${selectedVariant.size}${selectedVariant.color ? ` - ${selectedVariant.color}` : ''}`,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      quantity,
      image: selectedVariant.image || currentImage,
      slug: product.slug,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>Trang chủ</span> /{' '}
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/products')}>Sản phẩm</span> /{' '}
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '48px',
            alignItems: 'flex-start',
          }}
        >
          {/* LEFT: Media Gallery */}
          <div>
            {/* Main Large Image */}
            <div
              style={{
                position: 'relative',
                aspectRatio: 1,
                background: '#0f131a',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img
                src={currentImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
              />

              {/* Status Badges */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                {product.is_sale && discountPct > 0 && (
                  <span className="badge badge-rose">-{discountPct}%</span>
                )}
                {product.is_new && <span className="badge badge-orange">MỚI</span>}
              </div>
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: '#0b0d11',
                      flexShrink: 0,
                      padding: 0,
                      cursor: 'pointer',
                      opacity: activeImageIndex === idx ? 1 : 0.65,
                      transition: 'opacity 0.2s, border-color 0.2s',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information, Variant Selectors, Buy */}
          <div>
            {/* Brand */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              {product.brand_name || 'Sneaker'}
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 800,
                lineHeight: '1.2',
                marginBottom: '16px',
              }}
            >
              {product.name}
            </h1>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
                {price.toLocaleString('vi-VN')}đ
              </span>
              {comparePrice > price && (
                <span style={{ fontSize: '18px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  {comparePrice.toLocaleString('vi-VN')}đ
                </span>
              )}
              {discountPct > 0 && (
                <span className="badge badge-rose">Tiết kiệm {discountPct}%</span>
              )}
            </div>

            {/* Short Description */}
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
              {product.short_description || product.description}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Chọn kích cỡ (Size):</span>
                {selectedVariant && (
                  <span style={{ fontSize: '12px', color: availableStock > 0 ? 'var(--accent-emerald)' : '#f43f5e' }}>
                    {availableStock > 0 ? `Còn ${availableStock} đôi sẵn hàng` : 'Tạm hết hàng'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(product.variants || []).map((v) => {
                  const isSelected = selectedVariant?.variant_id === v.variant_id;
                  const isAvailable = v.stock - (v.reserved_stock || 0) > 0;
                  return (
                    <button
                      key={v.variant_id}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image) {
                          const idx = images.indexOf(v.image);
                          if (idx !== -1) setActiveImageIndex(idx);
                        }
                      }}
                      disabled={!isAvailable}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                        color: isSelected ? '#ffffff' : isAvailable ? 'var(--text-main)' : 'var(--text-dim)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        opacity: isAvailable ? 1 : 0.4,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span>Không tìm thấy size của bạn hoặc hết hàng? Nhắn Zalo shop để được kiểm tra kho hoặc hỗ trợ đặt hàng riêng.</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Số lượng:</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '4px',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '6px 12px', fontWeight: 700 }}
                  aria-label="Giảm số lượng"
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 700 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock || 99, quantity + 1))}
                  style={{ padding: '6px 12px', fontWeight: 700 }}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart & Buy Now Buttons */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '32px' }}>
              <button
                onClick={handleAddToCart}
                disabled={availableStock <= 0}
                className="btn btn-secondary btn-lg"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShoppingBag size={18} />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={availableStock <= 0}
                className="btn btn-accent btn-lg"
                style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Zap size={18} />
                Mua ngay
              </button>
            </div>

            {/* Trust Accordion */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <Truck size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span>Thời gian giao hàng dự kiến: <strong>3–5 ngày</strong> làm việc toàn quốc.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <RotateCcw size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span>Hỗ trợ đổi size linh hoạt trong <strong>07 ngày</strong> kể từ khi nhận hàng.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <ShieldCheck size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span>Thanh toán chuyển khoản <strong>VietQR an toàn</strong> hoặc nhận hàng thanh toán COD.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Product Description Section */}
        <div
          style={{
            marginTop: '64px',
            paddingTop: '40px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
            Chi Tiết & Thông Số Kỹ Thuật
          </h2>
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              border: '1px solid var(--border-subtle)',
              lineHeight: '1.8',
              color: 'var(--text-muted)',
              fontSize: '15px',
            }}
          >
            <p style={{ marginBottom: '16px' }}>{product.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
              <div><strong>Thương hiệu:</strong> {product.brand_name || 'Sneaker'}</div>
              <div><strong>Danh mục:</strong> {product.category_name || 'Sneaker'}</div>
              <div><strong>Mã SKU biến thể:</strong> {selectedVariant?.sku || 'N/A'}</div>
              <div>
                <strong>Chất liệu:</strong>{' '}
                {(() => {
                  const cat = (product.category_name || '').toLowerCase();
                  if (cat.includes('quần') || cat.includes('áo') || cat.includes('clothing')) {
                    return 'Chất vải Cotton 100% thoáng mát, co giãn nhẹ và chuẩn form';
                  }
                  if (cat.includes('phụ kiện') || cat.includes('tất') || cat.includes('dây')) {
                    return 'Sợi dệt / Hợp kim chuyên dụng cao cấp, bền đẹp';
                  }
                  if (cat.includes('tây') || cat.includes('loafer') || cat.includes('da')) {
                    return 'Da thật / Da vi sợi cao cấp & đế đúc êm ái chống trượt';
                  }
                  return 'Da cao cấp kết hợp đệm bọt khí êm ái, chống mỏi chân';
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
