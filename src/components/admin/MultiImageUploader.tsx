'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Loader2,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatImageUrl, isGoogleDriveUrl } from '@/lib/imageHelper';

export interface ImageItem {
  id?: string;
  url: string;
  alt?: string;
  is_primary: boolean;
  sort_order: number;
}

interface MultiImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxFiles?: number;
}

export function MultiImageUploader({
  images,
  onChange,
  maxFiles = 15,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setUploadProgress(`Đang tải lên ${fileArray.length} ảnh...`);

    try {
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data) {
        const uploadedList: Array<{ url: string; name?: string }> =
          json.data.files || (json.data.url ? [{ url: json.data.url }] : []);

        const currentCount = images.length;
        const newItems: ImageItem[] = uploadedList.map((item, idx) => ({
          id: `img_${Date.now()}_${idx}`,
          url: item.url,
          alt: item.name ? item.name.replace(/\.[^/.]+$/, '') : '',
          is_primary: currentCount === 0 && idx === 0,
          sort_order: currentCount + idx + 1,
        }));

        const updated = [...images, ...newItems];

        // Ensure at least one image is primary
        if (!updated.some((img) => img.is_primary) && updated.length > 0) {
          updated[0].is_primary = true;
        }

        onChange(updated);
        setSuccessMessage(`Đã thêm thành công ${newItems.length} hình ảnh vào thư viện!`);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(json.error || 'Lỗi khi tải ảnh lên máy chủ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi tải ảnh lên');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const formatted = formatImageUrl(manualUrl.trim());

    const newItem: ImageItem = {
      id: `img_${Date.now()}`,
      url: formatted,
      alt: '',
      is_primary: images.length === 0,
      sort_order: images.length + 1,
    };

    const updated = [...images, newItem];
    if (!updated.some((img) => img.is_primary) && updated.length > 0) {
      updated[0].is_primary = true;
    }

    onChange(updated);
    setManualUrl('');
    setSuccessMessage('Đã thêm liên kết ảnh thành công!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  const removeImage = (index: number) => {
    const isRemovingPrimary = images[index].is_primary;
    const updated = images.filter((_, i) => i !== index);

    if (isRemovingPrimary && updated.length > 0) {
      updated[0].is_primary = true;
    }

    // Re-index sort order
    const reordered = updated.map((img, i) => ({
      ...img,
      sort_order: i + 1,
    }));

    onChange(reordered);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reordered = copy.map((img, i) => ({
      ...img,
      sort_order: i + 1,
    }));

    onChange(reordered);
  };

  const updateAlt = (index: number, alt: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], alt };
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: isDragging
            ? '2px dashed var(--accent-primary)'
            : '2px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          textAlign: 'center',
          background: isDragging ? 'rgba(255, 70, 46, 0.05)' : 'var(--bg-main)',
          transition: 'all 0.2s ease',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onClick={() => {
          if (!uploading) fileInputRef.current?.click();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 70, 46, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            {uploading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <UploadCloud size={28} />
            )}
          </div>

          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              {uploading
                ? uploadProgress || 'Đang tải nhiều ảnh lên...'
                : 'Kéo thả hoặc Chọn cùng lúc NHIỀU ẢNH từ máy tính'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
              Hỗ trợ chọn nhiều file JPG, PNG, WebP cùng lúc. Hệ thống tự động nén tối ưu, đồng bộ Cloudinary hoặc lưu máy chủ nội bộ.
            </p>
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              marginTop: '4px',
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang tải lên...
              </>
            ) : (
              <>
                <UploadCloud size={16} /> Chọn ảnh từ máy tính (Có thể chọn nhiều ảnh)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Link Input */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          background: 'var(--bg-main)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
          <LinkIcon size={16} />
        </div>
        <input
          type="text"
          placeholder="Hoặc dán trực tiếp đường dẫn ảnh (Google Drive, Unsplash, CDN...)"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddManualUrl();
            }
          }}
          className="input-field"
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '6px 8px' }}
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          disabled={!manualUrl.trim()}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Plus size={14} /> Thêm link
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#f43f5e',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--accent-emerald)',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}

      {/* Gallery Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={16} color="var(--accent-primary)" />
            Thư viện ảnh ({images.length} ảnh đã chọn)
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Ảnh có huy hiệu <strong style={{ color: '#f59e0b' }}>⭐ Ảnh chính</strong> sẽ được hiển thị làm ảnh đại diện trên danh sách và đầu trang chi tiết.
          </p>
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa tất cả ảnh đã tải?')) {
                onChange([]);
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ color: '#f43f5e', fontSize: '11px' }}
          >
            <Trash2 size={13} /> Xóa tất cả ảnh
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-dim)',
            fontSize: '13px',
          }}
        >
          Chưa có hình ảnh nào. Vui lòng chọn hoặc kéo thả nhiều ảnh từ máy tính ở khung phía trên.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {images.map((item, index) => {
            const formatted = formatImageUrl(item.url);
            return (
              <div
                key={item.id || item.url || index}
                style={{
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: item.is_primary
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: item.is_primary ? '0 0 12px rgba(255, 70, 46, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Primary Badge */}
                {item.is_primary ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 3,
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Star size={11} fill="#fff" /> Ảnh chính
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    title="Bấm để đặt làm ảnh đại diện chính"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(255, 70, 46, 0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'rgba(0,0,0,0.65)';
                    }}
                  >
                    <Star size={10} /> Đặt làm chính
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  title="Xóa ảnh này"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 3,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f43f5e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.7)';
                  }}
                >
                  <Trash2 size={13} />
                </button>

                {/* Image Preview Container */}
                <div
                  style={{
                    width: '100%',
                    paddingTop: '80%',
                    position: 'relative',
                    background: '#0e1117',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={formatted}
                    alt={item.alt || `Product Image ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.2s ease',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '0.3';
                    }}
                  />
                </div>

                {/* Controls Bar */}
                <div
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Mô tả ảnh / SEO alt..."
                    value={item.alt || ''}
                    onChange={(e) => updateAlt(index, e.target.value)}
                    className="input-field"
                    style={{ fontSize: '11px', padding: '4px 6px', height: '26px' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      #{index + 1}
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(index, 'left')}
                        title="Di chuyển sang trái"
                        className="btn-secondary btn-sm"
                        style={{
                          width: '22px',
                          height: '22px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: index === 0 ? 0.3 : 1,
                        }}
                      >
                        <ArrowLeft size={11} />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, 'right')}
                        title="Di chuyển sang phải"
                        className="btn-secondary btn-sm"
                        style={{
                          width: '22px',
                          height: '22px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: index === images.length - 1 ? 0.3 : 1,
                        }}
                      >
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
