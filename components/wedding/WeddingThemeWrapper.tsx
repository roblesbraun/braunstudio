"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, ReactNode } from "react";
import { WeddingTheme, ThemeColors } from "@/templates/types";

interface WeddingThemeWrapperProps {
  theme: WeddingTheme;
  children: ReactNode;
}

/**
 * Converts camelCase to kebab-case for CSS variable names.
 * e.g., "primaryForeground" -> "primary-foreground"
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Applies per-wedding CSS variable overrides within a scoped wrapper.
 * This does NOT modify the global :root styles.
 */
export function WeddingThemeWrapper({
  theme,
  children,
}: WeddingThemeWrapperProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the appropriate color set based on current theme
  const colors: ThemeColors =
    mounted && resolvedTheme === "dark" ? theme.dark : theme.light;

  // Build inline style object for CSS variable overrides
  const styleOverrides: Record<string, string> = {};

  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      styleOverrides[`--${toKebabCase(key)}`] = value;
    }
  }

  return (
    <div style={styleOverrides} className="contents">
      {children}
    </div>
  );
}

