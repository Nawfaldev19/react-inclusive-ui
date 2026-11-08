// Typed mirror of tokens.css, for code that needs token values in JavaScript
// (for example, canvas drawing or inline styles computed at runtime).

export const fontFamily = {
  display: '"Fraunces", Georgia, serif',
  body: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.563rem",
  "2xl": "1.953rem",
  "3xl": "2.441rem",
} as const;

export const space = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
} as const;

export const radius = { sm: "4px", md: "8px", lg: "14px", pill: "999px" } as const;

export const duration = { fast: "120ms", base: "200ms" } as const;

export const colorRoles = [
  "bg",
  "surface",
  "surface-sunken",
  "border",
  "text",
  "text-muted",
  "accent",
  "accent-contrast",
  "success",
  "danger",
  "warning",
  "focus",
] as const;

export type ColorRole = (typeof colorRoles)[number];
export type ThemeName = "light" | "dark";

export const colors: Record<ThemeName, Record<ColorRole, string>> = {
  light: {
    bg: "#faf7f2",
    surface: "#ffffff",
    "surface-sunken": "#f1ece3",
    border: "#ddd5c8",
    text: "#1c1b19",
    "text-muted": "#5e5950",
    accent: "#b4532a",
    "accent-contrast": "#ffffff",
    success: "#2f6b4f",
    danger: "#b42318",
    warning: "#8a5a00",
    focus: "#2457c5",
  },
  dark: {
    bg: "#1c1b19",
    surface: "#262522",
    "surface-sunken": "#151412",
    border: "#3a3833",
    text: "#f3efe7",
    "text-muted": "#b3aca0",
    accent: "#f08a5d",
    "accent-contrast": "#1c1b19",
    success: "#7cc4a0",
    danger: "#f59a8f",
    warning: "#e8b85c",
    focus: "#8db0ff",
  },
};

/** CSS custom property reference for a color role, e.g. `cssVar("accent")` → `var(--color-accent)`. */
export function cssVar(role: ColorRole): string {
  return `var(--color-${role})`;
}
