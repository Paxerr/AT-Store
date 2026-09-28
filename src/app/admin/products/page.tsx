'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, PlusCircle, Search, Trash2, Edit, ExternalLink, X, Save, Star } from 'lucide-react';
import { Product } from '@/types/product';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Quick edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editIsNew, setEditIsNew] = useState(false);
  const [editIsSale, setEditIsSale] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (prod: Product) => {
    const newFeatured = !prod.featured;
    try {
      const res = await fetch(`/api/products/${prod.slug || prod.product_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.product_id === prod.product_id ? { ...p, featured: newFeatured } : p))
        );
      } else {
        alert(json.error || 'Lỗi cập nhật');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const startEdit = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditStatus((prod.status as any) || 'ACTIVE');
    setEditFeatured(!!prod.featured);
    setEditIsNew(!!prod.is_new);
    setEditIsSale(!!prod.is_sale);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          status: editStatus,
          featured: editFeatured,
          is_new: editIsNew,
          is_sale: editIsSale,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert(json.error || 'Lỗi khi cập nhật sản phẩm');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.product_id !== id));
      } else {
        alert(json.error || 'Lỗi khi xóa sản phẩm');
      }
    } catch (e) {
      alert('Lỗi hệ thống');
    }
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.brand_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
            Quản Lý Sản Phẩm ({filtered.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Danh sách giày sneaker, phụ kiện và trang phục đang kinh doanh.
          </p>
        </div>

        <Link href="/admin/products/new" className="btn btn-accent btn-sm">
          <PlusCircle size={16} /> Thêm sản phẩm mới
        </Link>
      </div>

      {/* Search Toolbar */}
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
            placeholder="Tìm theo tên sản phẩm, thương hiệu, danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải danh sách sản phẩm...
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
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>HÌNH ẢNH & TÊN</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>DANH MỤC</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>GIÁ BÁN</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>BIẾN THỂ & KHO</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>TIÊU BIỂU (BANNER)</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TRẠNG THÁI</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prod) => {
                const totalStock = (prod.variants || []).reduce((sum, v) => sum + v.stock, 0);
                const thumb = prod.media?.find((m) => m.type === 'IMAGE')?.url || prod.variants?.[0]?.image;

                return (
                  <tr
                    key={prod.product_id}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', background: '#0b0d11', flexShrink: 0 }}>
                        {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{prod.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{prod.brand_name || 'Sneaker'} • /{prod.slug}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {prod.category_name || prod.category_id}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {(prod.min_price || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div>{prod.variants?.length || 0} biến thể</div>
                      <div style={{ fontSize: '11px', color: totalStock <= 3 ? '#f59e0b' : 'var(--text-dim)' }}>
                        Tổng tồn: <strong>{totalStock} đôi</strong>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(prod)}
                        title={prod.featured ? 'Bấm để gỡ khỏi Banner tiêu biểu' : 'Bấm để ghim lên Banner tiêu biểu'}
                        style={{
                          background: prod.featured ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-main)',
                          color: prod.featured ? '#f59e0b' : 'var(--text-dim)',
                          border: prod.featured ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Star size={13} fill={prod.featured ? '#f59e0b' : 'none'} color={prod.featured ? '#f59e0b' : 'var(--text-dim)'} />
                        {prod.featured ? 'Tiêu biểu' : 'Thường'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={prod.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-neutral'} style={{ fontSize: '10px' }}>
                        {prod.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link href={`/products/${prod.slug}`} target="_blank" className="btn btn-secondary btn-sm" title="Xem trên web">
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => startEdit(prod)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--accent-primary)' }}
                          title="Sửa nhanh sản phẩm"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.product_id, prod.name)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#f43f5e' }}
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingProduct && (
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
          onClick={() => setEditingProduct(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
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
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Chỉnh Sửa Nhanh Sản Phẩm</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Mã: {editingProduct.product_id} • /{editingProduct.slug}</div>
              </div>
              <button onClick={() => setEditingProduct(null)} className="btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Trạng thái kinh doanh</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="ACTIVE">Kinh doanh (ACTIVE)</option>
                  <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '4px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', background: 'rgba(255, 70, 46, 0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255, 70, 46, 0.25)' }}>
                  <input type="checkbox" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)} />
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} fill={editFeatured ? 'var(--accent-primary)' : 'none'} />
                    ⭐ Tiêu biểu (Banner)
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editIsNew} onChange={(e) => setEditIsNew(e.target.checked)} />
                  Mới về (New)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editIsSale} onChange={(e) => setEditIsSale(e.target.checked)} />
                  Sale giảm giá 🔥
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-secondary btn-sm">Hủy</button>
                <button type="submit" disabled={savingEdit} className="btn btn-accent btn-sm">
                  {savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
