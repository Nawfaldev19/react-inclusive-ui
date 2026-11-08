import { DocSection } from "./DocSection";
import {
  ButtonExample,
  DataTableExample,
  DialogExample,
  FeedbackExample,
  FieldsExample,
  TabsExample,
  ThemeSelect,
  ToastExample,
  TokensExample,
} from "./examples";

const SECTIONS = [
  ["tokens", "Tokens"],
  ["button", "Button"],
  ["fields", "Form fields"],
  ["tabs", "Tabs"],
  ["dialog", "Dialog"],
  ["toast", "Toast"],
  ["data-table", "Data table"],
  ["feedback", "Status and feedback"],
] as const;

export function App() {
  return (
    <div className="layout">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#top">
          Inclusive <span>UI</span>
        </a>
        <div className="site-header__theme">
          <ThemeSelect />
        </div>
      </header>
      <nav className="sidebar" aria-label="Components">
        <ul>
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <main id="content" className="content" tabIndex={-1}>
        <section id="top" className="intro" aria-labelledby="intro-heading">
          <p className="eyebrow">Portfolio demo</p>
          <h1 id="intro-heading">Accessible building blocks for small apps.</h1>
          <p className="lead">
            A React component library with design tokens, built to the WAI-ARIA patterns: managed focus, full keyboard
            support, live-region announcements, and contrast that is checked by tests, not by eye.
          </p>
          <ul className="highlights">
            <li>Focus trap, Escape, and focus return in the dialog.</li>
            <li>Roving tabindex and arrow-key navigation in tabs.</li>
            <li>Toasts announced through pre-rendered live regions, with pause on hover and focus.</li>
            <li>
              Sortable table with <code>aria-sort</code>, stable sorting, and empty values last.
            </li>
            <li>Light, dark, and system themes from one set of tokens.</li>
          </ul>
          <pre className="code">
            <code>{`import { Button, ThemeProvider } from "inclusive-ui";
import "inclusive-ui/styles.css";`}</code>
          </pre>
        </section>

        <DocSection
          id="tokens"
          title="Tokens"
          summary="Colors, type, spacing, radius, shadow, and motion as CSS custom properties with typed mirrors. Switch themes to compare."
          notes={[
            "Every text and background pair the components render meets WCAG AA (4.5:1); a unit test computes the ratios.",
            "The focus ring uses its own blue so it is never confused with the copper accent.",
            "Motion durations drop to zero under prefers-reduced-motion.",
          ]}
        >
          <TokensExample />
        </DocSection>

        <DocSection
          id="button"
          title="Button"
          summary="Four variants, two sizes. While loading, a button ignores clicks but keeps focus, so keyboard users keep their place."
          props={[
            {
              name: "variant",
              type: '"primary" | "secondary" | "ghost" | "danger"',
              defaultValue: '"primary"',
              description: "Visual weight.",
            },
            { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Height and padding." },
            {
              name: "loading",
              type: "boolean",
              defaultValue: "false",
              description: "Shows a spinner, sets aria-busy and aria-disabled, ignores clicks.",
            },
            {
              name: "icon",
              type: "ReactNode",
              description: "Shown before the label. Mark decorative icons aria-hidden.",
            },
            {
              name: "type",
              type: "string",
              defaultValue: '"button"',
              description: "Defaults to button so it never submits a form by accident.",
            },
          ]}
          keyboard={[["Enter / Space", "Activates the button"]]}
        >
          <ButtonExample />
        </DocSection>

        <DocSection
          id="fields"
          title="Form fields"
          summary="TextField, Select, and Checkbox wrap native controls, so autofill, mobile keyboards, and screen readers just work."
          props={[
            { name: "label", type: "string", description: "Required. Rendered as a real <label>." },
            { name: "hint", type: "ReactNode", description: "Help text, linked with aria-describedby." },
            { name: "error", type: "ReactNode", description: "Sets aria-invalid and is read before the hint." },
            {
              name: "required",
              type: "boolean",
              description: "Native required plus a visual marker hidden from screen readers.",
            },
            { name: "options", type: "SelectOption[]", description: "Select only. Each option can be disabled." },
            { name: "indeterminate", type: "boolean", description: "Checkbox only. The mixed state." },
          ]}
          notes={["Submit the form empty to see an error wired to its field."]}
        >
          <FieldsExample />
        </DocSection>

        <DocSection
          id="tabs"
          title="Tabs"
          summary="Arrow keys move focus and selection together. Disabled tabs are skipped and never hold the tab stop."
          props={[
            { name: "items", type: "TabItem[]", description: "id, label, content, and optional disabled." },
            { name: "label", type: "string", description: "Accessible name for the tab list." },
            { name: "selectedId / onSelectedChange", type: "string / (id) => void", description: "Controlled mode." },
            {
              name: "defaultSelectedId",
              type: "string",
              defaultValue: "first enabled",
              description: "Uncontrolled starting tab.",
            },
          ]}
          keyboard={[
            ["→ / ←", "Next or previous tab, wrapping around"],
            ["Home / End", "First or last tab"],
            ["Tab", "Moves from the selected tab into its panel"],
          ]}
        >
          <TabsExample />
        </DocSection>

        <DocSection
          id="dialog"
          title="Dialog"
          summary="A modal for decisions. Destructive confirmations should start focus on the safe choice, as this example does."
          props={[
            { name: "open / onClose", type: "boolean / () => void", description: "Controlled visibility." },
            { name: "title", type: "ReactNode", description: "Becomes the dialog's accessible name." },
            { name: "description", type: "ReactNode", description: "Becomes the accessible description." },
            {
              name: "initialFocusRef",
              type: "RefObject",
              defaultValue: "first focusable",
              description: "Where focus goes on open.",
            },
            {
              name: "closeOnBackdropClick",
              type: "boolean",
              defaultValue: "true",
              description: "Click outside to close.",
            },
          ]}
          keyboard={[
            ["Tab / Shift+Tab", "Cycles through controls inside the dialog only"],
            ["Escape", "Closes and returns focus to the button that opened it"],
          ]}
          notes={[
            "Page scrolling is locked while the dialog is open and restored afterwards.",
            "Everything outside the dialog is marked inert, so neither Tab nor a screen reader's virtual cursor can reach it.",
            "Hidden, disabled, and inert controls are left out of the focus loop.",
          ]}
        >
          <DialogExample />
        </DocSection>

        <DocSection
          id="toast"
          title="Toast"
          summary="Short, non-blocking messages. At most three show at once; more wait in a queue."
          props={[
            { name: "title", type: "string", description: "Required headline." },
            { name: "description", type: "string", description: "Optional detail." },
            {
              name: "tone",
              type: '"neutral" | "success" | "danger"',
              defaultValue: '"neutral"',
              description: "Danger is announced assertively.",
            },
            {
              name: "duration",
              type: "number | null",
              defaultValue: "5000",
              description: "Milliseconds; null keeps it until dismissed.",
            },
          ]}
          notes={[
            "Announcements use live regions that exist before the toast appears; screen readers miss newly inserted ones.",
            "Timers pause while the pointer or keyboard focus is inside the notification area (WCAG 2.2.1, Timing Adjustable).",
          ]}
        >
          <ToastExample />
        </DocSection>

        <DocSection
          id="data-table"
          title="Data table"
          summary="Typed columns, sortable headers, loading and empty states. Sort by Hours: the empty value stays last both ways."
          props={[
            {
              name: "columns",
              type: "DataTableColumn<T>[]",
              description: "header, cell renderer, optional sortValue and align.",
            },
            { name: "rows / getRowId", type: "T[] / (row) => string", description: "Data and a stable key." },
            {
              name: "caption",
              type: "ReactNode",
              description: "Required; use hideCaption to keep it for screen readers only.",
            },
            { name: "loading", type: "boolean", defaultValue: "false", description: "Skeleton rows and aria-busy." },
            { name: "initialSort", type: "{ key, direction }", description: "Starting sort." },
          ]}
          notes={["Sort buttons live inside the column headers, and the sorted header carries aria-sort."]}
        >
          <DataTableExample />
        </DocSection>

        <DocSection
          id="feedback"
          title="Status and feedback"
          summary="Spinner (announced or decorative), badges in five tones, and skeleton placeholders hidden from assistive technology."
        >
          <FeedbackExample />
        </DocSection>
      </main>
    </div>
  );
}
