// Small hand-drawn icons so the library has no icon dependency.

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function SortIcon({ direction }: { direction: "ascending" | "descending" | "none" }) {
  const up = direction !== "descending";
  const down = direction !== "ascending";
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="th-sort-icon">
      {up && <path d="M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      {down && <path d="M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
    </svg>
  );
}
