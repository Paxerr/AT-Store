'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, PlusCircle, CheckCircle2, XCircle, Calendar, ShieldCheck, X } from 'lucide-react';
import { Coupon } from '@/types/coupon';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(500000);
  const [maxDiscount, setMaxDiscount] = useState(100000);
  const [usageLimit, setUsageLimit] = useState(100);
  const [endAt, setEndAt] = useState('2026-12-31T23:59:59Z');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const json = await res.json();
      if (json.success) setCoupons(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: code.trim(),
          type,
          value: Number(value),
          minimum_order: Number(minOrder),
          maximum_discount: Number(maxDiscount),
          usage_limit: Number(usageLimit),
          end_at: endAt,
          active: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setCode('');
        fetchCoupons();
      } else {
        alert(json.error || 'Lỗi khi tạo mã giảm giá');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
            Quản Lý Mã Giảm Giá ({coupons.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Tạo chương trình ưu đãi, voucher % hoặc giảm tiền trực tiếp cho khách hàng.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-accent btn-sm">
          <PlusCircle size={16} /> Tạo mã giảm giá mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải mã giảm giá...
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>MÃ VOUCHER</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>LOẠI GIẢM</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>GIÁ TRỊ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>ĐƠN TỐI THIỂU</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>GIẢM TỐI ĐA</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>LƯỢT DÙNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr
                  key={c.coupon_id}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
                    {c.coupon_code}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {c.type === 'PERCENTAGE' ? 'Giảm %' : 'Giảm tiền mặt'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                    {c.type === 'PERCENTAGE' ? `${c.value}%` : `${c.value.toLocaleString('vi-VN')}đ`}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.minimum_order ? `${c.minimum_order.toLocaleString('vi-VN')}đ` : 'Không'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.maximum_discount ? `${c.maximum_discount.toLocaleString('vi-VN')}đ` : 'Không'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.times_used} / {c.usage_limit}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={c.active ? 'badge badge-green' : 'badge badge-neutral'} style={{ fontSize: '10px' }}>
                      {c.active ? 'HOẠT ĐỘNG' : 'HẾT HẠN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Tạo Mã Giảm Giá Mới</h3>
              <button onClick={() => setShowModal(false)} className="btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mã giảm giá (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: ANHTHU20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Loại giảm</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="input-field">
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Giá trị giảm ({type === 'PERCENTAGE' ? '%' : 'VND'})
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ngày hết hạn</label>
                  <input
                    type="date"
                    required
                    value={endAt ? endAt.split('T')[0] : '2026-12-31'}
                    onChange={(e) => setEndAt(new Date(e.target.value + 'T23:59:59Z').toISOString())}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Hủy</button>
                <button type="submit" disabled={creating} className="btn btn-accent btn-sm">
                  {creating ? 'Đang tạo...' : 'Xác nhận tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
