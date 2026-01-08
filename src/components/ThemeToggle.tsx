"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle - Subtle dark/light mode toggle button
 *
 * Features:
 * - Dark-first design (defaults to dark)
 * - Smooth icon transitions
 * - Glass morphism styling
 * - Accessible with keyboard navigation
 * - Prevents flash with mounted state
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent flash of incorrect icon during SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="
          w-10 h-10 rounded-lg
          bg-white/5 border border-white/10
          flex items-center justify-center
        "
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        relative group
        w-10 h-10 rounded-lg
        bg-white/5 hover:bg-white/10
        border border-white/10 hover:border-primary/50
        flex items-center justify-center
        transition-all duration-300
        hover:shadow-glow-primary/20
      "
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon for light mode (shown in dark mode) */}
      <Sun
        className={`
          absolute w-5 h-5
          transition-all duration-500 ease-out-expo
          ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }
          text-foreground-muted group-hover:text-primary
        `}
      />

      {/* Moon icon for dark mode (shown in light mode) */}
      <Moon
        className={`
          absolute w-5 h-5
          transition-all duration-500 ease-out-expo
          ${
            !isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }
          text-foreground-muted group-hover:text-primary
        `}
      />

      {/* Hover glow effect */}
      <span
        className="
          absolute inset-0 rounded-lg
          opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-primary/10 to-accent-pink/10
          transition-opacity duration-300
        "
      />
    </button>
  );
}
