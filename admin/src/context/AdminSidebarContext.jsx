import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const ADMIN_SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';
export const SIDEBAR_WIDTH_EXPANDED = 280;
export const SIDEBAR_WIDTH_COLLAPSED = 84;

const AdminSidebarContext = createContext(null);

function readCollapsedFromStorage() {
  try {
    return localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AdminSidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(readCollapsedFromStorage);

  const setCollapsedPersisted = useCallback((value) => {
    setCollapsed(value);
    try {
      localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      setCollapsed: setCollapsedPersisted,
      sidebarWidth,
    }),
    [collapsed, toggleCollapsed, setCollapsedPersisted, sidebarWidth]
  );

  return (
    <AdminSidebarContext.Provider value={value}>{children}</AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext);
  if (!ctx) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return ctx;
}
