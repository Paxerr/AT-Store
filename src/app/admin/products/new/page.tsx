'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, Sparkles, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatImageUrl, isGoogleDriveUrl } from '@/lib/imageHelper';

export default function NewProductPage() {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('cat_sneaker');
  const [brandId, setBrandId] = useState('brand_nike');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');

  // Badges & Status
  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isSale, setIsSale] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Media
  const [primaryImage, setPrimaryImage] = useState('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setPrimaryImage(json.data.url);
      } else {
        setUploadError(json.error || 'Lỗi khi tải ảnh lên');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi kết nối khi tải ảnh');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Variants list
  const [variants, setVariants] = useState([
    { size: '39', sku: 'ATS-PROD-39', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 5 },
    { size: '40', sku: 'ATS-PROD-40', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 8 },
    { size: '41', sku: 'ATS-PROD-41', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 10 },
    { size: '42', sku: 'ATS-PROD-42', barcode: '', price: 2500000, compare_at_price: 2800000, cost_price: 1800000, stock: 6 },
  ]);

  const [saving, setSaving] = useState(false);

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

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: '43',
        sku: `ATS-PROD-${Date.now().toString().slice(-4)}`,
        barcode: '',
        price: variants[0]?.price || 2000000,
        compare_at_price: 0,
        cost_price: variants[0]?.cost_price || 1400000,
        stock: 5,
      },
    ]);
  };

  const removeVariantRow = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: string, val: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert('Vui lòng nhập tên và slug sản phẩm');
      return;
    }

    setSaving(true);
    try {
      const mediaList: Array<{
        type: 'IMAGE' | 'VIDEO' | 'MODEL_3D';
        url: string;
        thumbnail: string;
        alt: string;
        is_primary: boolean;
        sort_order: number;
      }> = [
        {
          type: 'IMAGE',
          url: primaryImage,
          thumbnail: primaryImage,
          alt: name,
          is_primary: true,
          sort_order: 1,
        },
      ];

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        brand_id: brandId,
        short_description: shortDesc,
        description: description,
        status: status,
        featured: featured,
        is_new: isNew,
        is_sale: isSale,
        has_3d_model: false,
        seo_title: `${name} | Anh Thư Sneaker`,
        seo_description: shortDesc || description,
        variants: variants.map((v) => ({
          sku: v.sku,
          barcode: v.barcode,
          size: v.size,
          color: 'Tiêu chuẩn',
          price: Number(v.price),
          compare_at_price: Number(v.compare_at_price),
          cost_price: Number(v.cost_price),
          stock: Number(v.stock),
          weight: 750,
          image: primaryImage,
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
        alert('Tạo sản phẩm thành công!');
        router.push('/admin/products');
      } else {
        alert(json.error || 'Lỗi tạo sản phẩm');
      }
    } catch (err) {
      alert('Lỗi kết nối khi tạo sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
      <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Thêm Sản Phẩm Mới</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nhập thông tin cơ bản, biến thể size, hình ảnh và cấu hình 3D.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Basic Info */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>1. Thông tin cơ bản</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nike Dunk Low Retro White Black"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Đường dẫn tĩnh (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Danh mục *</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
                    <option value="cat_sneaker">Sneaker</option>
                    <option value="cat_shoes">Giày da & Loafer</option>
                    <option value="cat_clothing">Quần áo</option>
                    <option value="cat_accessories">Phụ kiện</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Thương hiệu</label>
                  <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="input-field">
                    <option value="brand_nike">Nike</option>
                    <option value="brand_adidas">Adidas</option>
                    <option value="brand_nb">New Balance</option>
                    <option value="brand_converse">Converse</option>
                    <option value="brand_anhthu">Anh Thư Collection</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Trạng thái kinh doanh</label>
                  <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="input-field">
                    <option value="ACTIVE">Kinh doanh (ACTIVE)</option>
                    <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Mô tả ngắn</label>
                <input
                  type="text"
                  placeholder="Tóm tắt ngắn gọn chất liệu và điểm nhấn sản phẩm..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Mô tả chi tiết</label>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', background: 'rgba(255, 70, 46, 0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255, 70, 46, 0.25)' }}>
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>⭐ Sản phẩm tiêu biểu (Hiển thị trên Banner Tiêu Biểu)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                  Hàng mới về (New Arrival)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} />
                  Đang giảm giá (Sale)
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Media */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={18} color="var(--accent-primary)" />
              2. Hình ảnh sản phẩm (Tải lên Cloud & Tự động lưu Google Sheets)
            </h3>

            {/* Direct Upload Box */}
            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                textAlign: 'center',
                background: 'var(--bg-main)',
                marginBottom: '20px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255, 70, 46, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                </div>

                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    {uploadingImage ? 'Đang tải ảnh từ máy tính lên Cloud...' : 'Tải ảnh trực tiếp 1-Click từ máy tính'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Hỗ trợ JPG, PNG, WebP. Ảnh sẽ tự động tối ưu hóa tốc độ cao và lưu link vào Google Sheets.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    marginTop: '6px',
                  }}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang tải lên Cloud...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} /> Chọn ảnh từ máy tính
                    </>
                  )}
                </button>

                {uploadError && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '6px 12px', borderRadius: '6px' }}>
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            {/* Manual Link Input & Live Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'flex-start' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Link Ảnh Sản Phẩm (Tự động điền sau khi tải, hoặc dán link ảnh tùy ý)
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://res.cloudinary.com/... hoặc link ảnh bất kỳ"
                  value={primaryImage}
                  onChange={(e) => {
                    const formatted = formatImageUrl(e.target.value);
                    setPrimaryImage(formatted);
                  }}
                  className="input-field"
                />

                {primaryImage.includes('cloudinary.com') && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    ✓ Đã lưu trữ trên Cloudinary CDN tốc độ cao!
                  </div>
                )}

                {isGoogleDriveUrl(primaryImage) && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    ✓ Đã nhận diện và chuyển đổi link Google Drive sang CDN trực tiếp!
                  </div>
                )}

                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Link ảnh này sẽ được lưu trực tiếp vào cột <strong>image_url</strong> trên file Google Sheet <strong>AT Store</strong>.
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Xem trước</label>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-main)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {primaryImage ? (
                    <img
                      src={formatImageUrl(primaryImage)}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Chưa có ảnh</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Variants & Stock */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>3. Danh sách Biến thể (Kích cỡ & Tồn kho)</h3>
              <button type="button" onClick={addVariantRow} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Thêm size
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '8px' }}>SIZE</th>
                    <th style={{ padding: '8px' }}>SKU</th>
                    <th style={{ padding: '8px' }}>GIÁ BÁN (VND)</th>
                    <th style={{ padding: '8px' }}>GIÁ GỐC (VND)</th>
                    <th style={{ padding: '8px' }}>GIÁ VỐN (COGS)</th>
                    <th style={{ padding: '8px' }}>TỒN KHO</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>XÓA</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                          className="input-field"
                          style={{ width: '70px', padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          className="input-field"
                          style={{ width: '140px', padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                          className="input-field"
                          style={{ width: '120px', padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={v.compare_at_price}
                          onChange={(e) => updateVariant(idx, 'compare_at_price', e.target.value)}
                          className="input-field"
                          style={{ width: '120px', padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={v.cost_price}
                          onChange={(e) => updateVariant(idx, 'cost_price', e.target.value)}
                          className="input-field"
                          style={{ width: '120px', padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                          className="input-field"
                          style={{ width: '80px', padding: '6px 8px' }}
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          disabled={variants.length <= 1}
                          style={{ color: '#f43f5e', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link href="/admin/products" className="btn btn-secondary btn-lg">Hủy</Link>
            <button type="submit" disabled={saving} className="btn btn-accent btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} />
              {saving ? 'Đang lưu sản phẩm...' : 'Lưu Sản Phẩm'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
