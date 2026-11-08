# Testing

## Strategy

Tests use the component the way a person would: find it by role and accessible name, type, click, and press keys, then assert what changed on screen or in the accessibility tree. No test checks implementation details such as internal state or class names, except where the class is the documented contract (badge tones, visually hidden caption).

| Layer | Tool | What it proves |
|---|---|---|
| Pure utilities | Vitest | Contrast math against WCAG reference values; stable sorting with natural number order and empty values last. |
| Tokens | Vitest | `tokens.ts` matches `tokens.css` exactly; every rendered color pair meets WCAG AA in both themes. |
| Components | Vitest + Testing Library + user-event | Keyboard patterns, focus movement, ARIA attributes, accessible names and descriptions, timers, controlled and uncontrolled modes. |
| Package | Node script | Every `exports` path exists after a build; the entry point loads and exposes the public API. |
| Browser | Playwright against the built docs site | Real focus and keyboard behavior, theme persistence across reloads, no horizontal scroll on a phone-sized screen. |

## Notable cases

- **Dialog:** focus enters on open; Tab and Shift+Tab wrap; the wrap ignores hidden (`hidden`, `display: none`, `visibility: hidden`), disabled (including a disabled `<fieldset>`), and inert controls; with only one focusable element, Tab stays on it; Escape closes and returns focus to the opener; backdrop clicks close unless disabled; scroll lock restores the previous value; siblings of the dialog are `inert` while it is open and restored on close, without clearing an `inert` that was already there. A browser test confirms that inert background controls cannot take focus.
- **Tabs:** roving tabindex (Tab moves from the selected tab into the panel); arrows wrap and skip disabled tabs; Home and End; controlled mode; when the selected id is unknown, disabled, or removed, the first enabled tab takes the tab stop and the arrows move from it; with every tab disabled, keys are ignored.
- **Toast:** polite versus assertive announcements; auto-dismiss at exactly the duration; hover and keyboard focus pause the timer and resume with the remaining time; queue beyond the visible limit; persistent toasts.
- **DataTable:** `aria-sort` on the sorted header only; direction toggling; switching columns resets to ascending; empty values last; loading rows with `aria-busy`; empty state spanning all columns.
- **ThemeProvider:** follows live system changes; persists choices; ignores invalid stored values; works without `matchMedia` or storage; removes its listener on unmount.

## Running

```bash
npm run test:coverage   # 113 tests
npm run test:package    # after npm run build
npm run test:e2e        # 8 Playwright tests
```

## Coverage (last run)

| Metric | Result | Threshold |
|---|---|---|
| Lines | 99% | 90% |
| Branches | 94% | 85% |
| Functions | 100% | 90% |

## Known gaps

- **`index.ts` is excluded from coverage.** It only re-exports; `check-package.mjs` verifies the exports.
- **Two defensive branches are uncovered:** the dialog's Tab handler guard for "no focusable elements" (the close button is always present, so it cannot occur through the public API) and fallback values in the contrast parser that satisfy strict index typing.
- **The documentation site has no unit tests.** It is exercised by the Playwright suite.
- **No automated accessibility scanner.** See [ADR-006](DECISIONS.md#adr-006-no-accessibility-scanner-dependency). Running a scanner manually during review is still a good idea.
- **Screen reader output is not tested automatically.** Announcements are verified by asserting live region content, which is what screen readers read, but not by an actual screen reader.
