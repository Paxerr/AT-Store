'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { MultiImageUploader, ImageItem } from '@/components/admin/MultiImageUploader';
import { VariantManager } from '@/components/admin/VariantManager';
import { Product, ProductVariant, Category, Brand, ProductOption } from '@/types/product';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Basic Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');

  // Categories & Brands dynamic list
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Badges & Status
  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Media Gallery (Multi-image)
  const [images, setImages] = useState<ImageItem[]>([]);

  // Options & Variants list
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // Fetch product data and categories/brands
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const [prodRes, catRes, allProdRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/categories?all=true'),
          fetch('/api/products'),
        ]);

        const prodJson = await prodRes.json();
        if (!prodJson.success || !prodJson.data) {
          setErrorMsg(prodJson.error || 'Không tìm thấy sản phẩm');
          setLoading(false);
          return;
        }

        const prod: Product = prodJson.data;
        setName(prod.name || '');
        setSlug(prod.slug || '');
        setCategoryId(prod.category_id || '');
        setBrandId(prod.brand_id || '');
        setShortDesc(prod.short_description || '');
        setDescription(prod.description || '');
        setStatus((prod.status as any) || 'ACTIVE');
        setFeatured(Boolean(prod.featured));
        setIsNew(Boolean(prod.is_new));
        setIsSale(Boolean(prod.is_sale));

        // Load media
        if (prod.media && prod.media.length > 0) {
          const loadedImages: ImageItem[] = prod.media.map((m, idx) => ({
            id: m.media_id || `img_${idx}`,
            url: m.url,
            alt: m.alt || '',
            is_primary: Boolean(m.is_primary),
            sort_order: m.sort_order || idx + 1,
          }));
          setImages(loadedImages);
        } else if (prod.variants?.[0]?.image) {
          setImages([
            {
              id: 'primary_var_img',
              url: prod.variants[0].image,
              alt: prod.name,
              is_primary: true,
              sort_order: 1,
            },
          ]);
        }

        // Load variants
        if (prod.variants && prod.variants.length > 0) {
          setVariants(prod.variants);
        }

        // Load or reconstruct options
        if (prod.options && prod.options.length > 0) {
          setOptions(prod.options);
        } else if (prod.variants && prod.variants.length > 0) {
          const reconstructed: ProductOption[] = [];
          const colors = Array.from(new Set(prod.variants.map((v) => v.color || 'Tiêu chuẩn'))).filter(
            (c) => c && c !== 'Tiêu chuẩn'
          );
          const sizes = Array.from(new Set(prod.variants.map((v) => v.size || 'Tiêu chuẩn'))).filter(
            (s) => s && s !== 'Tiêu chuẩn'
          );
          if (colors.length > 0) {
            reconstructed.push({ name: 'Màu sắc', values: colors });
          }
          if (sizes.length > 0) {
            reconstructed.push({ name: 'Kích cỡ', values: sizes });
          }
          setOptions(reconstructed);
        }

        // Categories
        const catJson = await catRes.json();
        if (catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data);
        }

        // Brands
        const allProdJson = await allProdRes.json();
        if (allProdJson.success && Array.isArray(allProdJson.data?.brands)) {
          setBrands(allProdJson.data.brands);
        }
      } catch (err: any) {
        setErrorMsg('Lỗi kết nối khi tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Vui lòng nhập tên và slug sản phẩm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (images.length === 0) {
      setErrorMsg('Vui lòng thêm ít nhất 1 hình ảnh sản phẩm');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const primaryImg = images.find((m) => m.is_primary)?.url || images[0]?.url || '';

      const mediaList = images.map((m, idx) => ({
        media_id: m.id?.startsWith('med_') ? m.id : `med_${idx + 1}`,
        product_id: '',
        type: 'IMAGE' as const,
        url: m.url,
        thumbnail: m.url,
        alt: m.alt?.trim() || `${name} - Hình ${idx + 1}`,
        is_primary: m.is_primary,
        sort_order: m.sort_order || idx + 1,
      }));

      // Sanitize options: filter out any empty options
      const cleanOptions = options
        .filter((o) => o && o.name && o.name.trim() && Array.isArray(o.values) && o.values.length > 0)
        .map((o) => ({
          id: o.id,
          name: o.name.trim(),
          values: o.values.map((val) => String(val).trim()).filter(Boolean),
        }));

      // Ensure unique, valid SKUs and sanitized numbers
      const usedSkus = new Set<string>();
      const baseCode = (name.trim() ? name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) : 'PROD') || 'PROD';
      
      const cleanVariants = variants.map((v, idx) => {
        let sku = String(v.sku || '').trim();
        if (!sku) {
          sku = `ATS-${baseCode}-${idx + 1}`;
        }
        if (usedSkus.has(sku)) {
          sku = `${sku}-${idx + 1}`;
        }
        usedSkus.add(sku);

        return {
          ...v,
          sku,
          barcode: String(v.barcode || '').trim(),
          size: String(v.size || 'Tiêu chuẩn').trim() || 'Tiêu chuẩn',
          color: String(v.color || 'Tiêu chuẩn').trim() || 'Tiêu chuẩn',
          price: Math.max(0, Number(v.price) || 0),
          compare_at_price: Math.max(0, Number(v.compare_at_price) || 0),
          cost_price: Math.max(0, Number(v.cost_price) || 0),
          stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
          weight: Number(v.weight) || 750,
          image: v.image || primaryImg,
          options: v.options || {},
        };
      });

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
        seo_title: `${name.trim()} | Anh Thư Sneaker`,
        seo_description: shortDesc.trim() || description.trim(),
        options: cleanOptions,
        variants: cleanVariants,
        media: mediaList,
      };

      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Đã lưu mọi thay đổi của sản phẩm và hình ảnh thành công!');
        setTimeout(() => {
          router.push('/admin/products');
        }, 1200);
      } else {
        let msg = json.error;
        try {
          const parsed = JSON.parse(json.error);
          if (Array.isArray(parsed)) {
            msg = parsed.map((e: any) => `${e.path?.join('.')}: ${e.message}`).join(', ');
          }
        } catch (e) {}
        setErrorMsg(msg || 'Lỗi khi cập nhật sản phẩm');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối khi cập nhật sản phẩm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
        <Loader2 size={36} className="animate-spin" color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Đang tải thông tin sản phẩm và thư viện ảnh...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
        </Link>

        {slug && (
          <Link
            href={`/products/${slug}`}
            target="_blank"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={14} /> Xem trên cửa hàng
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
            Chỉnh Sửa Sản Phẩm: {name}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Quản lý thư viện hình ảnh, danh mục, giá bán và tồn kho biến thể.
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

      {successMsg && (
        <div
          style={{
            marginBottom: '24px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
          }}
          className="animate-fade-in"
        >
          <CheckCircle2 size={20} />
          {successMsg}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Danh mục *
                  </label>
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
                  placeholder="Tóm tắt ngắn gọn chất liệu và điểm nhấn..."
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
                  placeholder="Mô tả kỹ thuật, form giày..."
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
                2. Quản lý Thư viện Hình ảnh ({images.length} ảnh)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Tải thêm nhiều ảnh mới, đổi thứ tự hiển thị, xóa bớt ảnh cũ hoặc chọn ảnh đại diện chính (Primary).
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

          {/* Action Bar */}
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
                  <Loader2 size={18} className="animate-spin" /> Đang cập nhật...
                </>
              ) : (
                <>
                  <Save size={18} /> Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
