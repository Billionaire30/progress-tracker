"use client";

import { useApp } from "@/lib/context";
import { useEffect } from "react";

// Helper to convert hex to HSL
function hexToHSL(hex: string): string {
  let r = 0, g = 0, b = 0;

  // Handle hex shorthand (e.g., #fff)
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

// Helper to determine if a color is light
function isLightColor(hex: string): boolean {
  let r = 0, g = 0, b = 0;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { data } = useApp();

  useEffect(() => {
    if (data.theme && data.theme.colors) {
      const root = document.documentElement;
      const { colors } = data.theme;

      // Apply custom colors as CSS variables
      root.style.setProperty("--background", hexToHSL(colors.background));
      root.style.setProperty("--foreground", hexToHSL(colors.foreground));
      root.style.setProperty("--primary", hexToHSL(colors.primary));
      root.style.setProperty("--primary-foreground", isLightColor(colors.primary) ? "0 0% 0%" : "0 0% 100%");
      root.style.setProperty("--secondary", hexToHSL(colors.secondary));
      root.style.setProperty("--secondary-foreground", isLightColor(colors.secondary) ? "0 0% 0%" : "0 0% 100%");
      root.style.setProperty("--accent", hexToHSL(colors.accent));
      root.style.setProperty("--accent-foreground", isLightColor(colors.accent) ? "0 0% 0%" : "0 0% 100%");
      root.style.setProperty("--card", hexToHSL(colors.background));
      root.style.setProperty("--card-foreground", hexToHSL(colors.foreground));
      root.style.setProperty("--popover", hexToHSL(colors.background));
      root.style.setProperty("--popover-foreground", hexToHSL(colors.foreground));
      root.style.setProperty("--muted", hexToHSL(colors.background));
      root.style.setProperty("--muted-foreground", hexToHSL(colors.foreground));
      root.style.setProperty("--border", hexToHSL(colors.primary));
      root.style.setProperty("--input", hexToHSL(colors.primary));
      root.style.setProperty("--ring", hexToHSL(colors.primary));
    }
  }, [data.theme]);

  return <>{children}</>;
}
