'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, PackageCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopAvatar, setShopAvatar] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<{ active: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.SHOP_AVATAR) setShopAvatar(json.data.SHOP_AVATAR);
          if (json.data.ANNOUNCEMENT_TEXT) {
            setAnnouncement({
              active: json.data.ANNOUNCEMENT_ACTIVE ?? true,
              text: json.data.ANNOUNCEMENT_TEXT,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sneaker', href: '/products?category=cat_sneaker' },
    { label: 'Giày', href: '/products?category=cat_shoes' },
    { label: 'Quần áo', href: '/products?category=cat_clothing' },
    { label: 'Phụ kiện', href: '/products?category=cat_accessories' },
    { label: 'Sale 🔥', href: '/products?is_sale=true' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Dynamic Announcement Ribbon */}
      {announcement?.active && announcement.text && (
        <div
          style={{
            background: 'linear-gradient(90deg, #ea580c 0%, #f97316 50%, #ea580c 100%)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            textAlign: 'center',
            padding: '6px 16px',
            letterSpacing: '0.03em',
            position: 'relative',
            zIndex: 51,
          }}
        >
          {announcement.text}
        </div>
      )}

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        className="glass-panel"
      >
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu"
            className="btn-secondary btn-sm"
            style={{ display: 'none' }}
            id="mobile-menu-trigger"
          >
            <Menu size={20} />
          </button>

          {/* Logo with Dynamic Avatar */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
              }}
            >
              {shopAvatar ? (
                <img src={shopAvatar} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'AT'
              )}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
                ANH THƯ
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                SNEAKER STORE
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '14px',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--text-main)' : 'var(--text-muted)',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                    padding: '6px 0',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-main)')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = active ? 'var(--text-main)' : 'var(--text-muted)')}
                >
                  {link.label}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--accent-primary)',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-secondary btn-sm"
              aria-label="Đổi giao diện sáng/tối"
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: 'var(--radius-full)' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-secondary btn-sm"
              aria-label="Tìm kiếm sản phẩm"
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: 'var(--radius-full)' }}
            >
              <Search size={18} />
            </button>

            {/* Track Order Direct Link */}
            <Link
              href="/track-order"
              className="btn-secondary btn-sm hide-on-mobile"
              style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PackageCheck size={16} />
              Tra cứu đơn
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-accent btn-sm"
              aria-label="Giỏ hàng"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
              }}
            >
              <ShoppingBag size={18} />
              <span className="hide-on-mobile" style={{ fontSize: '13px', fontWeight: 600 }}>Giỏ hàng</span>
              {totalItems > 0 && (
                <span
                  style={{
                    background: '#ffffff',
                    color: '#0b0d11',
                    fontSize: '11px',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '2px',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              className="btn-secondary btn-sm"
              style={{ width: '38px', height: '38px', padding: 0 }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Global Search Bar Reveal */}
        {searchOpen && (
          <div
            style={{
              padding: '12px 0',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
            className="animate-fade-in"
          >
            <div className="container">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm sneaker (Nike, Adidas, Samba, 550, size 41...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="input-field"
                  style={{ background: 'var(--bg-primary)' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Đóng
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-subtle)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  <span style={{ fontWeight: 800, fontSize: '16px' }}>ANH THƯ SNEAKER</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary btn-sm"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: pathname === link.href ? 'var(--accent-primary)' : 'var(--text-main)',
                      background: pathname === link.href ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-main)',
                    marginTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <PackageCheck size={18} color="var(--accent-primary)" />
                  Tra cứu đơn hàng
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                  }}
                >
                  Đăng nhập Quản trị Shop
                </Link>

                {/* Mobile Theme Toggle */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                  <button
                    onClick={toggleTheme}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', gap: '6px', justifyContent: 'center' }}
                  >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center' }}>
              © 2026 Anh Thư Sneaker. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
