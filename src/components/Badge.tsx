import type { ReactNode } from "react";
import { cx } from "../utils/cx";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cx("th-badge", `th-badge--${tone}`)}>{children}</span>;
}
