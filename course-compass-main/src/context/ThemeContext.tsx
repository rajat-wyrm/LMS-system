import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "uptoskills-theme";

const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Keep the learner experience aligned with the admin app and the shared
  // design system: dark is the product default, light is an explicit choice.
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? "dark");

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = theme;

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    window.localStorage.setItem(STORAGE_KEY, resolvedTheme);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => setThemeState(nextTheme);
  const toggleTheme = () => setThemeState((current) => (current === "dark" ? "light" : "dark"));

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
