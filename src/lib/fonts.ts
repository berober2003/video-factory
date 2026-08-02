// Using Google Fonts loaded via @font-face in TailwindCSS
// For now, fonts are loaded via CSS. This file provides
// font family constants for use in inline styles.

export const FONTS = {
  heading: {
    inter: "Inter, system-ui, sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
  },
  body: {
    inter: "Inter, system-ui, sans-serif",
  },
  mono: {
    jetbrains: "'JetBrains Mono', monospace",
  },
} as const;

// Resolve a theme's font name to a CSS font-family string
export const resolveFontFamily = (fontName: string): string => {
  switch (fontName) {
    case "Playfair Display":
      return FONTS.heading.playfair;
    case "Inter":
      return FONTS.heading.inter;
    case "JetBrains Mono":
      return FONTS.mono.jetbrains;
    default:
      return fontName;
  }
};
