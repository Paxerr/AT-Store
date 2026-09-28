'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const pathname = usePathname();
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (pathname?.startsWith('/admin') || !isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Giỏ hàng ({totalItems})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Đóng giỏ hàng"
            className="btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body / Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--text-dim)',
                }}
              >
                <ShoppingBag size={32} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Giỏ hàng trống</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Bạn chưa thêm sản phẩm sneaker nào vào giỏ.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary btn-sm"
              >
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => (
                <div
                  key={item.variant_id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#0b0d11',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-dim)' }}>
                        Sneaker
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, lineHeight: '1.3' }}>
                          {item.product_name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variant_id)}
                          aria-label="Xóa khỏi giỏ"
                          style={{ color: 'var(--text-dim)', padding: '2px', marginLeft: '8px' }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#f43f5e')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Phân loại: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.variant_title}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>

                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 4px',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          style={{ padding: '2px 6px', color: 'var(--text-muted)' }}
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          style={{ padding: '2px 6px', color: 'var(--text-muted)' }}
                          aria-label="Tăng số lượng"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Subtotal & Checkout */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Tạm tính</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Phí vận chuyển</span>
              <span>Tính khi thanh toán (30.000đ)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>
              <span>Tổng cộng (tạm tính)</span>
              <span style={{ color: 'var(--accent-primary)', fontSize: '18px' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn btn-accent btn-lg"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Tiến hành Đặt Hàng
              <ArrowRight size={18} />
            </Link>

            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px' }}>
              Thời gian giao hàng dự kiến: 3–5 ngày làm việc • Thanh toán VietQR hoặc COD
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
