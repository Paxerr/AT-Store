'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { Customer } from '@/types/customer';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCustomers(json.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
          Danh Sách Khách Hàng ({filtered.length})
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Cơ sở dữ liệu khách mua hàng từ website, quầy và các kênh chat.
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Tìm theo tên khách, số điện thoại, tỉnh thành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải dữ liệu khách hàng...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Không có khách hàng nào khớp với tìm kiếm.
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
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>HỌ TÊN KHÁCH</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SỐ ĐIỆN THOẠI</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>ĐỊA CHỈ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SỐ ĐƠN ĐÃ MUA</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TỔNG CHI TIÊU</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>LẦN CUỐI MUA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.customer_id}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {c.phone}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {c.address ? `${c.address}, ${c.ward || ''}, ${c.district || ''}, ${c.city || ''}` : 'Chưa có'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                    {c.total_orders} đơn
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {(c.total_spent || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-dim)' }}>
                    {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('vi-VN') : 'Mới'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
