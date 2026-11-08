export type SortDirection = "ascending" | "descending";
export type SortValue = string | number | Date | null | undefined;

function compareValues(a: Exclude<SortValue, null | undefined>, b: Exclude<SortValue, null | undefined>): number {
  if (typeof a === "string" && typeof b === "string")
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  const left = a instanceof Date ? a.getTime() : a;
  const right = b instanceof Date ? b.getTime() : b;
  if (left < right) return -1;
  return left > right ? 1 : 0;
}

/**
 * Returns a sorted copy. Stable (equal items keep their order), and empty
 * values (null/undefined) always go last regardless of direction, so they
 * never crowd the top of a table.
 */
export function sortBy<T>(rows: readonly T[], value: (row: T) => SortValue, direction: SortDirection): T[] {
  const sign = direction === "ascending" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, key: value(row) }))
    .sort((a, b) => {
      const aEmpty = a.key === null || a.key === undefined;
      const bEmpty = b.key === null || b.key === undefined;
      if (aEmpty || bEmpty) return aEmpty === bEmpty ? a.index - b.index : aEmpty ? 1 : -1;
      return (
        sign * compareValues(a.key as NonNullable<SortValue>, b.key as NonNullable<SortValue>) || a.index - b.index
      );
    })
    .map(({ row }) => row);
}
