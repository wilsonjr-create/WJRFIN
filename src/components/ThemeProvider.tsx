
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme =
  | "champagne"
  | "emerald"
  | "midnight"
  | "ocean"
  | "rose";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

const themes: Theme[] = [
  "champagne",
  "emerald",
  "midnight",
  "ocean",
  "rose",
];

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("champagne");

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme;

    const initialTheme =
      current && themes.includes(current as Theme)
        ? (current as Theme)
        : "champagne";

    queueMicrotask(() => setThemeState(initialTheme));
  }, []);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);

    document.documentElement.dataset.theme =
      nextTheme;

    localStorage.setItem(
      "wjrfin-theme",
      nextTheme
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
