'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Package,
  Layers,
  Users,
  Tag,
  Settings,
  History,
  Store,
  Menu,
  X,
  CreditCard,
  ArrowUpRight,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  FolderTree,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shopAvatar, setShopAvatar] = useState<string | null>(null);

  // Fetch shop avatar from settings
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.SHOP_AVATAR) {
          setShopAvatar(json.data.SHOP_AVATAR);
        }
      })
      .catch(() => {});
  }, []);

  // If user is on the login page, render children without the admin chrome
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoginPage, isLoading, isAuthenticated, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--accent-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            animation: 'pulse 1.5s infinite',
          }}
        >
          AT
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Đang xác thực quyền quản trị...
        </p>
      </div>
    );
  }

  const menuGroups = [
    {
      group: 'Tổng quan',
      items: [
        { label: 'Bảng điều khiển', href: '/admin', icon: <LayoutDashboard size={18} /> },
        { label: 'Tạo đơn nhanh (POS)', href: '/admin/pos', icon: <CreditCard size={18} /> },
      ],
    },
    {
      group: 'Bán hàng & Đơn hàng',
      items: [
        { label: 'Đơn hàng', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
        { label: 'Khách hàng', href: '/admin/customers', icon: <Users size={18} /> },
        { label: 'Mã giảm giá', href: '/admin/coupons', icon: <Tag size={18} /> },
      ],
    },
    {
      group: 'Kho & Sản phẩm',
      items: [
        { label: 'Tất cả sản phẩm', href: '/admin/products', icon: <Package size={18} /> },
        { label: 'Thêm sản phẩm mới', href: '/admin/products/new', icon: <PlusCircle size={18} /> },
        { label: 'Danh mục sản phẩm', href: '/admin/categories', icon: <FolderTree size={18} /> },
        { label: 'Tồn kho & Điều chỉnh', href: '/admin/inventory', icon: <Layers size={18} /> },
      ],
    },
    {
      group: 'Cấu hình & Nhật ký',
      items: [
        { label: 'Cài đặt cửa hàng', href: '/admin/settings', icon: <Settings size={18} /> },
        { label: 'Nhật ký hoạt động', href: '/admin/logs', icon: <History size={18} /> },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} id="admin-sidebar">
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#fff',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}
            >
              {shopAvatar ? (
                <img src={shopAvatar} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'AT'
              )}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>ANH THƯ ADMIN</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 700 }}>● HỆ THỐNG HOẠT ĐỘNG</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-secondary btn-sm mobile-admin-btn"
            style={{ width: '28px', height: '28px', padding: 0 }}
            aria-label="Đóng menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {menuGroups.map((g, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 6px' }}>
                {g.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {g.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        fontWeight: active ? 700 : 500,
                        color: active ? 'var(--text-main)' : 'var(--text-muted)',
                        background: active ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                        borderLeft: active ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <span style={{ color: active ? 'var(--accent-primary)' : 'inherit' }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Link to Storefront */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              padding: '8px 12px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={16} /> Mở Website Bán Hàng
            </span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main-wrap">
        {/* Admin Header Bar */}
        <header
          style={{
            height: '60px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-secondary btn-sm mobile-admin-btn"
              aria-label="Mở menu quản trị"
            >
              <Menu size={18} />
            </button>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Khu vực Quản trị & Điều hành • Anh Thư Sneaker
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn-secondary btn-sm"
              aria-label="Đổi giao diện sáng/tối"
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              style={{ width: '34px', height: '34px', padding: 0, borderRadius: 'var(--radius-full)' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Admin User Info Profile */}
            <div
              className="hide-on-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderLeft: '1px solid var(--border-subtle)',
                paddingLeft: '14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                }}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AT'}
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.2' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {user?.name || 'Nguyễn Anh Thư'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Chủ shop (Quản trị viên)
                </div>
              </div>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={logout}
              className="btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.25)',
              }}
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={15} />
              <span className="hide-on-mobile">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Dynamic Admin Page Content */}
        <main style={{ flex: 1, padding: '24px clamp(16px, 2.5vw, 32px)' }}>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
