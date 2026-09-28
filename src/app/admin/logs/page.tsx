'use client';

import React, { useEffect, useState } from 'react';
import { History, Search, ShieldCheck } from 'lucide-react';
import { ActivityLog } from '@/types/settings';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLogs(json.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_id.toLowerCase().includes(search.toLowerCase()) ||
      l.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
          Nhật Ký Hoạt Động & Kiểm Toán ({filtered.length})
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Ghi nhận toàn bộ thao tác sửa đổi đơn hàng, cập nhật kho và thay đổi cài đặt hệ thống.
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Tìm theo hành động, thực thể (ORDER, INVENTORY), mã đối tượng, lý do..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          Đang tải nhật ký...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Chưa có nhật ký hoạt động nào khớp với tìm kiếm.
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>THỜI GIAN</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>NGƯỜI THỰC HIỆN</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>HÀNH ĐỘNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>ĐỐI TƯỢNG (ENTITY)</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>MÃ ĐỐI TƯỢNG</th>
                <th style={{ padding: '14px 16px', fontWeight: 700 }}>LÝ DO & CHI TIẾT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr
                  key={log.log_id}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {log.user_id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      className={
                        log.action === 'CREATE'
                          ? 'badge badge-green'
                          : log.action === 'STATUS_CHANGE'
                          ? 'badge badge-blue'
                          : log.action === 'DELETE'
                          ? 'badge badge-rose'
                          : 'badge badge-orange'
                      }
                      style={{ fontSize: '10px' }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.entity}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {log.entity_id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{log.reason}</div>
                    {log.before_state && log.after_state && (
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {log.before_state} → {log.after_state}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
