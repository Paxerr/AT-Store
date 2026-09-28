'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const DURATION_MS = 3500;

export const CartToastAlert: React.FC = () => {
  const router = useRouter();
  const { cartAlert, dismissCartAlert, setIsCartOpen } = useCart();
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(DURATION_MS);

  useEffect(() => {
    if (!cartAlert) {
      setProgress(100);
      return;
    }

    // Reset timer whenever a new item is added
    setProgress(100);
    remainingTimeRef.current = DURATION_MS;
    startTimeRef.current = Date.now();

    const interval = 50; // update progress every 50ms
    const progressTimer = setInterval(() => {
      if (!isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        const pct = (currentRemaining / DURATION_MS) * 100;
        setProgress(pct);

        if (currentRemaining <= 0) {
          clearInterval(progressTimer);
          dismissCartAlert();
        }
      }
    }, interval);

    return () => {
      clearInterval(progressTimer);
    };
  }, [cartAlert, isHovered, dismissCartAlert]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Record elapsed time up to pause
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startTimeRef.current = Date.now();
  };

  if (!cartAlert) return null;

  const item = cartAlert.item;

  const handleViewCart = () => {
    dismissCartAlert();
    setIsCartOpen(true);
  };

  const handleGoToCheckout = () => {
    dismissCartAlert();
    router.push('/checkout');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        maxWidth: '400px',
        width: 'calc(100vw - 32px)',
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.45), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          position: 'relative',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Toast Header */}
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              Đã thêm vào giỏ hàng thành công
            </span>
          </div>

          <button
            onClick={dismissCartAlert}
            aria-label="Đóng thông báo"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <X size={15} />
          </button>
        </div>

        {/* Product Item Content */}
        <div style={{ padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          {/* Thumbnail */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
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
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="var(--text-dim)" />
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={item.product_name}
            >
              {item.product_name}
            </h4>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {item.variant_title} • <span style={{ fontWeight: 600 }}>SL: {item.quantity}</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {item.price.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div
          style={{
            padding: '10px 16px 14px',
            display: 'flex',
            gap: '10px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
          }}
        >
          <button
            onClick={handleViewCart}
            className="btn btn-secondary btn-sm"
            style={{
              flex: 1,
              fontSize: '12px',
              fontWeight: 600,
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ShoppingBag size={14} />
            Xem giỏ hàng
          </button>
          <button
            onClick={handleGoToCheckout}
            className="btn btn-primary btn-sm"
            style={{
              flex: 1,
              fontSize: '12px',
              fontWeight: 700,
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Thanh toán ngay
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Countdown Auto-Dismiss Progress Bar */}
        <div
          style={{
            height: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            width: '100%',
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              transition: isHovered ? 'none' : 'width 50ms linear',
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(-24px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
