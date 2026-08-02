import React from 'react';

/**
 * FilterDropdown – generic dropdown used for filtering.
 * Props:
 *   label: string – visible label before the select
 *   options: { value: string; label: string }[] – dropdown items
 *   value: string – currently selected value
 *   onChange: (value: string) => void – callback when selection changes
 */
const FilterDropdown = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>}
      <select
        className="bg-input border border-border rounded-xl text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-body"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
