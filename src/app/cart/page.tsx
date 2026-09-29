'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  const isFreeShipping = subtotal >= 1000000;
  const diff = Math.max(0, 1000000 - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / 1000000) * 100));

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Giỏ hàng chưa có sản phẩm</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Bạn chưa thêm đôi sneaker nào vào giỏ hàng của mình.
        </p>
        <Link href="/products" className="btn btn-primary btn-sm">
          Khám phá bộ sưu tập ngay
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Tiếp tục mua sắm
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '28px' }}>
          Giỏ Hàng Của Bạn ({totalItems} món)
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item) => (
              <div
                key={item.variant_id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ width: '84px', height: '84px', borderRadius: '8px', overflow: 'hidden', background: '#0b0d11', flexShrink: 0 }}>
                  {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{item.product_name}</h3>
                      <button onClick={() => removeFromCart(item.variant_id)} style={{ color: 'var(--text-dim)', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Phân loại: <strong style={{ color: 'var(--text-main)' }}>{item.variant_title}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)', padding: '2px 6px' }}>
                      <button onClick={() => updateQuantity(item.variant_id, item.quantity - 1)} style={{ padding: '4px 8px' }}><Minus size={12} /></button>
                      <span style={{ padding: '0 8px', fontWeight: 700, fontSize: '13px' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variant_id, item.quantity + 1)} style={{ padding: '4px 8px' }}><Plus size={12} /></button>
                    </div>

                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
            }}
          >
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Tổng kết giỏ hàng</h3>

                {/* Free Shipping Progress Indicator */}
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isFreeShipping ? 'rgba(16, 185, 129, 0.12)' : 'rgba(249, 115, 22, 0.1)',
                    border: isFreeShipping ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(249, 115, 22, 0.2)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 600 }}>
                    <span style={{ color: isFreeShipping ? 'var(--accent-emerald)' : 'var(--accent-primary)' }}>
                      {isFreeShipping ? '🎉 Đơn hàng được MIỄN PHÍ VẬN CHUYỂN!' : `Mua thêm ${diff.toLocaleString('vi-VN')}đ để Freeship`}
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>{progressPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: isFreeShipping ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Tạm tính</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Phí giao hàng</span>
                    <span>{isFreeShipping ? <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>MIỄN PHÍ</span> : '30.000đ (toàn quốc)'}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px' }}>
                    <span>Tổng cộng (tạm tính)</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{(subtotal + (isFreeShipping ? 0 : 30000)).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

            <Link href="/checkout" className="btn btn-accent btn-lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Tiến hành Đặt Hàng <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
