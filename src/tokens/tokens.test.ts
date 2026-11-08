import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { colorRoles, colors, cssVar, duration, fontSize, radius, space } from "./tokens";
import { contrastRatio } from "../utils/contrast";

// Vitest runs from the package root.
const css = readFileSync(resolve(process.cwd(), "src/tokens/tokens.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} block exists`).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf("}", start));
}

function declared(source: string, name: string): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(source)?.[1]?.trim();
}

describe("tokens.ts mirrors tokens.css", () => {
  it.each(colorRoles)("color %s matches in both themes", (role) => {
    expect(declared(block(":root"), `color-${role}`)).toBe(colors.light[role]);
    expect(declared(block(':root[data-theme="dark"]'), `color-${role}`)).toBe(colors.dark[role]);
  });

  it("type, spacing, radius, and motion scales match", () => {
    const root = block(":root");
    for (const [key, value] of Object.entries(fontSize)) expect(declared(root, `text-${key}`)).toBe(value);
    for (const [key, value] of Object.entries(space)) expect(declared(root, `space-${key}`)).toBe(value);
    for (const [key, value] of Object.entries(radius)) expect(declared(root, `radius-${key}`)).toBe(value);
    for (const [key, value] of Object.entries(duration)) expect(declared(root, `duration-${key}`)).toBe(value);
  });

  it("builds CSS variable references", () => {
    expect(cssVar("accent")).toBe("var(--color-accent)");
  });
});

// Accent text is never placed on surface-sunken: in the light theme that pair is
// only 4.2:1, so the accent badge uses accent-contrast on an accent fill instead.
// Foreground/background pairs the components actually render, with the WCAG AA
// minimum for each: 4.5:1 for text, 3:1 for focus indicators and borders of inputs in error.
const PAIRS: [fg: (typeof colorRoles)[number], bg: (typeof colorRoles)[number], minimum: number][] = [
  ["text", "bg", 4.5],
  ["text", "surface", 4.5],
  ["text", "surface-sunken", 4.5],
  ["text-muted", "bg", 4.5],
  ["text-muted", "surface", 4.5],
  ["text-muted", "surface-sunken", 4.5],
  ["accent", "bg", 4.5],
  ["accent", "surface", 4.5],
  ["accent-contrast", "accent", 4.5],
  ["success", "surface-sunken", 4.5],
  ["danger", "surface", 4.5],
  ["danger", "surface-sunken", 4.5],
  ["warning", "surface-sunken", 4.5],
  ["focus", "bg", 3],
  ["focus", "surface", 3],
];

describe.each(["light", "dark"] as const)("%s theme contrast (WCAG AA)", (theme) => {
  it.each(PAIRS)("%s on %s is at least %d:1", (fg, bg, minimum) => {
    expect(contrastRatio(colors[theme][fg], colors[theme][bg])).toBeGreaterThanOrEqual(minimum);
  });
});
