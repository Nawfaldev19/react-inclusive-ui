const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

// The selector alone also matches controls that a browser would skip: ones inside a
// disabled fieldset, under `hidden` or `inert`, or hidden by CSS. If the focus loop
// counted those, Tab on the last *visible* control would not wrap.
function isReachable(element: HTMLElement, container: HTMLElement): boolean {
  if (element.matches(":disabled")) return false;
  if (element.closest("[inert], [aria-hidden='true']")) return false;

  const style = window.getComputedStyle(element);
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;

  for (let node: HTMLElement | null = element; node && node !== container.parentElement; node = node.parentElement) {
    if (node.hidden || window.getComputedStyle(node).display === "none") return false;
  }
  return true;
}

/** Elements inside `container` that can receive keyboard focus, in DOM order. */
export function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) =>
    isReachable(element, container),
  );
}

/**
 * Marks every child of `document.body` except `keep` as `inert` and returns a function that
 * undoes it. Elements that were already inert are left alone, so the undo cannot clear an
 * `inert` set by someone else (for example a second, stacked dialog).
 */
export function makeSiblingsInert(keep: HTMLElement): () => void {
  const changed: HTMLElement[] = [];
  for (const child of Array.from(document.body.children)) {
    if (child === keep || !(child instanceof HTMLElement) || child.hasAttribute("inert")) continue;
    child.setAttribute("inert", "");
    changed.push(child);
  }
  return () => {
    for (const child of changed) child.removeAttribute("inert");
  };
}
