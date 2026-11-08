// Verifies the built package the way a consumer would see it:
// every path in package.json "exports" exists, and the entry point loads and
// exposes the public API. Run after `npm run build:lib`.
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const problems = [];

for (const [subpath, target] of Object.entries(pkg.exports)) {
  const files = typeof target === "string" ? [target] : Object.values(target);
  for (const file of files) {
    if (!existsSync(new URL(`../${file}`, import.meta.url)))
      problems.push(`exports["${subpath}"] points to missing ${file}`);
  }
}

const api = await import(new URL(`../${pkg.exports["."].import}`, import.meta.url).href);
const expected = [
  "Button",
  "TextField",
  "Select",
  "Checkbox",
  "Tabs",
  "Dialog",
  "ToastProvider",
  "useToast",
  "DataTable",
  "ThemeProvider",
  "useTheme",
  "colors",
];
for (const name of expected) {
  if (!(name in api)) problems.push(`missing export ${name}`);
}

if (problems.length > 0) {
  process.stderr.write(`${problems.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(
  `Package OK: ${Object.keys(api).length} exports, ${Object.keys(pkg.exports).length} export paths.\n`,
);
