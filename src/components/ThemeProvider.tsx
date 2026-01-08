"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider - Wraps the app with next-themes context
 *
 * Features:
 * - Dark mode by default (dark-first design for 3D visibility)
 * - Persists theme preference to localStorage
 * - Prevents flash of unstyled content (FOUC)
 * - Provides theme toggle functionality via useTheme hook
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
