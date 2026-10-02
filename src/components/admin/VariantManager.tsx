'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  DollarSign,
  Package,
  Wand2,
  X,
  Palette,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { formatImageUrl } from '@/lib/imageHelper';
import { ProductOption } from '@/types/product';

export interface VariantItem {
  variant_id?: string;
  sku: string;
  barcode?: string;
  size: string;
  color: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  stock: number;
  image?: string;
  options?: Record<string, string>;
  [key: string]: any;
}

export interface ImageOption {
  url: string;
  alt?: string;
  is_primary?: boolean;
}

interface VariantManagerProps {
  variants: any[];
  onChange: (variants: any[]) => void;
  options: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
  productImages?: ImageOption[];
  productName?: string;
}

// Preset color options for quick picking
const PRESET_COLORS = [
  { name: 'Trắng', hex: '#ffffff', border: '#cbd5e1' },
  { name: 'Đen', hex: '#111827', border: '#374151' },
  { name: 'Xám', hex: '#64748b', border: '#475569' },
  { name: 'Đỏ', hex: '#ef4444', border: '#dc2626' },
  { name: 'Xanh Navy', hex: '#1e3a8a', border: '#172554' },
  { name: 'Xanh Royal', hex: '#2563eb', border: '#1d4ed8' },
  { name: 'Xanh Lá', hex: '#16a34a', border: '#15803d' },
  { name: 'Be / Kem', hex: '#fef08a', border: '#fde047' },
  { name: 'Nâu', hex: '#78350f', border: '#451a03' },
  { name: 'Cam', hex: '#f97316', border: '#c2410c' },
  { name: 'Vàng', hex: '#eab308', border: '#ca8a04' },
  { name: 'Hồng', hex: '#ec4899', border: '#db2777' },
  { name: 'Phối màu', hex: 'linear-gradient(135deg, #f43f5e, #3b82f6)', border: '#60a5fa' },
];

