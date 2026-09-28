'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  Eye,
  Edit,
  DollarSign,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialPayment = searchParams.get('payment') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState(initialPayment);

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editShippingFee, setEditShippingFee] = useState(30000);
  const [editAddress, setEditAddress] = useState('');
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchParams.get('search') !== null) setSearch(searchParams.get('search') || '');
    if (searchParams.get('status') !== null) setStatusFilter(searchParams.get('status') || '');
    if (searchParams.get('payment') !== null) setPaymentFilter(searchParams.get('payment') || '');
  }, [searchParams]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus, note = '') => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          order_status: nextStatus,
          note,
          changed_by: 'Admin',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
        setActionMessage(json.message);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_PAYMENT',
          transaction_ref: `MB_${Date.now()}`,
          changed_by: 'Admin',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
        setActionMessage('Đã xác nhận thanh toán thành công!');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveOrderEdit = async (orderId: string) => {
    if (!editReason.trim()) {
      alert('Vui lòng nhập lý do chỉnh sửa đơn hàng (bắt buộc cho Activity Log)');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_ORDER',
          shipping_address: editAddress,
          shipping_fee: Number(editShippingFee),
          reason: editReason,
          changed_by: 'Admin',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
        setIsEditing(false);
        setActionMessage('Cập nhật thông tin đơn hàng thành công');
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.order_id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q);

    const matchStatus = !statusFilter || o.order_status === statusFilter;
    const matchPayment = !paymentFilter || o.payment_status === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
            Quản Lý Đơn Hàng ({filteredOrders.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Theo dõi, xác nhận chuyển khoản và điều phối giao hàng.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Họ tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px', fontSize: '13px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto', padding: '10px 14px', fontSize: '13px' }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý (PENDING)</option>
          <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
          <option value="PROCESSING">Đang đóng gói (PROCESSING)</option>
          <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
          <option value="DELIVERED">Đã giao thành công (DELIVERED)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto', padding: '10px 14px', fontSize: '13px' }}
        >
          <option value="">Thanh toán (Tất cả)</option>
          <option value="PAID">Đã thanh toán (PAID)</option>
          <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
          <option value="PENDING_VERIFICATION">Chờ kiểm tra (PENDING)</option>
        </select>

        {(search || statusFilter || paymentFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setPaymentFilter('');
            }}
            className="btn btn-secondary btn-sm"
            style={{ color: '#f43f5e' }}
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải dữ liệu đơn hàng...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Không có đơn hàng nào khớp với tìm kiếm.</p>
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
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>MÃ ĐƠN HÀNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>KHÁCH HÀNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>NGÀY ĐẶT</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TỔNG TIỀN</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>THANH TOÁN</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TRẠNG THÁI</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.order_id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {ord.order_id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{ord.customer_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{ord.customer_phone}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {new Date(ord.created_at).toLocaleDateString('vi-VN')} {new Date(ord.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {ord.total_amount.toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={ord.payment_status === 'PAID' ? 'badge badge-green' : 'badge badge-orange'} style={{ fontSize: '11px' }}>
                      {ord.payment_status === 'PAID' ? 'ĐÃ TRẢ' : 'CHỜ TIỀN'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={ord.order_status === 'DELIVERED' ? 'badge badge-green' : ord.order_status === 'CANCELLED' ? 'badge badge-rose' : 'badge badge-blue'} style={{ fontSize: '11px' }}>
                      {ord.order_status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setEditAddress(ord.shipping_address);
                        setEditShippingFee(ord.shipping_fee);
                        setIsEditing(false);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail & Action Modal */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Chi tiết đơn: {selectedOrder.order_id}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Kênh bán: {selectedOrder.sales_channel} • Ngày tạo: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {actionMessage && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '13px', marginBottom: '16px' }}>
                  {actionMessage}
                </div>
              )}

              {/* Status & Quick Actions Bar */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Trạng thái hiện tại: <span style={{ color: 'var(--text-main)' }}>{selectedOrder.order_status}</span> • Thanh toán: <span style={{ color: selectedOrder.payment_status === 'PAID' ? 'var(--accent-emerald)' : '#fb923c' }}>{selectedOrder.payment_status}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {selectedOrder.payment_status !== 'PAID' && (
                    <button
                      onClick={() => handleConfirmPayment(selectedOrder.order_id)}
                      disabled={actionLoading}
                      className="btn btn-accent btn-sm"
                    >
                      <CreditCard size={14} /> Xác nhận đã nhận tiền (PAID)
                    </button>
                  )}

                  {selectedOrder.order_status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.order_id, 'CONFIRMED', 'Shop đã duyệt đơn hàng')}
                      disabled={actionLoading}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle size={14} /> Duyệt đơn hàng (CONFIRMED)
                    </button>
                  )}

                  {selectedOrder.order_status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.order_id, 'PROCESSING', 'Chuyển sang đóng gói')}
                      disabled={actionLoading}
                      className="btn btn-primary btn-sm"
                    >
                      <Package size={14} /> Chuyển sang đóng gói
                    </button>
                  )}

                  {selectedOrder.order_status === 'PROCESSING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.order_id, 'SHIPPED', 'Đã giao bưu tá')}
                      disabled={actionLoading}
                      className="btn btn-primary btn-sm"
                    >
                      <Truck size={14} /> Đã gửi bưu tá (SHIPPED)
                    </button>
                  )}

                  {selectedOrder.order_status === 'SHIPPED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERED', 'Khách đã nhận kiện')}
                      disabled={actionLoading}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle size={14} /> Hoàn tất đơn (DELIVERED)
                    </button>
                  )}

                  {selectedOrder.order_status !== 'CANCELLED' && selectedOrder.order_status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.order_id, 'CANCELLED', 'Hủy theo yêu cầu')}
                      disabled={actionLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#f43f5e' }}
                    >
                      <XCircle size={14} /> Hủy đơn & Trả kho
                    </button>
                  )}
                </div>
              </div>

              {/* Customer and Delivery info */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Thông tin nhận hàng</h4>
                  <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary btn-sm" style={{ fontSize: '12px' }}>
                    <Edit size={12} /> {isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}
                  </button>
                </div>

                {isEditing ? (
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>Địa chỉ giao hàng</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>Phí vận chuyển (VND)</label>
                      <input
                        type="number"
                        value={editShippingFee}
                        onChange={(e) => setEditShippingFee(Number(e.target.value))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#fb923c' }}>Lý do sửa đổi (Bắt buộc lưu nhật ký)</label>
                      <input
                        type="text"
                        placeholder="VD: Khách gọi đổi địa chỉ giao về công ty"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <button onClick={() => handleSaveOrderEdit(selectedOrder.order_id)} className="btn btn-accent btn-sm">
                      Lưu thay đổi & Ghi nhật ký
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    <div>Người nhận: <strong>{selectedOrder.customer_name}</strong> • SĐT: <strong>{selectedOrder.customer_phone}</strong></div>
                    <div>Địa chỉ: {selectedOrder.shipping_address}, {selectedOrder.shipping_ward}, {selectedOrder.shipping_district}, {selectedOrder.shipping_city}</div>
                    {selectedOrder.notes && <div>Ghi chú khách: <em>{selectedOrder.notes}</em></div>}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Sản phẩm</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedOrder.items || []).map((item) => (
                    <div
                      key={item.item_id}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {item.variant_title} • SKU: {item.sku}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>{item.quantity} x {item.price.toLocaleString('vi-VN')}đ</div>
                        <strong style={{ color: 'var(--accent-primary)' }}>{item.total.toLocaleString('vi-VN')}đ</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Tạm tính:</span>
                  <span>{selectedOrder.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                    <span>Giảm giá ({selectedOrder.coupon_code}):</span>
                    <span>-{selectedOrder.discount_amount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Phí vận chuyển:</span>
                  <span>{selectedOrder.shipping_fee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', marginTop: '6px' }}>
                  <span>Tổng tiền:</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{selectedOrder.total_amount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* History Timeline */}
              {(selectedOrder.history || []).length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Lịch sử trạng thái</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedOrder.history?.map((h) => (
                      <div key={h.history_id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {h.from_status} → <strong>{h.to_status}</strong>: {h.note} ({h.changed_by})
                        </span>
                        <span style={{ color: 'var(--text-dim)' }}>{new Date(h.created_at).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="badge badge-neutral" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Đang tải dữ liệu đơn hàng...
          </div>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
