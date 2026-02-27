import { type PropsWithChildren, useEffect, useState } from "react";

import { ThemeContext } from "./theme-context";
import type { Theme } from "./types";

const THEME_STORAGE_KEY = "naute_theme";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const persistedTheme = localStorage.getItem(
      THEME_STORAGE_KEY,
    ) as Theme | null;

    return persistedTheme ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previousState) => (previousState === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
