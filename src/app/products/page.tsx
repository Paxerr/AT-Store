'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Product, Category, Brand } from '@/types/product';
import { Filter, SlidersHorizontal, Search, X, Check } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filters
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSale = searchParams.get('is_sale') === 'true';
  const currentSize = searchParams.get('size') || '';

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = searchParams.toString();
      const res = await fetch(`/api/products?${query}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
        setCategories(json.data.categories);
        setBrands(json.data.brands);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  const allSizes = ['38', '39', '40', '41', '42', '43', 'M', 'L', 'XL'];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
            Danh Sách Sản Phẩm
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Tìm kiếm và lựa chọn các mẫu sneaker, giày da, trang phục và phụ kiện cao cấp.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '28px',
          }}
        >
          {/* Quick Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Category Dropdown */}
            <select
              value={currentCategory}
              onChange={(e) => updateFilter('category', e.target.value || null)}
              className="input-field"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Brand Dropdown */}
            <select
              value={currentBrand}
              onChange={(e) => updateFilter('brand', e.target.value || null)}
              className="input-field"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Sale Filter Toggle */}
            <button
              onClick={() => updateFilter('is_sale', currentSale ? null : 'true')}
              className={currentSale ? 'btn-accent btn-sm' : 'btn-secondary btn-sm'}
            >
              Giảm giá 🔥
            </button>

            {/* Clear Filters */}
            {(currentCategory || currentBrand || currentSearch || currentSale || currentSize) && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary btn-sm"
                style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              >
                <X size={14} /> Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name-asc">Tên: A đến Z</option>
              <option value="featured">Nổi bật nhất</option>
            </select>
          </div>
        </div>

        {/* Sizes Quick Selection Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>Size:</span>
          {allSizes.map((s) => {
            const active = currentSize === s;
            return (
              <button
                key={s}
                onClick={() => updateFilter('size', active ? null : s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Đang tìm kiếm sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Không tìm thấy sản phẩm</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Không có sản phẩm nào phù hợp với các tiêu chí lọc hiện tại.
            </p>
            <button onClick={clearAllFilters} className="btn btn-primary btn-sm">
              Xóa bộ lọc & xem tất cả
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="badge badge-neutral" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Đang tải danh sách sản phẩm...
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
