'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  X,
  Save,
  Star,
  Image as ImageIcon,
  FolderTree,
  AlertTriangle,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Category } from '@/types/product';
import { formatImageUrl } from '@/lib/imageHelper';

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchParams.get('category') !== null) {
      setSelectedCategory(searchParams.get('category') || '');
    }
  }, [searchParams]);

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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?all=true');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error(e);
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

  const startQuickEdit = (prod: Product) => {
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
      const res = await fetch(`/api/products/${editingProduct.slug || editingProduct.product_id}`, {
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

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.brand_name?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      p.category_id === selectedCategory ||
      p.category_name?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && p.status === 'ACTIVE') ||
      (selectedStatus === 'INACTIVE' && p.status === 'INACTIVE');

    const totalStock = (p.variants || []).reduce((sum, v) => sum + v.stock, 0);
    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'IN_STOCK' && totalStock > 3) ||
      (stockFilter === 'LOW_STOCK' && totalStock > 0 && totalStock <= 3) ||
      (stockFilter === 'OUT_OF_STOCK' && totalStock === 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const totalStockAll = products.reduce(
    (sum, p) => sum + (p.variants || []).reduce((vSum, v) => vSum + v.stock, 0),
    0
  );
  const featuredCount = products.filter((p) => p.featured).length;
  const lowStockCount = products.filter(
    (p) => (p.variants || []).reduce((sum, v) => sum + v.stock, 0) <= 3
  ).length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
            Quản Lý Sản Phẩm ({filtered.length}/{products.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Quản lý giày sneaker, phụ kiện, tải nhiều ảnh, chỉnh sửa biến thể và đồng bộ kho hàng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/admin/categories"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FolderTree size={16} /> Quản lý danh mục
          </Link>
          <Link
            href="/admin/products/new"
            className="btn btn-accent btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={16} /> Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Tổng sản phẩm
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800 }}>{products.length} mẫu</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Tổng tồn kho
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)' }}>{totalStockAll} đôi</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Sản phẩm tiêu biểu
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>{featuredCount} mẫu</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Cảnh báo tồn kho thấp (≤3)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: lowStockCount > 0 ? '#f43f5e' : 'var(--accent-emerald)' }}>
            {lowStockCount} mẫu
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
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
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, thương hiệu, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field"
          style={{ width: '180px' }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e: any) => setSelectedStatus(e.target.value)}
          className="input-field"
          style={{ width: '150px' }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Kinh doanh (ACTIVE)</option>
          <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e: any) => setStockFilter(e.target.value)}
          className="input-field"
          style={{ width: '160px' }}
        >
          <option value="ALL">Tất cả tồn kho</option>
          <option value="IN_STOCK">Còn nhiều (&gt;3)</option>
          <option value="LOW_STOCK">Sắp hết hàng (≤3)</option>
          <option value="OUT_OF_STOCK">Hết hàng (=0)</option>
        </select>

        {(search || selectedCategory || selectedStatus !== 'ALL' || stockFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedStatus('ALL');
              setStockFilter('ALL');
            }}
            className="btn btn-secondary btn-sm"
          >
            Đặt lại lọc
          </button>
        )}
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
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>TIÊU BIỂU</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>TRẠNG THÁI</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>THAO TÁC</th>
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
                filtered.map((prod) => {
                  const totalStock = (prod.variants || []).reduce((sum, v) => sum + v.stock, 0);
                  const primaryMedia = prod.media?.find((m) => m.is_primary) || prod.media?.find((m) => m.type === 'IMAGE');
                  const thumb = primaryMedia?.url || prod.variants?.[0]?.image;
                  const mediaCount = prod.media?.length || 1;

                  return (
                    <tr
                      key={prod.product_id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#0b0d11',
                            flexShrink: 0,
                            position: 'relative',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {thumb ? (
                            <img
                              src={formatImageUrl(thumb)}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={20} color="var(--text-dim)" />
                            </div>
                          )}
                          {mediaCount > 1 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                background: 'rgba(0,0,0,0.75)',
                                color: '#fff',
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '1px 3px',
                                borderRadius: '3px',
                              }}
                            >
                              +{mediaCount - 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                            <Link
                              href={`/admin/products/${prod.slug || prod.product_id}`}
                              style={{ color: 'inherit', textDecoration: 'none' }}
                              className="hover-underline"
                            >
                              {prod.name}
                            </Link>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span>{prod.brand_name || 'Sneaker'}</span>
                            <span>•</span>
                            <span>/{prod.slug}</span>
                            <span>•</span>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                              📷 {mediaCount} ảnh
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}>
                          {prod.category_name || prod.category_id}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '14px' }}>
                        {(prod.min_price || 0).toLocaleString('vi-VN')}đ
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div>{prod.variants?.length || 0} kích cỡ</div>
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
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Star size={12} fill={prod.featured ? '#f59e0b' : 'none'} color={prod.featured ? '#f59e0b' : 'var(--text-dim)'} />
                          {prod.featured ? 'Tiêu biểu' : 'Thường'}
                        </button>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span className={prod.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-neutral'} style={{ fontSize: '11px' }}>
                          {prod.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="btn btn-secondary btn-sm"
                            title="Xem trên cửa hàng"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* Full Edit (images, category, variants) */}
                          <Link
                            href={`/admin/products/${prod.slug || prod.product_id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
                            title="Sửa chi tiết & thư viện ảnh"
                          >
                            <Edit size={14} /> Sửa
                          </Link>

                          {/* Quick Edit */}
                          <button
                            type="button"
                            onClick={() => startQuickEdit(prod)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--text-muted)' }}
                            title="Sửa nhanh trạng thái"
                          >
                            <SlidersHorizontal size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
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
                })
              )}
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
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Mã: {editingProduct.product_id} • /{editingProduct.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="btn-secondary btn-sm"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Trạng thái kinh doanh
                </label>
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
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: 'rgba(255, 70, 46, 0.08)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 70, 46, 0.25)',
                  }}
                >
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  href={`/admin/products/${editingProduct.slug || editingProduct.product_id}`}
                  style={{ fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                >
                  Mở trang chỉnh sửa chi tiết (ảnh, giá, biến thể) ↗
                </Link>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-secondary btn-sm">
                    Hủy
                  </button>
                  <button type="submit" disabled={savingEdit} className="btn btn-accent btn-sm">
                    {savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Đang tải...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
