"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "theme";

export {};

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      setTitleBarTheme: (isDark: boolean) => Promise<void>;
    };
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.electronAPI?.setTitleBarTheme?.(theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const initial: Theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className="theme-toggle"
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 3v1.6M12 19.4V21M4.93 4.93l1.13 1.13M17.94 17.94l1.13 1.13M3 12h1.6M19.4 12H21M4.93 19.07l1.13-1.13M17.94 6.06l1.13-1.13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.2A8.2 8.2 0 0 1 9.8 4 7.2 7.2 0 1 0 20 14.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}