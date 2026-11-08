import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { CloseIcon } from "./icons";

export type ToastTone = "neutral" | "success" | "danger";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. `null` keeps the toast until dismissed. */
  duration?: number | null;
}

interface ToastRecord {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number | null;
}

interface ToastApi {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** Toasts beyond this many wait in a queue and appear as others close. */
  maxVisible?: number;
  defaultDuration?: number;
}

/**
 * Hosts a notification region. Announcements go through live regions that
 * exist before any toast appears, which screen readers announce reliably;
 * danger toasts use an assertive region, others a polite one. Timers pause
 * while the pointer or keyboard focus is inside the region.
 */
export function ToastProvider({ children, maxVisible = 3, defaultDuration = 5000 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState({ polite: "", assertive: "" });
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, tone = "neutral", duration }: ToastOptions) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      setToasts((current) => [
        ...current,
        { id, title, description, tone, duration: duration === undefined ? defaultDuration : duration },
      ]);
      const text = description ? `${title}. ${description}` : title;
      setAnnouncement(tone === "danger" ? { polite: "", assertive: text } : { polite: text, assertive: "" });
      return id;
    },
    [defaultDuration],
  );

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const visible = toasts.slice(0, maxVisible);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="th-visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement.polite}
      </div>
      <div className="th-visually-hidden" aria-live="assertive" aria-atomic="true">
        {announcement.assertive}
      </div>
      <section
        aria-label="Notifications"
        className="th-toast-region"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
        }}
      >
        {visible.length > 0 && (
          <ol className="th-toast-list">
            {visible.map((item) => (
              <ToastItem key={item.id} toast={item} paused={paused} onDismiss={dismiss} />
            ))}
          </ol>
        )}
      </section>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  paused,
  onDismiss,
}: {
  toast: ToastRecord;
  paused: boolean;
  onDismiss: (id: string) => void;
}) {
  const remaining = useRef(toast.duration ?? 0);

  useEffect(() => {
    if (toast.duration === null || paused) return;
    const started = Date.now();
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, toast.duration, toast.id, onDismiss]);

  return (
    <li className={cx("th-toast", `th-toast--${toast.tone}`)}>
      <div className="th-toast__content">
        <p className="th-toast__title">{toast.title}</p>
        {toast.description && <p className="th-toast__description">{toast.description}</p>}
      </div>
      <button
        type="button"
        className="th-icon-button"
        aria-label={`Dismiss notification: ${toast.title}`}
        onClick={() => onDismiss(toast.id)}
      >
        <CloseIcon />
      </button>
    </li>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}
