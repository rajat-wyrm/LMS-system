import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DateRangeContext = createContext(null);

export const DATE_PRESETS = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7: 'Last 7 Days',
  last30: 'Last 30 Days',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  custom: 'Custom Range',
};

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getPresetRange(preset) {
  const now = new Date();
  const todayStart = startOfDay(now);

  switch (preset) {
    case 'today':
      return { start: todayStart, end: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(todayStart);
      y.setDate(y.getDate() - 1);
      return { start: y, end: endOfDay(y) };
    }
    case 'last7': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { start, end: endOfDay(now) };
    }
    case 'last30': {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { start, end: endOfDay(now) };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: startOfDay(start), end: endOfDay(end) };
    }
    default:
      return getPresetRange('last7');
  }
}

export function formatDateRange(start, end) {
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function daysInRange(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Scale mock metrics by selected range vs a 30-day baseline */
export function rangeScaleFactor(start, end) {
  return daysInRange(start, end) / 30;
}

export function DateRangeProvider({ children }) {
  const defaultRange = getPresetRange('last7');
  const [preset, setPreset] = useState('last7');
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const applyPreset = useCallback((nextPreset) => {
    if (nextPreset === 'custom') {
      setPreset('custom');
      return;
    }
    const { start, end } = getPresetRange(nextPreset);
    setPreset(nextPreset);
    setStartDate(start);
    setEndDate(end);
  }, []);

  const setCustomRange = useCallback((start, end) => {
    setPreset('custom');
    setStartDate(startOfDay(start));
    setEndDate(endOfDay(end));
  }, []);

  const label = useMemo(
    () => formatDateRange(startDate, endDate),
    [startDate, endDate]
  );

  const scaleFactor = useMemo(
    () => rangeScaleFactor(startDate, endDate),
    [startDate, endDate]
  );

  const value = useMemo(
    () => ({
      preset,
      startDate,
      endDate,
      label,
      scaleFactor,
      applyPreset,
      setCustomRange,
    }),
    [preset, startDate, endDate, label, scaleFactor, applyPreset, setCustomRange]
  );

  return (
    <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) {
    throw new Error('useDateRange must be used within DateRangeProvider');
  }
  return ctx;
}

export default DateRangeContext;
