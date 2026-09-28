'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, RotateCcw, FileText } from 'lucide-react';
import { ShopSettings } from '@/types/settings';

export default function PolicyPage() {
  const params = useParams();
  const router = useRouter();
  const type = params?.type as string;

  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSettings(json.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const getPolicyDetails = () => {
    switch (type) {
      case 'shipping':
        return {
          title: 'Chính Sách Vận Chuyển',
          icon: <Truck size={24} color="var(--accent-primary)" />,
          content: settings?.SHIPPING_POLICY || 'Chính sách vận chuyển đang được cập nhật.',
        };
      case 'returns':
        return {
          title: 'Chính Sách Đổi Trả & Bảo Hành',
          icon: <RotateCcw size={24} color="var(--accent-primary)" />,
          content: settings?.RETURN_POLICY || 'Chính sách đổi trả đang được cập nhật.',
        };
      case 'privacy':
        return {
          title: 'Chính Sách Bảo Mật Thông Tin',
          icon: <ShieldCheck size={24} color="var(--accent-primary)" />,
          content: settings?.PRIVACY_POLICY || 'Chính sách bảo mật đang được cập nhật.',
        };
      case 'terms':
      default:
        return {
          title: 'Điều Khoản Dịch Vụ',
          icon: <FileText size={24} color="var(--accent-primary)" />,
          content: settings?.TERMS || 'Điều khoản dịch vụ đang được cập nhật.',
        };
    }
  };

  const details = getPolicyDetails();

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <button
          onClick={() => router.back()}
          className="btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '36px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              {details.icon}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
              {details.title}
            </h1>
          </div>

          <div
            style={{
              fontSize: '15px',
              color: 'var(--text-muted)',
              lineHeight: '1.8',
              whiteSpace: 'pre-line',
            }}
          >
            {details.content}
          </div>
        </div>
      </div>
    </div>
  );
}
