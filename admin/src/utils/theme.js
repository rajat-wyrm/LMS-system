const STORAGE_KEY = 'theme';

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (stored === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

export function applyTheme(theme) {
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      : theme === 'light'
        ? 'light'
        : 'dark';

  document.documentElement.classList.toggle('light', resolved === 'light');
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

export function setStoredTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  return applyTheme(theme);
}

export function initTheme() {
  return applyTheme(getStoredTheme());
}
