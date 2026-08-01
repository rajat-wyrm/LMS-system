import React from 'react';
import { MdSearch, MdFilterList } from 'react-icons/md';
import { FILTERS } from './constants';

const NotificationsToolbar = ({ search, onSearchChange, filter, onFilterChange, counts = {} }) => {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border p-3 shadow-[var(--admin-shadow-card)] lg:flex-row lg:items-center lg:justify-between"
      style={{
        borderColor: 'var(--admin-border)',
        background: 'var(--admin-surface)',
      }}
    >
      <div className="relative flex-1 max-w-md">
        <MdSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 admin-text-muted"
          size={18}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notifications…"
          className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm admin-text-primary placeholder:admin-text-muted focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
          style={{
            borderColor: 'var(--admin-input-border)',
            background: 'var(--admin-input-bg)',
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <MdFilterList className="mr-0.5 admin-text-muted" size={16} />
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilterChange(f)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
              filter === f
                ? 'text-white shadow-md'
                : 'admin-text-muted hover:bg-[var(--admin-surface-hover)] hover:admin-text-primary'
            }`}
            style={
              filter === f
                ? { background: 'linear-gradient(135deg, #14B8A6, #8B5CF6)' }
                : undefined
            }
          >
            {f}
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums leading-none"
              style={{
                background: filter === f ? 'rgba(255,255,255,0.25)' : 'var(--admin-stat-pill-bg)',
                color: filter === f ? '#fff' : 'inherit',
              }}
            >
              {counts[f] ?? 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationsToolbar;
