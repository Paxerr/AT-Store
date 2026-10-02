'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  History,
  ArrowUpDown,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { Inventory, InventoryLog } from '@/types/inventory';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW' | 'OUT'>('ALL');

  // Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<InventoryLog['change_type']>('RESTOCK');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const json = await res.json();
      if (json.success) {
        setInventory(json.data.inventory);
        setLogs(json.data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (item: Inventory, type: InventoryLog['change_type'] = 'RESTOCK', defaultDelta: number = 5) => {
    setSelectedItem(item);
    setAdjustType(type);
    setAdjustDelta(defaultDelta);
    setAdjustReason(type === 'RESTOCK' ? 'Nhập thêm hàng từ xưởng' : 'Kiểm kê định kỳ');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!adjustReason.trim()) {
      alert('Bắt buộc nhập lý do điều chỉnh kho (Ví dụ: Kiểm kho phát hiện dư, Hàng lỗi trả xưởng...)');
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: selectedItem.variant_id,
          quantity_change: Number(adjustDelta),
          change_type: adjustType,
          reason: adjustReason.trim(),
          user_id: 'Admin',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedItem(null);
        setAdjustReason('');
        fetchInventory();
      } else {
        alert(json.error || 'Lỗi khi điều chỉnh');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setAdjusting(false);
    }
  };

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      !search ||
      item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.size?.includes(search);

    const matchesStock =
      stockStatus === 'ALL' ||
      (stockStatus === 'IN_STOCK' && item.available_stock > 3) ||
      (stockStatus === 'LOW' && item.available_stock > 0 && item.available_stock <= item.low_stock_threshold) ||
      (stockStatus === 'OUT' && item.available_stock <= 0);

    return matchesSearch && matchesStock;
  });

  const totalVariants = inventory.length;
  const totalStockCount = inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = inventory.filter(
    (item) => item.available_stock > 0 && item.available_stock <= item.low_stock_threshold
  ).length;
  const outOfStockCount = inventory.filter((item) => item.available_stock <= 0).length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
            Quản Lý Kho Hàng & Tồn Kho ({filtered.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Theo dõi tồn kho thực tế, tồn kho đang giữ (reserved) và nhập kho/điều chỉnh tức thì.
          </p>
        </div>

        <Link href="/admin/products/new" className="btn btn-accent btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Thêm sản phẩm mới
        </Link>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: 'var(--bg-surface)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Tổng biến thể kích cỡ
            </span>
            <Package size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{totalVariants} SKU</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Tổng tồn kho khả dụng
            </span>
            <Layers size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)' }}>{totalStockCount} đôi</div>
        </div>

        <div
          onClick={() => setStockStatus('LOW')}
          style={{
            background: 'var(--bg-surface)',
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            border: stockStatus === 'LOW' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              Sắp hết hàng (≤3)
            </span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{lowStockCount} mẫu</div>
        </div>

        <div
          onClick={() => setStockStatus('OUT')}
          style={{
            background: 'var(--bg-surface)',
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            border: stockStatus === 'OUT' ? '2px solid #f43f5e' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>
              Hết hàng (0 đôi)
            </span>
            <AlertCircle size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f43f5e' }}>{outOfStockCount} mẫu</div>
        </div>
      </div>

      {/* Search & Stock Filter Toolbar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã SKU, kích cỡ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setStockStatus('ALL')}
            className={stockStatus === 'ALL' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            style={{ fontSize: '12px' }}
          >
            Tất cả ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setStockStatus('IN_STOCK')}
            className={stockStatus === 'IN_STOCK' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            style={{ fontSize: '12px' }}
          >
            Còn nhiều (&gt;3)
          </button>
          <button
            type="button"
            onClick={() => setStockStatus('LOW')}
            className={stockStatus === 'LOW' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            style={{ fontSize: '12px', color: stockStatus === 'LOW' ? '#fff' : '#f59e0b' }}
          >
            Sắp hết hàng ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockStatus('OUT')}
            className={stockStatus === 'OUT' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            style={{ fontSize: '12px', color: stockStatus === 'OUT' ? '#fff' : '#f43f5e' }}
          >
            Hết hàng ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải thông tin tồn kho...
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            marginBottom: '40px',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SẢN PHẨM & BIẾN THỂ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SKU</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>SIZE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>TỒN THỰC TẾ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>ĐANG GIỮ (RESERVED)</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>KHẢ DỤNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>THAO TÁC NHẬP / ĐIỀU CHỈNH</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Không có sản phẩm nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.available_stock <= item.low_stock_threshold && item.available_stock > 0;
                  const isOut = item.available_stock <= 0;

                  return (
                    <tr
                      key={item.variant_id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isOut ? 'rgba(244, 63, 94, 0.04)' : isLow ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = isOut
                          ? 'rgba(244, 63, 94, 0.04)'
                          : isLow
                          ? 'rgba(245, 158, 11, 0.04)'
                          : 'transparent')
                      }
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                          {item.product_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Size {item.size} • {item.color}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {item.sku}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                          {item.size}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>{item.stock}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: item.reserved_stock > 0 ? '#fb923c' : 'var(--text-dim)' }}>
                        {item.reserved_stock}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          className={`badge ${isOut ? 'badge-neutral' : isLow ? 'badge-amber' : 'badge-green'}`}
                          style={{
                            fontWeight: 700,
                            padding: '4px 10px',
                            background: isOut ? '#f43f5e' : undefined,
                            color: isOut ? '#fff' : undefined,
                          }}
                        >
                          {item.available_stock} đôi
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenAdjust(item, 'RESTOCK', 10)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '11px' }}
                            title="Nhập thêm 10 đôi nhanh"
                          >
                            + Nhập hàng
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(item, 'ADJUSTMENT', 1)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-primary)', fontSize: '11px' }}
                            title="Điều chỉnh kiểm kho"
                          >
                            <ArrowUpDown size={13} /> Chỉnh
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Inventory Logs Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Nhật Ký Biến Động Kho Gần Đây</h3>
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>THỜI GIAN</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>LOẠI BIẾN ĐỘNG</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>MÃ BIẾN THỂ (SKU)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>SỐ LƯỢNG</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>LÝ DO</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>NGƯỜI THỰC HIỆN</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 15).map((log) => (
                <tr key={log.log_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '12px' }}>
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>{log.change_type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{log.variant_id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: log.quantity_change > 0 ? 'var(--accent-emerald)' : '#f43f5e' }}>
                    {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{log.reason}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>{log.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedItem(null)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Điều Chỉnh Tồn Kho</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {selectedItem.product_name} • Size {selectedItem.size}
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Hành động / Loại thay đổi
                </label>
                <select
                  value={adjustType}
                  onChange={(e: any) => setAdjustType(e.target.value)}
                  className="input-field"
                >
                  <option value="RESTOCK">Nhập thêm hàng (RESTOCK)</option>
                  <option value="ADJUSTMENT">Kiểm kê / Điều chỉnh sai lệch (ADJUSTMENT)</option>
                  <option value="RETURN">Khách hoàn hàng trả về kho (RETURN)</option>
                  <option value="CANCEL">Hủy đơn trả hàng vào kho (CANCEL)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Số lượng thay đổi (dương là cộng thêm, âm là giảm bớt)
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="input-field"
                  style={{ fontWeight: 700, fontSize: '15px' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  Hiện tại: <strong>{selectedItem.stock}</strong> ➔ Sau khi lưu:{' '}
                  <strong>{selectedItem.stock + Number(adjustDelta)}</strong>
                </span>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Lý do điều chỉnh kho (bắt buộc) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Lô hàng xưởng gửi thêm 10 đôi, hoặc kiểm kho phát hiện rách đế..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedItem(null)} className="btn btn-secondary btn-sm">
                  Hủy
                </button>
                <button type="submit" disabled={adjusting} className="btn btn-accent btn-sm">
                  {adjusting ? 'Đang lưu...' : 'Xác nhận điều chỉnh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
