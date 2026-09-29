'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Loader2, Check, RefreshCw, Edit3 } from 'lucide-react';
import { INITIAL_PROVINCES, AdministrativeItem } from '@/data/vietnamProvinces';

interface VietnamAddressSelectProps {
  city: string;
  district: string;
  ward: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  onWardChange: (ward: string) => void;
  required?: boolean;
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  options: AdministrativeItem[];
  loading?: boolean;
  disabled?: boolean;
  onSelect: (item: AdministrativeItem) => void;
  emptyText?: string;
  required?: boolean;
}

function SearchableDropdown({
  label,
  placeholder,
  value,
  options,
  loading = false,
  disabled = false,
  onSelect,
  emptyText = 'Không tìm thấy kết quả',
  required = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const cleanQuery = removeVietnameseTones(searchQuery);
    return options.filter((item) => removeVietnameseTones(item.name).includes(cleanQuery));
  }, [options, searchQuery]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '5px',
          color: 'var(--text-main)',
        }}
      >
        {label} {required && <span style={{ color: '#f43f5e' }}>*</span>}
      </label>

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: disabled ? 'rgba(255, 255, 255, 0.03)' : 'var(--bg-surface)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: value ? 'var(--text-main)' : 'var(--text-dim)',
          fontSize: '13px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'left',
          transition: 'border-color 0.2s, background 0.2s',
          minHeight: '42px',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: '8px',
            fontWeight: value ? 500 : 400,
          }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Đang tải...
            </span>
          ) : (
            value || placeholder
          )}
        </span>

        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
          {loading ? (
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <ChevronDown
              size={16}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          )}
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Search bar inside dropdown */}
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '4px' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Gõ để tìm nhanh..."
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                color: 'var(--text-main)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
                if (e.key === 'Enter' && filteredOptions.length > 0) {
                  e.preventDefault();
                  onSelect(filteredOptions[0]);
                  setIsOpen(false);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Xóa
              </button>
            )}
          </div>

          {/* Options list */}
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                }}
              >
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((item) => {
                const isSelected = item.name === value;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{item.name}</span>
                    {isSelected && <Check size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VietnamAddressSelect({
  city,
  district,
  ward,
  onCityChange,
  onDistrictChange,
  onWardChange,
  required = true,
}: VietnamAddressSelectProps) {
  const [provinces, setProvinces] = useState<AdministrativeItem[]>(INITIAL_PROVINCES);
  const [districts, setDistricts] = useState<AdministrativeItem[]>([]);
  const [wards, setWards] = useState<AdministrativeItem[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [manualMode, setManualMode] = useState(false);

  // In-memory cache for fast switching
  const districtCache = useRef<Record<number, AdministrativeItem[]>>({});
  const wardCache = useRef<Record<number, AdministrativeItem[]>>({});

  // 1. Fetch full provinces list on mount if needed
  useEffect(() => {
    let isMounted = true;
    async function loadProvinces() {
      // Check session storage first
      try {
        const cached = sessionStorage.getItem('vn_provinces');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProvinces(parsed);
            return;
          }
        }
      } catch (e) {
        // Ignore storage errors
      }

      setLoadingProvinces(true);
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        if (!res.ok) throw new Error('Failed to load provinces');
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProvinces(data);
          try {
            sessionStorage.setItem('vn_provinces', JSON.stringify(data));
          } catch (e) {}
        }
      } catch (err) {
        // Fallback to INITIAL_PROVINCES already set
        console.warn('Using fallback provinces data', err);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    }

    loadProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Whenever city changes, fetch districts
  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setWards([]);
      return;
    }

    const currentProvince = provinces.find((p) => p.name === city);
    if (!currentProvince) return;

    // Check cache
    if (districtCache.current[currentProvince.code]) {
      setDistricts(districtCache.current[currentProvince.code]);
      return;
    }

    let isMounted = true;
    async function loadDistricts(provinceCode: number) {
      setLoadingDistricts(true);
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        if (!res.ok) throw new Error('Failed to load districts');
        const data = await res.json();
        if (isMounted && data && Array.isArray(data.districts)) {
          districtCache.current[provinceCode] = data.districts;
          setDistricts(data.districts);
        }
      } catch (err) {
        console.warn('Failed to fetch districts', err);
      } finally {
        if (isMounted) setLoadingDistricts(false);
      }
    }

    loadDistricts(currentProvince.code);
    return () => {
      isMounted = false;
    };
  }, [city, provinces]);

  // 3. Whenever district changes, fetch wards
  useEffect(() => {
    if (!district) {
      setWards([]);
      return;
    }

    const currentDistrict = districts.find((d) => d.name === district);
    if (!currentDistrict) return;

    // Check cache
    if (wardCache.current[currentDistrict.code]) {
      setWards(wardCache.current[currentDistrict.code]);
      return;
    }

    let isMounted = true;
    async function loadWards(districtCode: number) {
      setLoadingWards(true);
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        if (!res.ok) throw new Error('Failed to load wards');
        const data = await res.json();
        if (isMounted && data && Array.isArray(data.wards)) {
          wardCache.current[districtCode] = data.wards;
          setWards(data.wards);
        }
      } catch (err) {
        console.warn('Failed to fetch wards', err);
      } finally {
        if (isMounted) setLoadingWards(false);
      }
    }

    loadWards(currentDistrict.code);
    return () => {
      isMounted = false;
    };
  }, [district, districts]);

  // Handle Province Select
  const handleSelectCity = (p: AdministrativeItem) => {
    if (p.name !== city) {
      onCityChange(p.name);
      onDistrictChange('');
      onWardChange('');
      setDistricts([]);
      setWards([]);
    }
  };

  // Handle District Select
  const handleSelectDistrict = (d: AdministrativeItem) => {
    if (d.name !== district) {
      onDistrictChange(d.name);
      onWardChange('');
      setWards([]);
    }
  };

  // Handle Ward Select
  const handleSelectWard = (w: AdministrativeItem) => {
    onWardChange(w.name);
  };

  if (manualMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
          <button
            type="button"
            onClick={() => setManualMode(false)}
            style={{
              fontSize: '11px',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            <RefreshCw size={12} /> Chọn từ danh mục chuẩn (Khuyên dùng)
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Tỉnh / Thành phố {required && <span style={{ color: '#f43f5e' }}>*</span>}
            </label>
            <input
              type="text"
              required={required}
              placeholder="VD: TP. Hồ Chí Minh"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Quận / Huyện {required && <span style={{ color: '#f43f5e' }}>*</span>}
            </label>
            <input
              type="text"
              required={required}
              placeholder="VD: Quận 1"
              value={district}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Phường / Xã {required && <span style={{ color: '#f43f5e' }}>*</span>}
            </label>
            <input
              type="text"
              required={required}
              placeholder="VD: Phường Bến Nghé"
              value={ward}
              onChange={(e) => onWardChange(e.target.value)}
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setManualMode(true)}
          style={{
            fontSize: '11px',
            color: 'var(--text-dim)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
          title="Nếu không tìm thấy địa chỉ của bạn trong danh sách"
        >
          <Edit3 size={11} /> Nhập tay nếu cần
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* Level 1: Tỉnh / Thành phố */}
        <SearchableDropdown
          label="Tỉnh / Thành phố"
          placeholder="Chọn Tỉnh / TP"
          value={city}
          options={provinces}
          loading={loadingProvinces}
          onSelect={handleSelectCity}
          required={required}
        />

        {/* Level 2: Quận / Huyện */}
        <SearchableDropdown
          label="Quận / Huyện"
          placeholder={city ? 'Chọn Quận / Huyện' : 'Chọn Tỉnh trước'}
          value={district}
          options={districts}
          loading={loadingDistricts}
          disabled={!city}
          onSelect={handleSelectDistrict}
          emptyText={loadingDistricts ? 'Đang tải quận huyện...' : 'Vui lòng chọn Tỉnh/Thành trước'}
          required={required}
        />

        {/* Level 3: Phường / Xã */}
        <SearchableDropdown
          label="Phường / Xã"
          placeholder={district ? 'Chọn Phường / Xã' : 'Chọn Quận trước'}
          value={ward}
          options={wards}
          loading={loadingWards}
          disabled={!district}
          onSelect={handleSelectWard}
          emptyText={loadingWards ? 'Đang tải phường xã...' : 'Vui lòng chọn Quận/Huyện trước'}
          required={required}
        />
      </div>
    </div>
  );
}
