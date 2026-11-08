# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-10-21

### Fixed

- Tabs: if the selected id is unknown, disabled, or removed, the first enabled tab now takes the tab stop. Before, every tab could end up at `tabIndex=-1`, and ArrowLeft jumped to the wrong tab.
- Dialog: the focus loop ignores hidden, disabled, and inert controls, so Tab on the last visible control wraps correctly.

### Changed

- Dialog: the rest of the page is `inert` while a dialog is open, and is restored on close.

### Added

- Prettier (120-column lines) with `format` and `format:check` scripts, checked in CI.

## [1.0.0] - 2026-10-17

### Added

- Design tokens as CSS custom properties with a typed TypeScript mirror; light and dark palettes that meet WCAG AA, verified by tests.
- Components: Button, TextField, Select, Checkbox, Tabs, Dialog, Toast (provider and hook), DataTable, Badge, Spinner, Skeleton, VisuallyHidden.
- ThemeProvider with light, dark, and system modes.
- Documentation site with live examples, props tables, keyboard tables, and accessibility notes.
- Unit, component, package, and browser tests; GitHub Actions CI.
