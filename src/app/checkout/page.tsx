'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, Tag, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import VietnamAddressSelect from '@/components/storefront/VietnamAddressSelect';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingDistrict, setShippingDistrict] = useState('');
  const [shippingWard, setShippingWard] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'COD'>('BANK_TRANSFER');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [shippingFeeConfig, setShippingFeeConfig] = useState(30000);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.SHIPPING_FEE !== undefined) {
          setShippingFeeConfig(Number(json.data.SHIPPING_FEE));
        }
      })
      .catch(() => {});
  }, []);

  const isFreeShipping = subtotal >= 1000000;
  const shippingFee = isFreeShipping ? 0 : shippingFeeConfig;
  const discountAmount = appliedCoupon?.discount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: couponCode.trim(),
          subtotal,
          phone: customerPhone,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAppliedCoupon({
          code: json.data.coupon_code,
          discount: json.data.discount_amount,
        });
        setCouponMessage({ text: json.message, isError: false });
      } else {
        setCouponMessage({ text: json.error || 'Mã giảm giá không hợp lệ', isError: true });
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponMessage({ text: 'Lỗi kiểm tra mã giảm giá', isError: true });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (cart.length === 0) {
      setSubmitError('Giỏ hàng trống. Vui lòng chọn sản phẩm.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setSubmitError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng nhận hàng.');
      return;
    }

    if (!shippingCity || !shippingDistrict || !shippingWard) {
      setSubmitError('Vui lòng chọn đầy đủ Tỉnh / Thành phố, Quận / Huyện và Phường / Xã.');
      return;
    }

    const phoneClean = customerPhone.trim().replace(/\s+/g, '');
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phoneClean)) {
      setSubmitError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số (VD: 0912345678).');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        shipping_address: shippingAddress.trim(),
        shipping_city: shippingCity,
        shipping_district: shippingDistrict,
        shipping_ward: shippingWard,
        notes: notes.trim(),
        coupon_code: appliedCoupon?.code || undefined,
        payment_method: paymentMethod,
        sales_channel: 'WEBSITE',
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          variant_title: item.variant_title,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        clearCart();
        const orderId = json.data.order.order_id;
        router.push(`/order-success?id=${orderId}`);
      } else {
        setSubmitError(json.error || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }
    } catch (err: any) {
      setSubmitError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !submitting) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Giỏ hàng chưa có sản phẩm</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Vui lòng thêm ít nhất một đôi sneaker hoặc phụ kiện để tiến hành đặt hàng.
        </p>
        <Link href="/products" className="btn btn-primary btn-sm">
          Khám phá sản phẩm ngay
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          href="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} /> Quay lại mua sắm
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>
          Thanh Toán & Đặt Hàng
        </h1>

        {submitError && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '14px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '40px',
              alignItems: 'flex-start',
            }}
          >
            {/* LEFT: Customer & Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Box 1: Thông tin người nhận */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  1. Thông tin giao hàng
                </h3>

                {/* Guest Checkout Notice */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(249, 115, 22, 0.08)',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    lineHeight: '1.5',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <ShieldCheck size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Khách hàng không cần đăng ký tài khoản:</strong> Để đơn hàng được giao nhanh chóng và chính xác nhất, quý khách vui lòng điền đầy đủ các thông tin có dấu <span style={{ color: '#f43f5e', fontWeight: 700 }}>*</span> bên dưới.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Họ và tên người nhận <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Số điện thoại <span style={{ color: '#f43f5e' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Email (Nhận xác nhận đơn)
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <VietnamAddressSelect
                    city={shippingCity}
                    district={shippingDistrict}
                    ward={shippingWard}
                    onCityChange={setShippingCity}
                    onDistrictChange={setShippingDistrict}
                    onWardChange={setShippingWard}
                    required
                  />

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Địa chỉ cụ thể (Số nhà, tên đường) <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 123 Đường Nguyễn Trãi"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Ghi chú đơn hàng (Thời gian nhận, dặn dò bưu tá...)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Giao giờ hành chính, gọi trước khi giao..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Phương thức thanh toán */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  2. Phương thức thanh toán
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: paymentMethod === 'BANK_TRANSFER' ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-secondary)',
                      border: paymentMethod === 'BANK_TRANSFER' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Chuyển khoản Ngân hàng (Quét VietQR tự động)
                        <span className="badge badge-orange">Khuyên dùng</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Sau khi đặt hàng, hệ thống sẽ hiển thị mã VietQR kèm số tiền và mã đơn hàng chính xác. Bạn chỉ cần mở ứng dụng ngân hàng và quét mã để chuyển khoản.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: paymentMethod === 'COD' ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-secondary)',
                      border: paymentMethod === 'COD' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Thanh toán tiền mặt trực tiếp cho nhân viên bưu tá khi nhận kiện hàng.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary & Coupon */}
            <div>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1px solid var(--border-subtle)',
                  position: 'sticky',
                  top: '90px',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
                  Đơn hàng của bạn ({cart.length} sản phẩm)
                </h3>

                {/* Items preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <div key={item.variant_id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#0b0d11', flexShrink: 0 }}>
                        {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.product_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {item.variant_title} x {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon input */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Mã giảm giá (VD: ANHTHU10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '13px', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn btn-secondary btn-sm"
                    >
                      {couponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>
                  {couponMessage && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: couponMessage.isError ? '#f43f5e' : 'var(--accent-emerald)',
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {couponMessage.isError ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                      {couponMessage.text}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Tạm tính</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                      <span>Giảm giá ({appliedCoupon?.code})</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Phí vận chuyển toàn quốc</span>
                    <span style={{ color: isFreeShipping ? 'var(--accent-emerald)' : 'var(--text-main)', fontWeight: 700 }}>
                      {isFreeShipping ? 'MIỄN PHÍ' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>Tổng thanh toán</span>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {finalTotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-accent btn-lg"
                  style={{ width: '100%', marginTop: '24px', fontWeight: 700 }}
                >
                  {submitting ? 'Đang xử lý đặt hàng...' : 'Xác Nhận Đặt Hàng'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)', marginTop: '14px' }}>
                  Thời gian giao hàng dự kiến: 3–5 ngày kể từ khi đặt hàng.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
