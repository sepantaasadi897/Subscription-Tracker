"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "subtrack-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The blocking script in the document head (see layout.tsx) already
  // applies the right class before paint, so we just sync React state.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    setThemeState(initial);
  }, []);

  function applyTheme(next: Theme) {
    const root = document.documentElement;
    if (next === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }

  function setTheme(next: Theme) {
    applyTheme(next);
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
