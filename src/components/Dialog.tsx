import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { focusableWithin, makeSiblingsInert } from "../hooks/focus";
import { CloseIcon } from "./icons";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Usually the action buttons. */
  footer?: ReactNode;
  /** Element to focus on open. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement>;
  closeOnBackdropClick?: boolean;
  closeLabel?: string;
}

// Layout effect in the browser so `inert` is lifted in the same commit that removes the
// dialog; a toast raised by the closing action then lands in a live region that is not inert.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Modal dialog following the WAI-ARIA dialog pattern: focus moves in on open,
 * Tab and Shift+Tab stay inside, Escape closes, focus returns to the element
 * that opened it, the rest of the page is `inert`, and it does not scroll.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  initialFocusRef,
  closeOnBackdropClick = true,
  closeLabel = "Close dialog",
}: DialogProps) {
  const ids = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useBrowserLayoutEffect(() => {
    if (!open || !backdropRef.current) return;
    return makeSiblingsInert(backdropRef.current);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const target = initialFocusRef?.current ?? (panel ? focusableWithin(panel)[0] : undefined) ?? panel;
    target?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = focusableWithin(panelRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div ref={backdropRef} className="th-dialog__backdrop" onMouseDown={onBackdropMouseDown}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        aria-describedby={description ? `${ids}-description` : undefined}
        tabIndex={-1}
        className="th-dialog"
        onKeyDown={onKeyDown}
      >
        <header className="th-dialog__header">
          <h2 id={`${ids}-title`} className="th-dialog__title">
            {title}
          </h2>
          <button type="button" className="th-icon-button" aria-label={closeLabel} onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        {description && (
          <p id={`${ids}-description`} className="th-dialog__description">
            {description}
          </p>
        )}
        {children && <div className="th-dialog__body">{children}</div>}
        {footer && <footer className="th-dialog__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
