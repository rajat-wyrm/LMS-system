import React, { useEffect, useRef, useState } from 'react';
import { MdDateRange } from 'react-icons/md';
import {
  DATE_PRESETS,
  useDateRange,
} from '../../../context/DateRangeContext';

const PRESET_KEYS = Object.keys(DATE_PRESETS).filter((k) => k !== 'custom');

const DateRangePicker = () => {
  const { label, preset, applyPreset, setCustomRange } = useDateRange();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const handlePreset = (key) => {
    if (key === 'custom') {
      setShowCustom(true);
      applyPreset('custom');
      return;
    }
    setShowCustom(false);
    applyPreset(key);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (start > end) return;
    setCustomRange(start, end);
    setOpen(false);
    setShowCustom(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[var(--admin-text-muted)] text-xs border rounded-lg px-3 py-1.5 bg-[var(--admin-input-bg)] border-[var(--admin-input-border)] hover:text-[var(--admin-text-primary)] hover:border-[#7C3AED]/40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2 transition-all"
      >
        <span>{label}</span>
        <MdDateRange size={14} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Date range presets"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-2xl z-50 py-1 bg-[var(--admin-surface-raised)] border-[var(--admin-border)] backdrop-blur-xl"
        >
          {PRESET_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={preset === key}
              onClick={() => handlePreset(key)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                preset === key
                  ? 'bg-[#7C3AED]/15 text-[#7C3AED] font-semibold'
                  : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text-primary)]'
              }`}
            >
              {DATE_PRESETS[key]}
            </button>
          ))}
          <button
            type="button"
            role="option"
            aria-selected={preset === 'custom'}
            onClick={() => handlePreset('custom')}
            className={`w-full text-left px-3 py-2 text-xs border-t border-[var(--admin-border-subtle)] transition-colors ${
              preset === 'custom'
                ? 'bg-[#7C3AED]/15 text-[#7C3AED] font-semibold'
                : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-hover)]'
            }`}
          >
            {DATE_PRESETS.custom}
          </button>

          {(showCustom || preset === 'custom') && (
            <div className="px-3 py-2 space-y-2 border-t border-[var(--admin-border-subtle)]">
              <label className="block text-[10px] text-[var(--admin-text-muted)]">
                From
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="mt-0.5 w-full text-xs rounded-lg px-2 py-1 border bg-[var(--admin-input-bg)] border-[var(--admin-input-border)] text-[var(--admin-text-primary)]"
                />
              </label>
              <label className="block text-[10px] text-[var(--admin-text-muted)]">
                To
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="mt-0.5 w-full text-xs rounded-lg px-2 py-1 border bg-[var(--admin-input-bg)] border-[var(--admin-input-border)] text-[var(--admin-text-primary)]"
                />
              </label>
              <button
                type="button"
                onClick={applyCustom}
                className="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
