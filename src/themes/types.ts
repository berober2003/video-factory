export type Theme = {
  name: string;
  background: string;
  backgroundAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  accentAlt: string;
  fontHeading: string;
  fontBody: string;
  fontMono: string;
  borderRadius: number;
  grain: boolean;
  vignette: boolean;
};

import { neutral } from "./neutral";
import { ember } from "./ember";

const themes: Record<string, Theme> = {
  neutral,
  ember,
};

export const getTheme = (name: string): Theme => {
  const theme = themes[name];
  if (!theme) {
    throw new Error(
      `Unknown theme "${name}". Available: ${Object.keys(themes).join(", ")}`
    );
  }
  return theme;
};

export const useTheme = (name: string): Theme => {
  return getTheme(name);
};
