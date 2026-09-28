'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Minus, Trash2, CheckCircle2, ShoppingCart, User, CreditCard } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';

export default function AdminPosPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // POS Cart
  const [posCart, setPosCart] = useState<
    { product: Product; variant: ProductVariant; quantity: number }[]
  >([]);

  // Customer & Channel info
  const [customerName, setCustomerName] = useState('Khách Mua Tại Cửa Hàng');
  const [customerPhone, setCustomerPhone] = useState('0900000000');
  const [shippingAddress, setShippingAddress] = useState('Mua trực tiếp tại cửa hàng Anh Thư');
  const [salesChannel, setSalesChannel] = useState<'POS' | 'FACEBOOK' | 'ZALO' | 'PHONE'>('POS');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'COD' | 'CASH'>('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProducts(json.data.products);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const addToPosCart = (product: Product, variant: ProductVariant) => {
    setPosCart((prev) => {
      const idx = prev.findIndex((i) => i.variant.variant_id === variant.variant_id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
  };

  const updateQty = (variantId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.variant.variant_id === variantId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  const handleCompleteOrder = async () => {
    if (posCart.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm vào đơn');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_city: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        notes: notes || `Đơn tạo nhanh qua ${salesChannel}`,
        payment_method: paymentMethod,
        sales_channel: salesChannel,
        items: posCart.map((item) => ({
          product_id: item.product.product_id,
          variant_id: item.variant.variant_id,
          product_name: item.product.name,
          variant_title: `Size ${item.variant.size}`,
          sku: item.variant.sku,
          price: item.variant.price,
          quantity: item.quantity,
          image: item.variant.image,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        alert(`Tạo đơn thành công! Mã đơn: ${json.data.order.order_id}`);
        router.push(`/admin/orders?search=${json.data.order.order_id}`);
      } else {
        alert(json.error || 'Lỗi khi tạo đơn');
      }
    } catch (e) {
      alert('Lỗi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variants?.some((v) => v.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
          Tạo Đơn Nhanh Tại Quầy & Chat (POS)
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Dành cho khách mua tại cửa hàng hoặc khách chốt đơn qua Facebook, Zalo, Điện thoại.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT: Product Selection */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Tìm nhanh theo tên, mã SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredProducts.map((p) => (
              <div
                key={p.product_id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.name}</div>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '14px' }}>
                    {(p.min_price || 0).toLocaleString('vi-VN')}đ
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(p.variants || []).map((v) => {
                    const available = v.stock - (v.reserved_stock || 0);
                    return (
                      <button
                        key={v.variant_id}
                        onClick={() => addToPosCart(p, v)}
                        disabled={available <= 0}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: available > 0 ? 'var(--bg-surface)' : 'rgba(255,255,255,0.05)',
                          color: available > 0 ? 'var(--text-main)' : 'var(--text-dim)',
                          border: '1px solid var(--border-subtle)',
                          cursor: available > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Size {v.size} ({available > 0 ? available : 'Hết'})
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: POS Cart & Customer Details */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Sản phẩm đã chọn ({posCart.length})
          </h3>

          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
            {posCart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '13px' }}>
                Bấm vào các nút Size bên trái để thêm sản phẩm vào đơn.
              </div>
            ) : (
              posCart.map((item) => (
                <div
                  key={item.variant.variant_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Size {item.variant.size} • {item.variant.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', borderRadius: '4px', padding: '2px' }}>
                      <button onClick={() => updateQty(item.variant.variant_id, -1)} style={{ padding: '2px 6px' }}><Minus size={10} /></button>
                      <span style={{ padding: '0 6px', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.variant.variant_id, 1)} style={{ padding: '2px 6px' }}><Plus size={10} /></button>
                    </div>
                    <span style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>
                      {(item.variant.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Channel & Customer Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Kênh bán</label>
                <select
                  value={salesChannel}
                  onChange={(e: any) => setSalesChannel(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '13px' }}
                >
                  <option value="POS">Tại Cửa Hàng (POS)</option>
                  <option value="FACEBOOK">Facebook Message</option>
                  <option value="ZALO">Zalo OA / Chat</option>
                  <option value="PHONE">Gọi điện thoại</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '13px' }}
                >
                  <option value="CASH">Tiền mặt tại quầy (CASH)</option>
                  <option value="BANK_TRANSFER">Chuyển khoản VietQR</option>
                  <option value="COD">Thu hộ COD</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Tên khách hàng</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Số điện thoại</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Địa chỉ nhận hàng</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Pricing & Submit */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>Tổng tiền:</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {subtotal.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <button
            onClick={handleCompleteOrder}
            disabled={submitting || posCart.length === 0}
            className="btn btn-accent btn-lg"
            style={{ width: '100%', fontWeight: 700 }}
          >
            {submitting ? 'Đang tạo đơn...' : 'Hoàn Tất & Khởi Tạo Đơn Hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}
