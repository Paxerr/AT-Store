'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Search, Plus, Minus, AlertTriangle, History, ArrowUpDown, X } from 'lucide-react';
import { Inventory, InventoryLog } from '@/types/inventory';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<InventoryLog['change_type']>('ADJUSTMENT');
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

  const filtered = inventory.filter(
    (item) =>
      !search ||
      item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.size?.includes(search)
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
          Quản Lý Kho Hàng & Tồn Kho ({filtered.length})
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Theo dõi tồn kho thực tế, tồn kho đang giữ (reserved) và thực hiện điều chỉnh kho kèm lý do.
        </p>
      </div>

      {/* Search Bar */}
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
            placeholder="Tìm theo tên sản phẩm, mã SKU, kích cỡ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
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
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>SIZE</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TỒN THỰC TẾ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>ĐANG GIỮ (RESERVED)</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>KHẢ DỤNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>ĐIỀU CHỈNH</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLow = item.available_stock <= item.low_stock_threshold;
                return (
                  <tr
                    key={item.inventory_id}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.product_name}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {item.sku}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-neutral">{item.size}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {item.stock} đôi
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-dim)' }}>
                      {item.reserved_stock} đôi
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={isLow ? 'badge badge-orange' : 'badge badge-green'}
                        style={{ fontSize: '12px', fontWeight: 800 }}
                      >
                        {item.available_stock} đôi
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustDelta(1);
                          setAdjustType('ADJUSTMENT');
                          setAdjustReason('');
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <ArrowUpDown size={14} /> Điều chỉnh
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inventory Logs Section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Lịch sử Biến Động Kho Gần Đây</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logs.slice(0, 10).map((log) => (
            <div
              key={log.log_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  <span className={log.quantity_change > 0 ? 'badge badge-green' : 'badge badge-rose'} style={{ marginRight: '8px' }}>
                    {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                  </span>
                  {log.change_type} • Lý do: {log.reason}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Trước: {log.before_stock} đôi → Sau: {log.after_stock} đôi • Thực hiện bởi: {log.user_id}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {new Date(log.created_at).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustment Modal */}
      {selectedItem && (
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
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
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
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Điều Chỉnh Tồn Kho</h3>
              <button onClick={() => setSelectedItem(null)} className="btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontWeight: 700 }}>{selectedItem.product_name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '2px' }}>
                Size: {selectedItem.size} • SKU: {selectedItem.sku} • Tồn hiện tại: <strong>{selectedItem.stock} đôi</strong>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Loại biến động</label>
                <select
                  value={adjustType}
                  onChange={(e: any) => setAdjustType(e.target.value)}
                  className="input-field"
                >
                  <option value="ADJUSTMENT">Kiểm kê / Điều chỉnh sai lệch (ADJUSTMENT)</option>
                  <option value="RESTOCK">Nhập thêm hàng vào kho (RESTOCK)</option>
                  <option value="RETURN">Khách trả hàng về kho (RETURN)</option>
                  <option value="SALE">Xuất bán thủ công (SALE)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Số lượng thay đổi (+ thêm / - giảm)
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="input-field"
                />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Tồn mới dự kiến: <strong>{Math.max(0, selectedItem.stock + Number(adjustDelta))} đôi</strong>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Lý do điều chỉnh (Bắt buộc) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm kho cuối tuần phát hiện dư 1 đôi"
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
