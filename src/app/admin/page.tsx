'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  CreditCard,
  PlusCircle,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  Phone,
  Eye,
} from 'lucide-react';
import { BusinessSummary } from '@/services/analyticsService';

export default function AdminDashboardPage() {
  const [data, setData] = useState<BusinessSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Đang tải bảng điều khiển quản trị...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    today_revenue: 0,
    today_orders_count: 0,
    pending_orders_count: 0,
    unpaid_orders_count: 0,
    low_stock_count: 0,
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Welcome Greeting */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
            Xin chào, Anh Thư 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Dưới đây là tóm tắt kinh doanh hôm nay và các đơn hàng cần bạn xử lý.
          </p>
        </div>

        {/* Quick Actions Shortcuts */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/pos" className="btn btn-accent btn-sm">
            <CreditCard size={16} /> Tạo đơn tại quầy / chat (POS)
          </Link>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* TODAY 5 KPI Cards Grid (Section 87) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* KPI 1: Doanh thu hôm nay */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Doanh thu hôm nay
            </span>
            <TrendingUp size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            {kpis.today_revenue.toLocaleString('vi-VN')}đ
          </div>
        </div>

        {/* KPI 2: Đơn hôm nay */}
        <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Đơn hàng hôm nay
            </span>
            <ShoppingBag size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            {kpis.today_orders_count} đơn
          </div>
        </div>

        {/* KPI 3: Đơn chờ xử lý */}
        <Link
          href="/admin/orders?status=PENDING"
          style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase' }}>
              Chờ xử lý / Đóng gói
            </span>
            <Clock size={18} color="#fb923c" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fb923c' }}>
            {kpis.pending_orders_count} đơn
          </div>
        </Link>

        {/* KPI 4: Đơn chưa thanh toán */}
        <Link
          href="/admin/orders?payment=UNPAID"
          style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase' }}>
              Chưa thanh toán
            </span>
            <CreditCard size={18} color="#fb7185" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fb7185' }}>
            {kpis.unpaid_orders_count} đơn
          </div>
        </Link>

        {/* KPI 5: Sắp hết hàng */}
        <Link
          href="/admin/inventory"
          style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Sắp hết hàng
            </span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: kpis.low_stock_count > 0 ? '#f59e0b' : 'var(--text-main)' }}>
            {kpis.low_stock_count} mục
          </div>
        </Link>
      </div>

      {/* Financial Health Summary (Section 38: Gross Profit & COGS) */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Tổng doanh thu tích lũy</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {(data?.total_revenue || 0).toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Lợi nhuận gộp ước tính (Gross Profit)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {(data?.gross_profit || 0).toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Tỷ suất lợi nhuận gộp (Margin)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {data?.gross_margin_pct || 0}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Giá trị đơn trung bình (AOV)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {(data?.avg_order_value || 0).toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Orders + Low Stock Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left: Đơn hàng cần xử lý ngay */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Đơn hàng cần xử lý</h3>
            <Link href="/admin/orders" style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Xem tất cả
            </Link>
          </div>

          {(data?.urgent_orders || []).length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
              Tuyệt vời! Không có đơn hàng nào tồn đọng cần xử lý.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data?.urgent_orders || []).slice(0, 5).map((ord: any) => (
                <div
                  key={ord.order_id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{ord.order_id}</span>
                      <span className={ord.payment_status === 'PAID' ? 'badge badge-green' : 'badge badge-orange'} style={{ fontSize: '10px' }}>
                        {ord.payment_status === 'PAID' ? 'ĐÃ TRẢ' : 'CHỜ TIỀN'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ord.customer_name} • {ord.customer_phone}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '4px' }}>
                      {ord.total_amount.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <Link href={`/admin/orders?search=${ord.order_id}`} className="btn btn-secondary btn-sm">
                    Xử lý <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sản phẩm sắp hết hàng */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Cảnh báo sắp hết hàng</h3>
            <Link href="/admin/inventory" style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Kho hàng
            </Link>
          </div>

          {(data?.low_stock_items || []).length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
              Kho hàng dồi dào, không có mẫu nào chạm ngưỡng cảnh báo.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data?.low_stock_items || []).slice(0, 5).map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.product_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Size: <strong>{item.size}</strong> • SKU: {item.sku}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>
                      {item.available_stock} đôi
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tồn: {item.stock}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
