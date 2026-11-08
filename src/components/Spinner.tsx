import { cx } from "../utils/cx";

export interface SpinnerProps {
  /** Announced to assistive technology. Pass `null` when the spinner is decorative. */
  label?: string | null;
  size?: "sm" | "md";
}

export function Spinner({ label = "Loading", size = "md" }: SpinnerProps) {
  const graphic = (
    <svg className={cx("th-spinner", `th-spinner--${size}`)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="42 100"
        strokeLinecap="round"
      />
    </svg>
  );
  if (label === null) return graphic;
  return (
    <span role="status" className="th-spinner-wrap">
      {graphic}
      <span className="th-visually-hidden">{label}</span>
    </span>
  );
}
