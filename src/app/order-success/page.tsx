'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { CheckCircle, Copy, Check, Clock, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '@/types/order';
import { VietQrData } from '@/services/paymentService';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  const [vietqr, setVietqr] = useState<VietQrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignored if canvas fails
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data.order);
          setVietqr(json.data.vietqr);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const copyToClipboard = (text: string, type: 'memo' | 'acc') => {
    navigator.clipboard.writeText(text);
    if (type === 'memo') {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    } else {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Đang khởi tạo thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy thông tin đơn hàng</h2>
        <Link href="/" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-emerald)',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            Đặt Hàng Thành Công!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Cảm ơn <strong>{order.customer_name}</strong> đã ủng hộ Anh Thư Sneaker.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Mã đơn hàng: <span style={{ color: 'var(--accent-primary)' }}>{order.order_id}</span>
          </div>
        </div>

        {/* Bank Transfer Payment Instructions (VietQR) */}
        {order.payment_method === 'BANK_TRANSFER' && vietqr && (
          <div
            style={{
              background: 'linear-gradient(145deg, #181d27 0%, #11151c 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              padding: '28px',
              marginBottom: '32px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <QrCode size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Thông Tin Chuyển Khoản VietQR</h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              Vui lòng mở ứng dụng ngân hàng bất kỳ trên điện thoại (Vietcombank, MB, Techcombank...) để quét mã QR bên dưới, hoặc chuyển khoản theo thông tin chính xác:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                alignItems: 'center',
              }}
            >
              {/* QR Image */}
              <div style={{ textAlign: 'center', background: '#ffffff', borderRadius: '12px', padding: '16px', maxWidth: '240px', margin: '0 auto' }}>
                <img
                  src={vietqr.qr_url}
                  alt="VietQR Chuyển khoản"
                  style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                />
                <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', fontWeight: 600 }}>
                  Quét mã bằng app ngân hàng
                </div>
              </div>

              {/* Bank Details Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Ngân hàng thụ hưởng</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{vietqr.bank_name}</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Số tài khoản</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                      {vietqr.bank_account_number}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(vietqr.bank_account_number, 'acc')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    {copiedAcc ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                    {copiedAcc ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Chủ tài khoản</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{vietqr.bank_account_name}</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Số tiền thanh toán</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {order.total_amount.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>

                {/* Exact Transfer Note / Memo */}
                <div
                  style={{
                    background: 'rgba(249, 115, 22, 0.1)',
                    border: '1px solid var(--accent-primary)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase' }}>
                      Nội dung chuyển khoản (Bắt buộc ghi đúng)
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                      {order.order_id}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.order_id, 'memo')}
                    className="btn btn-accent btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    {copiedMemo ? <Check size={14} /> : <Copy size={14} />}
                    {copiedMemo ? 'Đã sao chép' : 'Sao chép mã'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '32px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Thông tin đơn hàng</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Người nhận:</span>{' '}
              <strong>{order.customer_name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Số điện thoại:</span>{' '}
              <strong>{order.customer_phone}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Địa chỉ:</span>{' '}
              <strong>{order.shipping_address}, {order.shipping_ward}, {order.shipping_district}, {order.shipping_city}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Dự kiến giao hàng:</span>{' '}
              <strong style={{ color: 'var(--accent-emerald)' }}>3–5 ngày</strong>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(order.items || []).map((item) => (
                <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.product_name}</span> ({item.variant_title}) x {item.quantity}
                  </div>
                  <div style={{ fontWeight: 700 }}>{item.total.toLocaleString('vi-VN')}đ</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Phí vận chuyển</span>
                <span>{order.shipping_fee.toLocaleString('vi-VN')}đ</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>Giảm giá</span>
                  <span>-{order.discount_amount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', marginTop: '6px' }}>
                <span>Tổng thanh toán</span>
                <span style={{ color: 'var(--accent-primary)' }}>{order.total_amount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href={`/track-order?order_id=${order.order_id}&phone=${order.customer_phone}`}
            className="btn btn-secondary btn-lg"
          >
            Tra cứu hành trình đơn hàng
          </Link>
          <Link href="/" className="btn btn-primary btn-lg">
            Tiếp tục mua sắm
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="badge badge-neutral" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Đang tải thông tin đơn hàng...
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
