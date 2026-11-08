import type { ReactNode } from "react";

/** Content for screen readers only. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="th-visually-hidden">{children}</span>;
}
