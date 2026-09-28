'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, PackageCheck, Clock, CheckCircle2, Truck, RotateCcw, AlertCircle, QrCode } from 'lucide-react';
import { Order } from '@/types/order';
import { VietQrData } from '@/services/paymentService';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initOrderId = searchParams.get('order_id') || '';
  const initPhone = searchParams.get('phone') || '';

  const [orderId, setOrderId] = useState(initOrderId);
  const [phone, setPhone] = useState(initPhone);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [vietqr, setVietqr] = useState<VietQrData | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      setError('Vui lòng nhập cả Mã đơn hàng và Số điện thoại');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId.trim(),
          phone: phone.trim(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data.order);
        setVietqr(json.data.vietqr);
      } else {
        setError(json.error || 'Không tìm thấy đơn hàng tương ứng.');
        setOrder(null);
      }
    } catch (err) {
      setError('Lỗi kết nối tra cứu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initOrderId && initPhone) {
      handleTrack();
    }
  }, [initOrderId, initPhone]);

  const steps = [
    { key: 'PENDING', label: 'Đã đặt hàng', desc: 'Chờ xác nhận thanh toán' },
    { key: 'CONFIRMED', label: 'Đã xác nhận', desc: 'Shop đã duyệt đơn' },
    { key: 'PROCESSING', label: 'Đang xử lý', desc: 'Đang bọc hộp & đóng gói' },
    { key: 'SHIPPED', label: 'Đang giao hàng', desc: 'Đã gửi bưu tá vận chuyển' },
    { key: 'DELIVERED', label: 'Đã giao thành công', desc: 'Khách đã nhận kiện hàng' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentStatus === 'CANCELLED') return 'cancelled';
    if (stepIdx <= currentIdx) return 'completed';
    return 'upcoming';
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(249, 115, 22, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <PackageCheck size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            Tra Cứu Đơn Hàng
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Nhập Mã đơn hàng (ví dụ: ATS-20260927-0001) và Số điện thoại đã đặt hàng.
          </p>
        </div>

        {/* Search Box */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '32px',
          }}
        >
          <form onSubmit={handleTrack} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 120px', gap: '12px' }}>
            <input
              type="text"
              required
              placeholder="Mã đơn hàng (VD: ATS-20260927-0001)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="input-field"
              style={{ textTransform: 'uppercase' }}
            />
            <input
              type="tel"
              required
              placeholder="Số điện thoại người nhận"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Search size={16} />
              {loading ? 'Đang tra...' : 'Tra cứu'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '14px', fontSize: '13px', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Order Details & Timeline Display */}
        {order && (
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              border: '1px solid var(--border-subtle)',
            }}
            className="animate-fade-in"
          >
            {/* Order Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '28px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Thông tin hành trình
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Mã đơn: {order.order_id}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Đặt lúc: {new Date(order.created_at).toLocaleString('vi-VN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={order.payment_status === 'PAID' ? 'badge badge-green' : 'badge badge-orange'}>
                  {order.payment_status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </span>
                <span className={order.order_status === 'DELIVERED' ? 'badge badge-green' : order.order_status === 'CANCELLED' ? 'badge badge-rose' : 'badge badge-blue'}>
                  {order.order_status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>Tiến độ xử lý đơn hàng</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key, order.order_status);
                  const isDone = status === 'completed';
                  return (
                    <div key={step.key} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isDone ? 'var(--accent-emerald)' : 'var(--bg-secondary)',
                          border: isDone ? 'none' : '2px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: isDone ? 'var(--text-main)' : 'var(--text-dim)' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Summary */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Sản phẩm trong đơn</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(order.items || []).map((i) => (
                  <div key={i.item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{i.product_name}</strong> ({i.variant_title}) x {i.quantity}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {i.total.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '12px', fontWeight: 800, fontSize: '16px' }}>
                <span>Tổng tiền:</span>
                <span>{order.total_amount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <div><strong>Người nhận:</strong> {order.customer_name} ({order.customer_phone})</div>
              <div><strong>Địa chỉ giao:</strong> {order.shipping_address}, {order.shipping_ward}, {order.shipping_district}, {order.shipping_city}</div>
              <div><strong>Thời gian giao dự kiến:</strong> 3–5 ngày kể từ ngày đặt</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="badge badge-neutral" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Đang tải thông tin tra cứu...
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
