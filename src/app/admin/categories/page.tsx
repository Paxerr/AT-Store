'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Loader2,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import { Category } from '@/types/product';
import { formatImageUrl } from '@/lib/imageHelper';

interface CategoryWithStats extends Category {
  product_count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);

  // Upload state inside modal
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error(e);
      showNotification('error', 'Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && (json.data?.url || json.data?.files?.[0]?.url)) {
        setImage(json.data.url || json.data.files[0].url);
      } else {
        setFormError(json.error || 'Lỗi khi tải ảnh danh mục lên');
      }
    } catch (err: any) {
      setFormError(err.message || 'Lỗi kết nối khi tải ảnh');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setSortOrder(categories.length + 1);
    setActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryWithStats) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSortOrder(cat.sort_order || 1);
    setActive(cat.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên danh mục');
      return;
    }
    if (!slug.trim()) {
      setFormError('Vui lòng nhập đường dẫn slug');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image: image.trim(),
        sort_order: Number(sortOrder),
        active,
      };

      const url = editingCategory ? `/api/categories/${editingCategory.category_id}` : '/api/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setIsModalOpen(false);
        showNotification('success', editingCategory ? 'Đã cập nhật danh mục!' : 'Đã tạo danh mục mới!');
        fetchCategories();
      } else {
        setFormError(json.error || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      setFormError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: CategoryWithStats) => {
    const nextActive = !cat.active;
    try {
      const res = await fetch(`/api/categories/${cat.category_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) =>
          prev.map((c) => (c.category_id === cat.category_id ? { ...c, active: nextActive } : c))
        );
        showNotification('success', `Đã ${nextActive ? 'hiển thị' : 'ẩn'} danh mục "${cat.name}"`);
      } else {
        showNotification('error', json.error || 'Lỗi cập nhật');
      }
    } catch (err) {
      showNotification('error', 'Lỗi kết nối máy chủ');
    }
  };

  const handleDelete = async (cat: CategoryWithStats) => {
    if (cat.product_count > 0) {
      alert(
        `Không thể xóa danh mục "${cat.name}" vì đang có ${cat.product_count} sản phẩm thuộc danh mục này!\nVui lòng chuyển các sản phẩm sang danh mục khác trước.`
      );
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${cat.category_id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) => prev.filter((c) => c.category_id !== cat.category_id));
        showNotification('success', `Đã xóa danh mục "${cat.name}" thành công`);
      } else {
        alert(json.error || 'Lỗi khi xóa danh mục');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const filtered = categories.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.active) ||
      (statusFilter === 'INACTIVE' && !c.active);

    return matchesSearch && matchesStatus;
  });

  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);
  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = categories.filter((c) => !c.active).length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
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
            Quản Lý Danh Mục Sản Phẩm ({categories.length})
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Tổ chức, phân loại giày sneaker, trang phục, phụ kiện và điều chỉnh thứ tự hiển thị trên trang chủ.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-accent btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={16} /> Thêm danh mục mới
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: notification.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
            color: notification.type === 'success' ? 'var(--accent-emerald)' : '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
          }}
          className="animate-fade-in"
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Tổng danh mục
            </span>
            <FolderTree size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{categories.length}</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Đang hoạt động
            </span>
            <Eye size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {activeCount} danh mục
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Đang ẩn
            </span>
            <EyeOff size={18} color="var(--text-dim)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dim)' }}>
            {inactiveCount} danh mục
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Sản phẩm đã gán
            </span>
            <Package size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>
            {totalProducts} sản phẩm
          </div>
        </div>
      </div>

      {/* Toolbar Search & Status Filter */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên danh mục, slug, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '12px' }}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ẩn'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải danh sách danh mục...
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
                <th style={{ padding: '14px 16px', fontWeight: 700, width: '70px' }}>HÌNH ẢNH</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>TÊN DANH MỤC & SLUG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>MÔ TẢ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>SẢN PHẨM</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>THỨ TỰ</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>TRẠNG THÁI</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Không tìm thấy danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const imgUrl = formatImageUrl(cat.image);
                  return (
                    <tr
                      key={cat.category_id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      {/* Image Thumbnail */}
                      <td style={{ padding: '12px 16px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#0b0d11',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {imgUrl ? (
                            <img src={imgUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <FolderTree size={20} color="var(--text-dim)" />
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>
                          {cat.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span>/{cat.slug}</span>
                          <span style={{ opacity: 0.5 }}>•</span>
                          <span style={{ opacity: 0.7 }}>ID: {cat.category_id}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', maxWidth: '320px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cat.description || '—'}
                        </div>
                      </td>

                      {/* Product Count Badge */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <Link
                          href={`/admin/products?category=${cat.category_id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: cat.product_count > 0 ? 'rgba(255, 70, 46, 0.1)' : 'var(--bg-main)',
                            color: cat.product_count > 0 ? 'var(--accent-primary)' : 'var(--text-dim)',
                            border: '1px solid var(--border-subtle)',
                          }}
                          title={`Xem ${cat.product_count} sản phẩm trong danh mục này`}
                        >
                          <Package size={12} />
                          {cat.product_count} sản phẩm
                        </Link>
                      </td>

                      {/* Sort Order */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700 }}>
                        <span style={{ background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                          {cat.sort_order || 0}
                        </span>
                      </td>

                      {/* Active Status Toggle */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          title={cat.active ? 'Bấm để tạm ẩn danh mục này' : 'Bấm để hiển thị danh mục này'}
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: cat.active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                            color: cat.active ? 'var(--accent-emerald)' : 'var(--text-dim)',
                            border: cat.active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {cat.active ? <Eye size={12} /> : <EyeOff size={12} />}
                          {cat.active ? 'Hoạt động' : 'Tạm ẩn'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/products?category=${cat.category_id}`}
                            target="_blank"
                            className="btn btn-secondary btn-sm"
                            title="Xem trên cửa hàng"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-primary)' }}
                            title="Sửa danh mục"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#f43f5e' }}
                            title="Xóa danh mục"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '26px',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                  {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {editingCategory ? `Mã: ${editingCategory.category_id}` : 'Tạo danh mục mới để phân loại sản phẩm'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#f43f5e',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giày Chạy Bộ, Áo Khoác Gió..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Đường dẫn tĩnh (Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="vi-du: giay-chay-bo"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Image Upload Box */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Hình ảnh đại diện danh mục
                </label>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#0b0d11',
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {image ? (
                      <img src={formatImageUrl(image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <FolderTree size={24} color="var(--text-dim)" />
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: uploadingImage ? 'wait' : 'pointer',
                        width: 'fit-content',
                      }}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Đang tải ảnh lên...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={14} /> Tải ảnh từ máy tính
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Hoặc dán URL ảnh trực tiếp..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Mô tả ngắn
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả danh mục hiển thị cho khách hàng và công cụ tìm kiếm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div style={{ paddingTop: '22px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600 }}>Kích hoạt hiển thị</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="btn btn-accent btn-sm">
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Đang lưu...
                    </>
                  ) : editingCategory ? (
                    'Lưu thay đổi'
                  ) : (
                    'Tạo danh mục'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
