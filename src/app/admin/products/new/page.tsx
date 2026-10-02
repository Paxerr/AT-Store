'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MultiImageUploader, ImageItem } from '@/components/admin/MultiImageUploader';
import { VariantManager } from '@/components/admin/VariantManager';
import { Category, Brand, ProductOption } from '@/types/product';

export default function NewProductPage() {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('cat_sneaker');
  const [brandId, setBrandId] = useState('brand_nike');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');

  // Categories & Brands dynamic list
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Badges & Status
  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Media Gallery (Multi-image)
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: 'initial_img_1',
      url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      alt: 'Anh Thu Sneaker',
      is_primary: true,
      sort_order: 1,
    },
  ]);

  // Options & Variants list
  const [options, setOptions] = useState<ProductOption[]>([
    { name: 'Màu sắc', values: ['Trắng', 'Đen'] },
    { name: 'Kích cỡ', values: ['39', '40', '41', '42'] },
  ]);

  const [variants, setVariants] = useState<any[]>([
    { size: '39', color: 'Trắng', sku: 'ATS-PROD-TRANG-39', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 5, image: '' },
    { size: '40', color: 'Trắng', sku: 'ATS-PROD-TRANG-40', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 8, image: '' },
    { size: '41', color: 'Trắng', sku: 'ATS-PROD-TRANG-41', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 10, image: '' },
    { size: '42', color: 'Trắng', sku: 'ATS-PROD-TRANG-42', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 6, image: '' },
    { size: '39', color: 'Đen', sku: 'ATS-PROD-DEN-39', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 4, image: '' },
    { size: '40', color: 'Đen', sku: 'ATS-PROD-DEN-40', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 7, image: '' },
    { size: '41', color: 'Đen', sku: 'ATS-PROD-DEN-41', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 9, image: '' },
    { size: '42', color: 'Đen', sku: 'ATS-PROD-DEN-42', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 5, image: '' },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load dynamic categories & brands
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories?all=true'),
          fetch('/api/products'),
        ]);

        const catJson = await catRes.json();
        if (catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data);
          if (catJson.data.length > 0) {
            setCategoryId(catJson.data[0].category_id);
          }
        }

        const prodJson = await prodRes.json();
        if (prodJson.success && Array.isArray(prodJson.data?.brands)) {
          setBrands(prodJson.data.brands);
          if (prodJson.data.brands.length > 0) {
            setBrandId(prodJson.data.brands[0].brand_id);
          }
        }
      } catch (err) {
        console.error('Error fetching initial categories/brands:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Vui lòng nhập tên và slug sản phẩm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (images.length === 0) {
      setErrorMsg('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      // Find primary image or use first one
      const primaryImg = images.find((m) => m.is_primary)?.url || images[0]?.url || '';

      const mediaList = images.map((m, idx) => ({
        type: 'IMAGE' as const,
        url: m.url,
        thumbnail: m.url,
        alt: m.alt?.trim() || `${name} - Hình ${idx + 1}`,
        is_primary: m.is_primary,
        sort_order: m.sort_order || idx + 1,
      }));

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        brand_id: brandId,
        short_description: shortDesc.trim(),
        description: description.trim(),
        status: status,
        featured: featured,
        is_new: isNew,
        is_sale: isSale,
        has_3d_model: false,
        seo_title: `${name.trim()} | Anh Thư Sneaker`,
        options: options,
        variants: variants.map((v) => ({
          sku: v.sku.trim(),
          barcode: (v.barcode || '').trim(),
          size: (v.size || 'Tiêu chuẩn').trim(),
          color: (v.color || 'Tiêu chuẩn').trim(),
          price: Number(v.price) || 0,
          compare_at_price: Number(v.compare_at_price) || 0,
          cost_price: Number(v.cost_price) || 0,
          stock: Number(v.stock) || 0,
          weight: 750,
          image: v.image || primaryImg,
          options: v.options,
        })),
        media: mediaList,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        alert('Tạo sản phẩm và lưu thư viện ảnh thành công!');
        router.push('/admin/products');
      } else {
        setErrorMsg(json.error || 'Lỗi tạo sản phẩm');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối khi tạo sản phẩm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '60px' }}>
      <Link
        href="/admin/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>Thêm Sản Phẩm Mới</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Nhập thông tin sản phẩm, tải cùng lúc nhiều ảnh sắc nét và thiết lập biến thể kích cỡ tồn kho.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            marginBottom: '24px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
          }}
          className="animate-fade-in"
        >
          <AlertCircle size={20} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Basic Info */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>1. Thông tin cơ bản</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nike Air Jordan 1 Low Black White"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Đường dẫn tĩnh (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Danh mục *</label>
                    <Link
                      href="/admin/categories"
                      target="_blank"
                      style={{ fontSize: '11px', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                    >
                      + Quản lý danh mục
                    </Link>
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-field"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.name} {!c.active ? '(Tạm ẩn)' : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="cat_sneaker">Sneaker</option>
                        <option value="cat_shoes">Giày da & Loafer</option>
                        <option value="cat_clothing">Quần áo</option>
                        <option value="cat_accessories">Phụ kiện</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Thương hiệu
                  </label>
                  <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="input-field">
                    {brands.length > 0 ? (
                      brands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>
                          {b.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="brand_nike">Nike</option>
                        <option value="brand_adidas">Adidas</option>
                        <option value="brand_nb">New Balance</option>
                        <option value="brand_converse">Converse</option>
                        <option value="brand_anhthu">Anh Thư Collection</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Trạng thái kinh doanh
                  </label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="input-field">
                    <option value="ACTIVE">Kinh doanh (ACTIVE)</option>
                    <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  placeholder="Tóm tắt ngắn gọn chất liệu và điểm nhấn sản phẩm..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={4}
                  placeholder="Mô tả kỹ thuật, form giày, độ ôm chân, xuất xứ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Badges toggles */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '8px', alignItems: 'center' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    background: 'rgba(255, 70, 46, 0.08)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 70, 46, 0.25)',
                  }}
                >
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    ⭐ Sản phẩm tiêu biểu (Hiển thị trên Banner Tiêu Biểu)
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                  Hàng mới về (New Arrival)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} />
                  Đang giảm giá (Sale 🔥)
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Image Upload & Gallery Manager */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ImageIcon size={18} color="var(--accent-primary)" />
                2. Hình ảnh sản phẩm (Tải lên cùng lúc nhiều ảnh & Thư viện ảnh)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Bạn có thể chọn cùng lúc nhiều ảnh từ máy tính hoặc kéo thả vào khung. Click nút &quot;Đặt làm chính&quot; để chọn ảnh đại diện.
              </p>
            </div>

            <MultiImageUploader images={images} onChange={setImages} />
          </div>

          {/* Section 3: Customizable Variants, Options & Matrix Generator */}
          <VariantManager
            variants={variants}
            onChange={setVariants}
            options={options}
            onOptionsChange={setOptions}
            productImages={images}
            productName={name}
          />

          {/* Submit Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link href="/admin/products" className="btn btn-secondary btn-lg">
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-accent btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', justifyContent: 'center' }}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Đang lưu sản phẩm...
                </>
              ) : (
                <>
                  <Save size={18} /> Lưu Sản Phẩm
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