export function VariantManager({
  variants,
  onChange,
  options,
  onOptionsChange,
  productImages = [],
  productName = 'ATS',
}: VariantManagerProps) {
  // Option generator state
  const [showOptionsBuilder, setShowOptionsBuilder] = useState(options.length > 0);
  const [newOptionName, setNewOptionName] = useState('');
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({});

  // Image selector modal
  const [selectingImageForIndex, setSelectingImageForIndex] = useState<number | null>(null);

  // Bulk Edit States
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkComparePrice, setBulkComparePrice] = useState<string>('');
  const [bulkCostPrice, setBulkCostPrice] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [bulkColorImageTarget, setBulkColorImageTarget] = useState<string>('');
  const [successToast, setSuccessToast] = useState('');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Helper to slugify SKU safely
  const generateSlugPart = (str: any) => {
    if (!str && str !== 0) return '';
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '')
      .toUpperCase();
  };

  // Add Option (e.g. "Màu sắc", "Kích cỡ", "Phiên bản"...)
  const handleAddOption = (name: string, defaultValues: string[] = []) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    if (options.some((o) => String(o.name).toLowerCase() === trimmed.toLowerCase())) {
      alert(`Thuộc tính "${trimmed}" đã tồn tại!`);
      return;
    }
    const newOpts = [...options, { name: trimmed, values: defaultValues }];
    onOptionsChange(newOpts);
    setNewOptionName('');
  };

  // Remove Option
  const handleRemoveOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    onOptionsChange(updated);
  };

  // Add Tag to Option
  const handleAddTag = (optIndex: number, val: string) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return;
    const opt = options[optIndex];
    if (!opt) return;
    if (opt.values.some((v) => String(v).toLowerCase() === trimmed.toLowerCase())) return;

    const newValues = [...opt.values, trimmed];
    const updated = [...options];
    updated[optIndex] = { ...opt, values: newValues };
    onOptionsChange(updated);

    setTagInputs((prev) => ({ ...prev, [optIndex]: '' }));
  };

  // Remove Tag from Option
  const handleRemoveTag = (optIndex: number, tagVal: string) => {
    const opt = options[optIndex];
    if (!opt) return;
    const updated = [...options];
    updated[optIndex] = { ...opt, values: opt.values.filter((v) => String(v) !== String(tagVal)) };
    onOptionsChange(updated);
  };

  // Auto-generate Combinations Matrix (Robust, collision-free)
  const handleGenerateMatrix = () => {
    if (!options || options.length === 0) {
      alert('Vui lòng tạo ít nhất 1 thuộc tính (ví dụ: Màu sắc, Kích cỡ) trước khi sinh ma trận!');
      return;
    }

    // Filter valid options with values
    const validOptions = options.filter((o) => Array.isArray(o.values) && o.values.length > 0);
    if (validOptions.length === 0) {
      alert('Các thuộc tính cần có ít nhất 1 giá trị tag (ví dụ: thêm các size 39, 40 hoặc màu Trắng, Đen)!');
      return;
    }

    // Cartesian product of option values
    let combinations: Record<string, string>[] = [{}];
    validOptions.forEach((opt) => {
      const nextCombos: Record<string, string>[] = [];
      combinations.forEach((combo) => {
        opt.values.forEach((val) => {
          nextCombos.push({ ...combo, [opt.name]: String(val).trim() });
        });
      });
      combinations = nextCombos;
    });

    const baseCode = generateSlugPart(productName).slice(0, 8) || 'ATS';
    const firstPrice = Number(variants[0]?.price) || 2000000;
    const firstComparePrice = Number(variants[0]?.compare_at_price) || 0;
    const firstCostPrice = Number(variants[0]?.cost_price) || 1400000;
    const firstStock = Number(variants[0]?.stock) || 5;

    // Detect color & size keys flexibly
    const colorOpt = validOptions.find((o) => {
      const n = String(o.name).toLowerCase().trim();
      return n.includes('màu') || n.includes('color') || n.includes('colour') || n.includes('phối');
    });
    const colorOptKey = colorOpt?.name;

    const sizeOpt = validOptions.find((o) => {
      const n = String(o.name).toLowerCase().trim();
      return n.includes('size') || n.includes('kích') || n.includes('cỡ');
    });
    const sizeOptKey = sizeOpt?.name;

    // Remaining options that are neither primary color nor size
    const otherOptKeys = validOptions
      .map((o) => o.name)
      .filter((k) => k !== colorOptKey && k !== sizeOptKey);

    const usedExistingIndices = new Set<number>();
    const usedSkus = new Set<string>();

    const newVariants: VariantItem[] = combinations.map((combo, idx) => {
      let colorVal = colorOptKey ? combo[colorOptKey] : '';
      let sizeVal = sizeOptKey ? combo[sizeOptKey] : '';

      // If no color or size is explicitly labeled, assign from available options
      if (!colorVal && !sizeVal) {
        const keys = Object.keys(combo);
        colorVal = combo[keys[0]] || 'Tiêu chuẩn';
        sizeVal = keys.length > 1 ? combo[keys[1]] : 'Tiêu chuẩn';
      } else {
        if (!colorVal) colorVal = 'Tiêu chuẩn';
        if (!sizeVal) sizeVal = 'Tiêu chuẩn';
      }

      // Check if an existing variant matches this exact combination
      let existingIndex = -1;
      for (let i = 0; i < variants.length; i++) {
        if (usedExistingIndices.has(i)) continue;
        const v = variants[i];
        if (v.options && Object.keys(v.options).length > 0) {
          const matchAll = Object.entries(combo).every(
            ([k, val]) => String(v.options?.[k] || '').toLowerCase() === String(val).toLowerCase()
          );
          if (matchAll) {
            existingIndex = i;
            break;
          }
        } else {
          const matchColor = String(v.color || 'Tiêu chuẩn').toLowerCase() === String(colorVal).toLowerCase();
          const matchSize = String(v.size || 'Tiêu chuẩn').toLowerCase() === String(sizeVal).toLowerCase();
          if (matchColor && matchSize) {
            existingIndex = i;
            break;
          }
        }
      }

      if (existingIndex !== -1) {
        usedExistingIndices.add(existingIndex);
        const existing = variants[existingIndex];
        const existingSku = existing.sku || `ATS-${baseCode}-${idx + 1}`;
        usedSkus.add(existingSku);
        return {
          ...existing,
          color: colorVal,
          size: sizeVal,
          options: combo,
        };
      }

      // Generate unique SKU
      const colorCode = colorVal && colorVal !== 'Tiêu chuẩn' ? `-${generateSlugPart(colorVal).slice(0, 5)}` : '';
      const sizeCode = sizeVal && sizeVal !== 'Tiêu chuẩn' ? `-${generateSlugPart(sizeVal)}` : '';
      const otherCodeParts = otherOptKeys
        .map((k) => generateSlugPart(combo[k]).slice(0, 4))
        .filter(Boolean)
        .join('-');
      const otherCodeStr = otherCodeParts ? `-${otherCodeParts}` : '';

      let baseSku = `ATS-${baseCode}${colorCode}${sizeCode}${otherCodeStr}`.replace(/--+/g, '-');
      if (!colorCode && !sizeCode && !otherCodeStr) {
        baseSku = `ATS-${baseCode}-${idx + 1}`;
      }

      let uniqueSku = baseSku;
      let counter = 1;
      while (usedSkus.has(uniqueSku)) {
        uniqueSku = `${baseSku}-${counter++}`;
      }
      usedSkus.add(uniqueSku);

      // Pick image for this color if any existing variant of this color has an image
      const sameColorVariant = variants.find(
        (v) => String(v.color || '').toLowerCase() === String(colorVal).toLowerCase() && v.image
      );
      const chosenImage = sameColorVariant?.image || productImages[0]?.url || '';

      return {
        variant_id: `temp_var_${Date.now()}_${idx + 1}`,
        sku: uniqueSku,
        barcode: '',
        size: sizeVal,
        color: colorVal,
        price: firstPrice,
        compare_at_price: firstComparePrice,
        cost_price: firstCostPrice,
        stock: firstStock,
        image: chosenImage,
        options: combo,
      };
    });

    onChange(newVariants);
    triggerToast(`Đã tạo thành công ${newVariants.length} biến thể từ các thuộc tính!`);
  };

  // Add a single manual variant row safely
  const handleAddManualRow = () => {
    const lastVar = variants.length > 0 ? variants[variants.length - 1] : null;
    const nextSize = lastVar ? (Number(lastVar.size) + 1 || 42).toString() : '39';
    const lastColor = lastVar?.color || 'Tiêu chuẩn';
    const baseCode = generateSlugPart(productName).slice(0, 6) || 'PROD';
    const uniqueSuffix = Date.now().toString().slice(-4);
    const sku = `ATS-${baseCode}-${generateSlugPart(lastColor).slice(0, 4) || 'VAR'}-${nextSize}-${uniqueSuffix}`;

    const newRow: VariantItem = {
      variant_id: `temp_var_${Date.now()}`,
      sku,
      barcode: '',
      size: nextSize,
      color: lastColor,
      price: Number(variants[0]?.price) || 2000000,
      compare_at_price: Number(variants[0]?.compare_at_price) || 0,
      cost_price: Number(variants[0]?.cost_price) || 1400000,
      stock: 5,
      image: variants[0]?.image || productImages[0]?.url || '',
      options: lastVar?.options ? { ...lastVar.options, Size: nextSize } : {},
    };

    onChange([...variants, newRow]);
  };

  // Remove variant
  const handleRemoveVariant = (idx: number) => {
    if (variants.length <= 1) {
      alert('Sản phẩm cần tối thiểu ít nhất 1 biến thể!');
      return;
    }
    onChange(variants.filter((_, i) => i !== idx));
  };

  // Clone variant safely
  const handleCloneVariant = (idx: number) => {
    const target = variants[idx];
    if (!target) return;
    const clone: VariantItem = {
      ...target,
      variant_id: `temp_var_${Date.now()}`,
      sku: `${target.sku || 'SKU'}-COPY-${Date.now().toString().slice(-3)}`,
    };
    const next = [...variants];
    next.splice(idx + 1, 0, clone);
    onChange(next);
  };

  // Update variant field
  const handleUpdateField = (idx: number, field: string, val: any) => {
    const copy = [...variants];
    copy[idx] = { ...copy[idx], [field]: val };
    onChange(copy);
  };

  // Apply Bulk Updates
  const handleApplyBulk = () => {
    let appliedCount = 0;
    const copy = variants.map((v) => {
      const updated = { ...v };
      if (bulkPrice !== '' && !isNaN(Number(bulkPrice))) {
        updated.price = Number(bulkPrice);
        appliedCount++;
      }
      if (bulkComparePrice !== '' && !isNaN(Number(bulkComparePrice))) {
        updated.compare_at_price = Number(bulkComparePrice);
      }
      if (bulkCostPrice !== '' && !isNaN(Number(bulkCostPrice))) {
        updated.cost_price = Number(bulkCostPrice);
      }
      if (bulkStock !== '' && !isNaN(Number(bulkStock))) {
        updated.stock = Number(bulkStock);
      }
      return updated;
    });

    onChange(copy);
    setBulkPrice('');
    setBulkComparePrice('');
    setBulkCostPrice('');
    setBulkStock('');
    triggerToast(`Đã áp dụng thông số hàng loạt cho toàn bộ ${variants.length} biến thể!`);
  };

  // Assign Image to all variants of a specific color
  const handleAssignImageToColor = (colorName: string, imageUrl: string) => {
    const target = String(colorName || '').toLowerCase();
    const copy = variants.map((v) => {
      if (String(v.color || '').toLowerCase() === target) {
        return { ...v, image: imageUrl };
      }
      return v;
    });
    onChange(copy);
    setBulkColorImageTarget('');
    triggerToast(`Đã gán ảnh cho toàn bộ biến thể màu "${colorName}"!`);
  };

  // Unique colors in variants
  const uniqueColors = Array.from(new Set(variants.map((v) => v.color || 'Tiêu chuẩn'))).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast alert */}
      {successToast && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#10b981',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          {successToast}
        </div>
      )}

      {/* SECTION 1: CUSTOM OPTIONS & MATRIX GENERATOR */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: showOptionsBuilder ? '16px' : '0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} color="var(--accent-primary)" />
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                Thiết lập Thuộc tính Tùy biến (Màu sắc, Kích cỡ, Phiên bản...)
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Thêm các phối màu và kích cỡ của giày, sau đó hệ thống sẽ tự động ghép tổ hợp ma trận biến thể.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOptionsBuilder(!showOptionsBuilder)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {showOptionsBuilder ? (
              <>
                <ChevronUp size={14} /> Thu gọn thuộc tính
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Tùy biến thuộc tính ({options.length})
              </>
            )}
          </button>
        </div>

        {showOptionsBuilder && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Thêm mẫu nhanh:</span>
              {!options.some((o) => String(o.name || '').toLowerCase() === 'màu sắc') && (
                <button
                  type="button"
                  onClick={() => handleAddOption('Màu sắc', ['Trắng', 'Đen'])}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> + Thuộc tính &quot;Màu sắc&quot;
                </button>
              )}

              {!options.some((o) => String(o.name || '').toLowerCase() === 'kích cỡ') && (
                <button
                  type="button"
                  onClick={() => handleAddOption('Kích cỡ', ['39', '40', '41', '42'])}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> + Thuộc tính &quot;Kích cỡ&quot;
                </button>
              )}

              {/* Add custom option input */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Tên thuộc tính khác (vd: Bản kỷ niệm, Dây giày...)"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption(newOptionName);
                    }
                  }}
                  className="input-field"
                  style={{ padding: '4px 10px', fontSize: '12px', width: '240px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddOption(newOptionName)}
                  disabled={!newOptionName.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px' }}
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* List of Defined Options */}
            {options.map((opt, optIdx) => {
              const optNameLower = String(opt.name || '').toLowerCase();
              const isColorOpt = ['màu', 'màu sắc', 'color'].includes(optNameLower);
              const isSizeOpt = ['size', 'kích cỡ', 'cỡ'].includes(optNameLower);

              return (
                <div
                  key={optIdx}
                  style={{
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={14} color="var(--accent-primary)" />
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{opt.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        ({opt.values.length} giá trị)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIdx)}
                      style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      title="Xóa thuộc tính này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Chips for existing values */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {opt.values.map((val, valIdx) => (
                      <span
                        key={valIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '20px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {isColorOpt && (
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background:
                                PRESET_COLORS.find((c) => String(c.name).toLowerCase() === String(val).toLowerCase())?.hex ||
                                '#94a3b8',
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          />
                        )}
                        {val}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(optIdx, val)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    {/* Input to add tag */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="text"
                        placeholder={`Thêm giá trị ${opt.name}...`}
                        value={tagInputs[optIdx] || ''}
                        onChange={(e) => setTagInputs({ ...tagInputs, [optIdx]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(optIdx, tagInputs[optIdx] || '');
                          }
                        }}
                        className="input-field"
                        style={{ width: '150px', padding: '4px 8px', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(optIdx, tagInputs[optIdx] || '')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>

                  {/* Smart Presets for Colors */}
                  {isColorOpt && (
                    <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                        Click để thêm nhanh các màu sắc thịnh hành:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {PRESET_COLORS.map((pc) => {
                          const isAdded = opt.values.some((v) => String(v).toLowerCase() === String(pc.name).toLowerCase());
                          return (
                            <button
                              key={pc.name}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  handleRemoveTag(optIdx, pc.name);
                                } else {
                                  handleAddTag(optIdx, pc.name);
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isAdded ? 'var(--accent-primary-subtle, rgba(234, 179, 8, 0.15))' : 'var(--bg-surface)',
                                border: isAdded ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                color: isAdded ? 'var(--accent-primary)' : 'var(--text-muted)',
                                borderRadius: '16px',
                                padding: '3px 10px',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: pc.hex,
                                  border: `1px solid ${pc.border}`,
                                }}
                              />
                              {pc.name}
                              {isAdded && <Check size={10} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Smart Presets for Shoe Sizes */}
                  {isSizeOpt && (
                    <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                        Mẫu kích cỡ giày Sneaker:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            ['39', '40', '41', '42', '43', '44'].forEach((s) => handleAddTag(optIdx, s));
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Size Nam (39-44)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            ['36', '37', '38', '39', '40'].forEach((s) => handleAddTag(optIdx, s));
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Size Nữ (36-40)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].forEach((s) =>
                              handleAddTag(optIdx, s)
                            );
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Full Size (36-45)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ACTION: GENERATE COMBINATIONS MATRIX BUTTON */}
            {options.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-primary)' }}>
                    ⚡ Tạo tổ hợp ma trận biến thể tự động
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Hệ thống sẽ nhân chéo các giá trị thuộc tính (vd: Màu x Kích cỡ) và bảo toàn giá/kho đã nhập.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateMatrix}
                  className="btn btn-accent btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Wand2 size={15} /> Sinh ma trận biến thể
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: BULK EDIT TOOLBAR */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Thao tác Hàng loạt (Bulk Actions)</span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              (Tiết kiệm thời gian cập nhật giá và tồn kho cho {variants.length} biến thể)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkToolbar(!showBulkToolbar)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px' }}
          >
            {showBulkToolbar ? 'Đóng thanh điền nhanh' : 'Mở thanh điền nhanh'}
          </button>
        </div>

        {showBulkToolbar && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Bulk numbers row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Giá bán chung (VND)
                </label>
                <input
                  type="number"
                  placeholder="Vd: 2500000"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="input-field"
                  style={{ width: '130px', padding: '6px 8px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Giá gốc / So sánh
                </label>
                <input
                  type="number"
                  placeholder="Vd: 2800000"
                  value={bulkComparePrice}
                  onChange={(e) => setBulkComparePrice(e.target.value)}
                  className="input-field"
                  style={{ width: '130px', padding: '6px 8px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Giá vốn (COGS)
                </label>
                <input
                  type="number"
                  placeholder="Vd: 1800000"
                  value={bulkCostPrice}
                  onChange={(e) => setBulkCostPrice(e.target.value)}
                  className="input-field"
                  style={{ width: '130px', padding: '6px 8px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Tồn kho chung
                </label>
                <input
                  type="number"
                  placeholder="Vd: 8"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  className="input-field"
                  style={{ width: '100px', padding: '6px 8px', fontSize: '12px' }}
                />
              </div>

              <button
                type="button"
                onClick={handleApplyBulk}
                className="btn btn-primary btn-sm"
                style={{ height: '34px', fontSize: '12px', fontWeight: 600 }}
              >
                Áp dụng cho tất cả
              </button>
            </div>

            {/* Bulk Color Image Assignment */}
            {uniqueColors.length > 0 && productImages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-main)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                }}
              >
                <ImageIcon size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Gán nhanh ảnh cho Màu sắc:</span>

                <select
                  value={bulkColorImageTarget}
                  onChange={(e) => setBulkColorImageTarget(e.target.value)}
                  className="input-field"
                  style={{ width: '150px', padding: '4px 8px', fontSize: '12px' }}
                >
                  <option value="">-- Chọn màu --</option>
                  {uniqueColors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {bulkColorImageTarget && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Chọn 1 ảnh từ thư viện:</span>
                    {productImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAssignImageToColor(bulkColorImageTarget, img.url)}
                        title="Click để gán ảnh này cho toàn bộ size của màu đang chọn"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          padding: 0,
                          background: '#000',
                        }}
                      >
                        <img
                          src={formatImageUrl(img.url)}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: EDITABLE VARIANT TABLE */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-primary)" />
              Danh sách Biến thể Sản phẩm ({variants.length} biến thể)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Tùy chỉnh ảnh, màu sắc, kích cỡ, SKU, mã vạch, giá bán và số lượng tồn kho từng mẫu.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddManualRow}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Thêm biến thể thủ công
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dim)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '10px 8px', textAlign: 'center', width: '50px' }}>ẢNH</th>
                <th style={{ padding: '10px 8px', width: '130px' }}>MÀU SẮC</th>
                <th style={{ padding: '10px 8px', width: '80px' }}>SIZE</th>
                <th style={{ padding: '10px 8px', width: '160px' }}>MÃ SKU</th>
                <th style={{ padding: '10px 8px', width: '130px' }}>GIÁ BÁN (VND) *</th>
                <th style={{ padding: '10px 8px', width: '120px' }}>GIÁ GỐC (VND)</th>
                <th style={{ padding: '10px 8px', width: '120px' }}>GIÁ VỐN (COGS)</th>
                <th style={{ padding: '10px 8px', width: '90px' }}>TỒN KHO *</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: '90px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => {
                const isOutOfStock = Number(v.stock) <= 0;
                return (
                  <tr
                    key={v.variant_id ? `${v.variant_id}_${idx}` : `var_${idx}`}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isOutOfStock ? 'rgba(244, 63, 94, 0.03)' : 'transparent',
                    }}
                  >
                    {/* Thumbnail Image Picker */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <div
                        onClick={() => setSelectingImageForIndex(idx)}
                        title="Click để chọn ảnh từ thư viện"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: v.image ? '1px solid var(--border-subtle)' : '1px dashed var(--text-dim)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: 'var(--bg-main)',
                        }}
                      >
                        {v.image ? (
                          <img
                            src={formatImageUrl(v.image)}
                            alt={v.sku}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <ImageIcon size={14} color="var(--text-dim)" />
                        )}
                      </div>
                    </td>

                    {/* Color Input */}
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            background:
                              PRESET_COLORS.find(
                                (c) => String(c.name).toLowerCase() === String(v.color || '').toLowerCase()
                              )?.hex || '#94a3b8',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        />
                        <input
                          type="text"
                          required
                          value={v.color || ''}
                          placeholder="Màu sắc"
                          onChange={(e) => handleUpdateField(idx, 'color', e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                        />
                      </div>
                    </td>

                    {/* Size Input */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        required
                        value={v.size}
                        placeholder="Size"
                        onChange={(e) => handleUpdateField(idx, 'size', e.target.value)}
                        className="input-field"
                        style={{ width: '70px', padding: '6px 8px', fontWeight: 600, textAlign: 'center' }}
                      />
                    </td>

                    {/* SKU Input */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        required
                        value={v.sku}
                        onChange={(e) => handleUpdateField(idx, 'sku', e.target.value)}
                        className="input-field"
                        style={{ width: '100%', padding: '6px 8px', fontFamily: 'monospace', fontSize: '11px' }}
                      />
                    </td>

                    {/* Price Input */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        required
                        min={0}
                        value={v.price}
                        onChange={(e) => handleUpdateField(idx, 'price', Number(e.target.value) || 0)}
                        className="input-field"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontWeight: 700,
                          color: 'var(--accent-primary)',
                        }}
                      />
                    </td>

                    {/* Compare At Price Input */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        min={0}
                        value={v.compare_at_price || 0}
                        onChange={(e) => handleUpdateField(idx, 'compare_at_price', Number(e.target.value) || 0)}
                        className="input-field"
                        style={{ width: '100%', padding: '6px 8px' }}
                      />
                    </td>

                    {/* Cost Price (COGS) Input */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        min={0}
                        value={v.cost_price || 0}
                        onChange={(e) => handleUpdateField(idx, 'cost_price', Number(e.target.value) || 0)}
                        className="input-field"
                        style={{ width: '100%', padding: '6px 8px' }}
                      />
                    </td>

                    {/* Stock Input */}
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        required
                        min={0}
                        value={v.stock}
                        onChange={(e) => handleUpdateField(idx, 'stock', Number(e.target.value) || 0)}
                        className="input-field"
                        style={{
                          width: '80px',
                          padding: '6px 8px',
                          fontWeight: 700,
                          color: isOutOfStock ? '#f43f5e' : 'var(--text-main)',
                        }}
                      />
                    </td>

                    {/* Actions (Clone & Delete) */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleCloneVariant(idx)}
                          title="Nhân bản biến thể này"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Copy size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          disabled={variants.length <= 1}
                          title="Xóa biến thể"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f43f5e',
                            cursor: variants.length <= 1 ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            opacity: variants.length <= 1 ? 0.3 : 1,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: SELECT IMAGE FROM PRODUCT GALLERY */}
      {selectingImageForIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectingImageForIndex(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Chọn Ảnh Cho Biến Thể</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Biến thể: {variants[selectingImageForIndex]?.color} - Size {variants[selectingImageForIndex]?.size} (
                  {variants[selectingImageForIndex]?.sku})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectingImageForIndex(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {productImages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
                Chưa có hình ảnh nào trong thư viện sản phẩm. Vui lòng tải ảnh lên ở Mục 2 phía trên trước.
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  {productImages.map((img, i) => {
                    const isSelected = variants[selectingImageForIndex]?.image === img.url;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          handleUpdateField(selectingImageForIndex, 'image', img.url);
                          setSelectingImageForIndex(null);
                        }}
                        style={{
                          aspectRatio: 1,
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: isSelected ? '3px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          position: 'relative',
                          background: '#000',
                        }}
                      >
                        <img
                          src={formatImageUrl(img.url)}
                          alt={img.alt || 'img'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'var(--accent-primary)',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#000',
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateField(selectingImageForIndex, 'image', '');
                      setSelectingImageForIndex(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#f43f5e' }}
                  >
                    Bỏ chọn ảnh cho biến thể này
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectingImageForIndex(null)}
                    className="btn btn-primary btn-sm"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
