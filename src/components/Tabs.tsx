import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: readonly TabItem[];
  /** Accessible name for the tab list. */
  label: string;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectedChange?: (id: string) => void;
}

/**
 * WAI-ARIA tabs with automatic activation: arrow keys move focus and
 * selection together, Home/End jump to the ends, disabled tabs are skipped,
 * and only the selected tab is in the Tab order (roving tabindex).
 *
 * If the selected id is missing or disabled, the first enabled tab is shown
 * and takes the tab stop. Otherwise every tab would get tabIndex -1 and the
 * list could not be reached by keyboard at all.
 */
export function Tabs({ items, label, selectedId, defaultSelectedId, onSelectedChange }: TabsProps) {
  const base = useId();
  const firstEnabled = items.find((item) => !item.disabled)?.id ?? "";
  const [selected, setSelected] = useControllableState(selectedId, defaultSelectedId ?? firstEnabled, onSelectedChange);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter((item) => !item.disabled);
  const active = enabled.some((item) => item.id === selected) ? selected : firstEnabled;

  const select = (id: string) => {
    setSelected(id);
    tabRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (enabled.length === 0) return;
    const index = enabled.findIndex((item) => item.id === active);
    const targets: Record<string, TabItem | undefined> = {
      ArrowRight: enabled[(index + 1) % enabled.length],
      ArrowLeft: enabled[(index - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled[enabled.length - 1],
    };
    const target = targets[event.key];
    if (!target) return;
    event.preventDefault();
    select(target.id);
  };

  return (
    <div className="th-tabs">
      <div role="tablist" aria-label={label} className="th-tabs__list" onKeyDown={onKeyDown}>
        {items.map((item) => {
          const isSelected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-controls={`${base}-panel-${item.id}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              className={cx("th-tabs__tab", isSelected && "th-tabs__tab--selected")}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="th-tabs__panel"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
