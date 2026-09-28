'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  CreditCard,
  Truck,
  ShieldCheck,
  Share2,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Megaphone,
} from 'lucide-react';
import { ShopSettings } from '@/types/settings';

const PRESET_AVATARS = [
  {
    name: '👟 Neon Streetwear',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '🔥 Retro Classic',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '⚡ Hypebeast Runner',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '🖤 Minimal Black',
    url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '👑 Luxury Monogram',
    url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=300&q=80',
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSettings(json.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ShopSettings, val: any) => {
    setSettings((prev) => (prev ? { ...prev, [field]: val } : null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSavedMsg(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      } else {
        alert(json.error || 'Lỗi khi lưu cài đặt');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
        Đang tải cấu hình cửa hàng...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
            Cấu Hình Cửa Hàng & Tùy Chọn
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Tùy biến avatar shop, thông tin thương hiệu, tài khoản VietQR, phí ship và chính sách.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {savedMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: 700 }}>
              <CheckCircle size={16} /> Đã lưu cài đặt thành công!
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Box 0: Nhận diện thương hiệu & Avatar shop */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Sparkles size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>1. Nhận diện thương hiệu & Avatar Cửa hàng</h3>
            </div>

            {/* Avatar Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {/* Left: Avatar Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    border: '3px solid var(--accent-primary)',
                    boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {settings.SHOP_AVATAR ? (
                    <img
                      src={settings.SHOP_AVATAR}
                      alt="Shop Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-primary)' }}>AT</span>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Avatar Hiện Tại Của Shop
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Hiển thị trên Logo Website, Thanh Header, Sidebar Quản trị và Hóa đơn.
                  </div>
                  {settings.SHOP_AVATAR && (
                    <button
                      type="button"
                      onClick={() => handleChange('SHOP_AVATAR', '')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      Dùng logo chữ mặc định
                    </button>
                  )}
                </div>
              </div>

              {/* Right: URL Input */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Đường dẫn ảnh Avatar / Logo (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo-shop.png"
                  value={settings.SHOP_AVATAR || ''}
                  onChange={(e) => handleChange('SHOP_AVATAR', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Preset Avatars Selection */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Hoặc chọn nhanh từ bộ sưu tập Avatar Sneaker độc quyền:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {PRESET_AVATARS.map((item, idx) => {
                  const isSelected = settings.SHOP_AVATAR === item.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange('SHOP_AVATAR', item.url)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slogan & Business Hours Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Khẩu hiệu thương hiệu (Slogan)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuẩn phong cách Streetwear • Đẳng cấp & Thời thượng"
                  value={settings.SHOP_SLOGAN || ''}
                  onChange={(e) => handleChange('SHOP_SLOGAN', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Thời gian mở cửa & Tư vấn (Business Hours)
                </label>
                <input
                  type="text"
                  placeholder="08:30 – 22:00 hàng ngày (kể cả Thứ 7 & Chủ Nhật)"
                  value={settings.BUSINESS_HOURS || ''}
                  onChange={(e) => handleChange('BUSINESS_HOURS', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Announcement Banner Bar */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.ANNOUNCEMENT_ACTIVE ?? true}
                    onChange={(e) => handleChange('ANNOUNCEMENT_ACTIVE', e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                  />
                  Bật thanh thông báo khuyến mãi chạy chữ trên cùng Website
                </label>
                <span className="badge badge-orange" style={{ fontSize: '10px' }}>PROMO RIBBON</span>
              </div>
              <input
                type="text"
                placeholder="🔥 GIẢM 10% CHO ĐƠN ĐẦU TIÊN — FREESHIP TOÀN QUỐC CHO ĐƠN TỪ 1.000.000Đ — ĐỔI SIZE TRONG 7 NGÀY"
                value={settings.ANNOUNCEMENT_TEXT || ''}
                onChange={(e) => handleChange('ANNOUNCEMENT_TEXT', e.target.value)}
                className="input-field"
                disabled={settings.ANNOUNCEMENT_ACTIVE === false}
                style={{ opacity: settings.ANNOUNCEMENT_ACTIVE === false ? 0.6 : 1 }}
              />
            </div>
          </div>

          {/* Box 1: Thông tin thương hiệu */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>2. Thông tin chung & Liên hệ</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tên cửa hàng *</label>
                <input
                  type="text"
                  required
                  value={settings.SHOP_NAME}
                  onChange={(e) => handleChange('SHOP_NAME', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Hotline / Zalo *</label>
                <input
                  type="text"
                  required
                  value={settings.PHONE}
                  onChange={(e) => handleChange('PHONE', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email cửa hàng</label>
                <input
                  type="email"
                  value={settings.EMAIL || ''}
                  onChange={(e) => handleChange('EMAIL', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Ngưỡng báo sắp hết hàng (Low Stock Threshold)</label>
                <input
                  type="number"
                  value={settings.LOW_STOCK_THRESHOLD}
                  onChange={(e) => handleChange('LOW_STOCK_THRESHOLD', Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Địa chỉ cửa hàng</label>
                <input
                  type="text"
                  value={settings.ADDRESS}
                  onChange={(e) => handleChange('ADDRESS', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Box 2: Thông tin chuyển khoản VietQR */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CreditCard size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>3. Cấu hình Chuyển khoản Ngân hàng (VietQR)</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Mã Ngân Hàng (VietQR Bank Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="MB, VCB, TCB, VPB..."
                  value={settings.BANK_CODE}
                  onChange={(e) => handleChange('BANK_CODE', e.target.value.toUpperCase())}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tên Ngân Hàng Hiển Thị *</label>
                <input
                  type="text"
                  required
                  placeholder="MBBank / Vietcombank..."
                  value={settings.BANK_NAME}
                  onChange={(e) => handleChange('BANK_NAME', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Số Tài Khoản *</label>
                <input
                  type="text"
                  required
                  value={settings.BANK_ACCOUNT_NUMBER}
                  onChange={(e) => handleChange('BANK_ACCOUNT_NUMBER', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tên Chủ Tài Khoản (Không dấu) *</label>
                <input
                  type="text"
                  required
                  value={settings.BANK_ACCOUNT_NAME}
                  onChange={(e) => handleChange('BANK_ACCOUNT_NAME', e.target.value.toUpperCase())}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Box 3: Cấu hình Vận chuyển */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Truck size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>4. Cước phí & Thời gian giao hàng</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Phí vận chuyển tiêu chuẩn (VND)</label>
                <input
                  type="number"
                  value={settings.SHIPPING_FEE}
                  onChange={(e) => handleChange('SHIPPING_FEE', Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Thời gian giao hàng dự kiến</label>
                <input
                  type="text"
                  value={settings.DELIVERY_ESTIMATE}
                  onChange={(e) => handleChange('DELIVERY_ESTIMATE', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Box 4: Mạng xã hội */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Share2 size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>5. Kênh Truyền Thông & Mạng Xã Hội</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Zalo Link</label>
                <input
                  type="text"
                  value={settings.ZALO_LINK || ''}
                  onChange={(e) => handleChange('ZALO_LINK', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Facebook Page</label>
                <input
                  type="text"
                  value={settings.FACEBOOK_LINK || ''}
                  onChange={(e) => handleChange('FACEBOOK_LINK', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Instagram</label>
                <input
                  type="text"
                  value={settings.INSTAGRAM_LINK || ''}
                  onChange={(e) => handleChange('INSTAGRAM_LINK', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>TikTok</label>
                <input
                  type="text"
                  value={settings.TIKTOK_LINK || ''}
                  onChange={(e) => handleChange('TIKTOK_LINK', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Submit Bottom Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', justifyContent: 'center' }}
            >
              <Save size={18} />
              {saving ? 'Đang lưu cấu hình...' : 'Lưu tất cả thay đổi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
