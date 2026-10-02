'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ShoppingCart,
  User,
  CreditCard,
  Tag,
  FolderTree,
  DollarSign,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Product, ProductVariant, Category } from '@/types/product';

export default function AdminPosPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  // Discount & Cash Tendered
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories?all=true').then((r) => r.json()),
    ])
      .then(([prodJson, catJson]) => {
        if (prodJson.success && prodJson.data?.products) {
          setProducts(prodJson.data.products);
        }
        if (catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const addToPosCart = (product: Product, variant: ProductVariant) => {
    const available = variant.stock - (variant.reserved_stock || 0);
    if (available <= 0) {
      alert('Sản phẩm này tạm thời đã hết hàng trong kho');
      return;
    }

    setPosCart((prev) => {
      const idx = prev.findIndex((i) => i.variant.variant_id === variant.variant_id);
      if (idx !== -1) {
        if (prev[idx].quantity >= available) {
          alert(`Chỉ còn ${available} sản phẩm trong kho`);
          return prev;
        }
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
            const available = item.variant.stock - (item.variant.reserved_stock || 0);
            const nextQty = item.quantity + delta;
            if (nextQty > available) {
              alert(`Chỉ còn ${available} sản phẩm trong kho`);
              return item;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const removeItem = (variantId: string) => {
    setPosCart((prev) => prev.filter((item) => item.variant.variant_id !== variantId));
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const changeDue = cashTendered > 0 ? Math.max(0, cashTendered - finalTotal) : 0;

  const handleCompleteOrder = async () => {
    if (posCart.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm vào đơn');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: shippingAddress.trim(),
        shipping_city: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        notes: [
          notes.trim(),
          discountAmount > 0 ? `Giảm giá tại quầy: -${discountAmount.toLocaleString('vi-VN')}đ` : '',
          paymentMethod === 'CASH' && cashTendered > 0
            ? `Khách đưa: ${cashTendered.toLocaleString('vi-VN')}đ (Thối lại: ${changeDue.toLocaleString('vi-VN')}đ)`
            : '',
        ]
          .filter(Boolean)
          .join(' | ') || `Đơn tạo nhanh qua ${salesChannel}`,
        payment_method: paymentMethod,
        sales_channel: salesChannel,
        discount_amount: discountAmount,
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variants?.some((v) => v.sku.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
          Tạo Đơn Nhanh Tại Quầy & Chat (POS)
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Hỗ trợ bán trực tiếp tại cửa hàng, chốt đơn qua Facebook/Zalo, áp dụng giảm giá và tính tiền thối lại tự động.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1.3fr) minmax(360px, 1fr)',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT: Product Selection & Category Filter */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Tìm nhanh theo tên sản phẩm, mã SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '10px',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === '' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              Tất cả ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.category_id}
                type="button"
                onClick={() => setSelectedCategory(c.category_id)}
                className={selectedCategory === c.category_id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Products List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: '13px' }}>
              Không tìm thấy sản phẩm nào trong danh mục này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '580px', overflowY: 'auto' }}>
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
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {p.brand_name || 'Sneaker'} • {p.category_name || p.category_id}
                      </div>
                    </div>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '14px' }}>
                      {(p.min_price || 0).toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  {/* Size buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(p.variants || []).map((v) => {
                      const available = v.stock - (v.reserved_stock || 0);
                      const isOutOfStock = available <= 0;
                      return (
                        <button
                          key={v.variant_id}
                          onClick={() => addToPosCart(p, v)}
                          disabled={isOutOfStock}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: isOutOfStock ? 'rgba(255,255,255,0.03)' : 'var(--bg-surface)',
                            color: isOutOfStock ? 'var(--text-dim)' : 'var(--text-main)',
                            border: isOutOfStock ? '1px dashed var(--border-subtle)' : '1px solid var(--border-subtle)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Size {v.size}
                          <span
                            style={{
                              fontSize: '10px',
                              color: isOutOfStock ? '#f43f5e' : available <= 3 ? '#f59e0b' : 'var(--text-dim)',
                            }}
                          >
                            ({isOutOfStock ? 'Hết' : available})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} color="var(--accent-primary)" />
              Sản phẩm đã chọn ({posCart.length})
            </h3>
            {posCart.length > 0 && (
              <button
                type="button"
                onClick={() => setPosCart([])}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', color: '#f43f5e' }}
              >
                <RotateCcw size={12} /> Xóa giỏ
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
              maxHeight: '220px',
              overflowY: 'auto',
            }}
          >
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
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Size {item.variant.size} • {item.variant.price.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', borderRadius: '4px', padding: '2px' }}>
                      <button onClick={() => updateQty(item.variant.variant_id, -1)} style={{ padding: '2px 6px' }}>
                        <Minus size={11} />
                      </button>
                      <span style={{ padding: '0 8px', fontWeight: 700, fontSize: '12px' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.variant.variant_id, 1)} style={{ padding: '2px 6px' }}>
                        <Plus size={11} />
                      </button>
                    </div>

                    <span style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right', color: 'var(--accent-primary)' }}>
                      {(item.variant.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variant.variant_id)}
                      style={{ color: '#f43f5e', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Channel Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '16px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
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
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Địa chỉ giao hàng (nếu có)</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Pricing, Discount & Change Due */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
              <span style={{ fontWeight: 700 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Giảm giá tại quầy:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  placeholder="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="input-field"
                  style={{ width: '120px', height: '28px', fontSize: '12px', textAlign: 'right' }}
                />
                <span>đ</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>TỔNG CỘNG:</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {finalTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>

            {paymentMethod === 'CASH' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  marginTop: '4px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Khách đưa:</span>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                    placeholder="Tiền khách đưa..."
                    className="input-field"
                    style={{ width: '130px', height: '26px', fontSize: '12px' }}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Tiền thối lại:</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: changeDue > 0 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                    {changeDue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCompleteOrder}
            disabled={submitting || posCart.length === 0}
            className="btn btn-accent btn-lg"
            style={{ width: '100%', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Receipt size={18} />
            {submitting ? 'Đang tạo đơn...' : 'Hoàn Tất & Khởi Tạo Đơn Hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}
