import React from 'react';

/**
 * FilterDropdown – generic dropdown used for filtering students.
 * Props:
 *   label: string – visible label before the select
 *   options: { value: string; label: string }[] – dropdown items
 *   value: string – currently selected value
 *   onChange: (value: string) => void – callback when selection changes
 */
const FilterDropdown = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#9CA3AF] mb-1">{label}</label>
      <select
        className="bg-[#111827] border border-[rgba(255,255,255,0.06)] rounded-md text-[#E5E7EB] px-3 py-1.5 focus:outline-none focus:border-[#22D3EE] focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
