# Architecture decision records

## ADR-001: Plain CSS with custom properties

**Context.** Component libraries style with CSS-in-JS, utility classes, CSS modules, or plain CSS.

**Decision.** Plain CSS with `th-` prefixed classes, driven entirely by custom properties from `tokens.css`.

**Consequences.** Zero runtime cost, no peer dependency on a styling system, and theming by flipping one attribute. Consumers must import one stylesheet. Class names are global, so the prefix is required to avoid collisions.

## ADR-002: Wrap native controls instead of rebuilding them

**Context.** Custom selects and checkboxes look consistent across browsers but must re-implement keyboard, focus, mobile, and screen reader behavior.

**Decision.** `Select` and `Checkbox` are styled native elements. I left out a custom combobox: it is the one place a native control falls short, and doing it well is a project of its own.

**Consequences.** Robust accessibility with little code. The open select menu keeps the platform's look.

## ADR-003: Custom focus handling for the dialog instead of `<dialog>`

**Context.** The native `<dialog>` element with `showModal()` provides a top layer and inertness, and support is now broad. Its focus-return and scroll behavior still differ across browsers, and the test environment used here (jsdom) does not implement it.

**Decision.** A portal-rendered `role="dialog"` with `aria-modal`, an explicit focus loop, focus return, and scroll lock. While it is open, every other child of `<body>` gets the `inert` attribute; on close, only the elements the dialog changed are restored, so an element that was already inert (or a stacked dialog) is left alone. The focus loop counts only controls a browser would actually focus: it skips anything disabled (including inside a disabled `<fieldset>`), under `hidden` or `inert`, or hidden with `display: none` or `visibility: hidden`.

**Consequences.** Behavior is identical everywhere and fully unit-testable. `aria-modal` alone is not enough for some screen readers, so `inert` is what keeps their virtual cursor out of the background. It is lifted in a layout effect, in the same commit that removes the dialog, so a toast raised by the closing action is still announced. A toast raised while the dialog stays open is not, because the toast regions are inside the inert app root (listed as a limitation). Switching to native `<dialog>` later would mostly delete code.

## ADR-004: Pre-rendered live regions for toasts

**Context.** A toast element with `role="status"` inserted into the page is announced inconsistently, because some screen readers only watch regions that existed before the change.

**Decision.** Two hidden live regions are rendered when the provider mounts; announcements are written into them. Danger toasts use the assertive region.

**Consequences.** Reliable announcements. The visible toast and the announcement are separate elements, so their text must be kept in sync (both come from the same toast record).

## ADR-005: Tokens tested, not just documented

**Context.** Token values live in CSS (for styling) and are useful in TypeScript (for canvas drawing or computed styles). Two copies drift. Contrast claims in documentation also drift.

**Decision.** Keep both copies, and test that they match. Compute WCAG contrast in a test for every pair the components render.

**Consequences.** A palette change that breaks contrast fails CI. The contrast list must be updated when a component starts using a new pair.

## ADR-006: No accessibility scanner dependency

**Context.** The most common automated accessibility engine is licensed under MPL-2.0, and the popular JSX accessibility lint plugin depends on it. This project accepts only permissive licenses (MIT, Apache-2.0, BSD, ISC).

**Decision.** Do not depend on either. Test accessibility directly: query by role and accessible name, assert ARIA state, and drive keyboard interaction in unit and browser tests.

**Consequences.** Tests are more specific than a generic scan and document the intended behavior, but they will not catch issues nobody thought to test. Running a scanner manually during review is still recommended.

## ADR-007: Documentation site built from source

**Context.** The site could consume the built package or the source.

**Decision.** The site imports from `src/` (with the stylesheets imported explicitly, as an app would), while `scripts/check-package.mjs` separately verifies the built package.

**Consequences.** Instant feedback while developing components. The packaging path is still covered in CI by the package check.

## ADR-008: Playwright pinned to 1.49.1

**Context.** Newer Playwright releases do not ship browsers for macOS 13, the machine this was developed on.

**Decision.** Pin `@playwright/test` to 1.49.1.

**Consequences.** Works on that machine and on CI. Upgrading is a one-line change when the development machine allows it.
