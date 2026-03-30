/**
 * ThemeProvider — Production theme system.
 *
 * - Light default, dark supported, system preference detection
 * - User preference stored in localStorage (database-ready)
 * - Pro visual differentiation via CSS custom properties
 * - Extendable to unlimited themes
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { SubscriptionPlan } from "@/types/subscription";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "spacear-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  userPlan,
}: {
  children: ReactNode;
  defaultTheme?: Theme;
  userPlan?: SubscriptionPlan;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme;
  });
  const [isPro, setIsPro] = useState(userPlan === "pro");
  const resolvedTheme = resolveTheme(theme);

  // Apply theme class + pro data attribute to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    if (isPro) {
      root.setAttribute("data-plan", "pro");
    } else {
      root.removeAttribute("data-plan");
    }
  }, [resolvedTheme, isPro]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setThemeState("system"); // triggers re-resolve
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isPro, setIsPro }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
