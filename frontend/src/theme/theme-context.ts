import { createContext } from "react";

import { Theme } from "./types";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType,
);
