'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Truck, RotateCcw, CreditCard, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '64px',
        paddingBottom: '32px',
        marginTop: '80px',
      }}
    >
      <div className="container">
        {/* Trust Badges Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            paddingBottom: '48px',
            marginBottom: '48px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Chất lượng tuyển chọn</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mọi đôi sneaker đều được kiểm tra tỉ mỉ từng đường kim mũi chỉ trước khi gửi.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Giao hàng 3–5 ngày</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ship COD hoặc chuyển khoản toàn quốc. Quý khách được đồng kiểm hàng khi nhận.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Đổi size 7 ngày</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Không vừa chân? Hỗ trợ đổi size nhanh chóng, tư vấn tận tâm qua Zalo shop.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>VietQR Chuyển khoản</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tạo mã QR kèm mã đơn chính xác, quét mã banking nhanh gọn trong 5 giây.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '36px',
            marginBottom: '48px',
          }}
        >
          {/* Col 1: Shop Brand & Address */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                AT
              </div>
              <span style={{ fontWeight: 800, fontSize: '17px' }}>ANH THƯ SNEAKER</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              Không gian sneaker & thời trang thể thao phong cách hiện đại. Mang đến trải nghiệm mua sắm chân thực, nhanh gọn và tin cậy nhất.
            </p>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--accent-primary)" /> Hotline/Zalo: 0901234567
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={14} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                128 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: 'var(--text-main)' }}>
              Danh mục
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href="/products?category=cat_sneaker">Sneaker thể thao</Link></li>
              <li><Link href="/products?category=cat_shoes">Giày da & Loafer</Link></li>
              <li><Link href="/products?category=cat_clothing">Quần áo Streetwear</Link></li>
              <li><Link href="/products?category=cat_accessories">Phụ kiện & Vệ sinh giày</Link></li>
              <li><Link href="/products?is_sale=true">Sản phẩm khuyến mãi</Link></li>
            </ul>
          </div>

          {/* Col 3: Policies */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: 'var(--text-main)' }}>
              Chính sách & Hỗ trợ
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href="/policy/shipping">Chính sách vận chuyển (3-5 ngày)</Link></li>
              <li><Link href="/policy/returns">Chính sách đổi trả & bảo hành</Link></li>
              <li><Link href="/policy/privacy">Chính sách bảo mật thông tin</Link></li>
              <li><Link href="/policy/terms">Điều khoản dịch vụ</Link></li>
              <li><Link href="/track-order">Tra cứu hành trình đơn hàng</Link></li>
            </ul>
          </div>

          {/* Col 4: Social & Admin */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: 'var(--text-main)' }}>
              Kết nối với Shop
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Theo dõi chúng mình để nhận thông báo mẫu sneaker mới và săn voucher giảm giá giới hạn:
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="https://zalo.me/0901234567" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Zalo Shop</a>
              <a href="https://facebook.com/anhthusneaker" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Facebook</a>
              <a href="https://instagram.com/anhthusneaker" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Instagram</a>
              <a href="https://tiktok.com/@anhthusneaker" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">TikTok</a>
            </div>
            <div style={{ marginTop: '24px' }}>
              <Link href="/admin" style={{ fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'underline' }}>
                Hệ thống Quản trị Anh Thư Sneaker (Dành cho chủ shop)
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-dim)',
            gap: '12px',
          }}
        >
          <div>
            © 2026 Anh Thư Sneaker. Xây dựng cho trải nghiệm thương mại điện tử chuyên nghiệp.
          </div>
          <div>
            Thanh toán chuyển khoản VietQR an toàn • Giao hàng tận tay toàn quốc
          </div>
        </div>
      </div>
    </footer>
  );
};
