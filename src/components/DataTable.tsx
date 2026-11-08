import { useMemo, useState, type ReactNode } from "react";
import { sortBy, type SortDirection, type SortValue } from "../utils/sort";
import { cx } from "../utils/cx";
import { SortIcon } from "./icons";
import { Skeleton } from "./Skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable. Return null for "no value"; those rows always sort last. */
  sortValue?: (row: T) => SortValue;
  align?: "start" | "end";
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** Every table needs a caption; set `hideCaption` to keep it for screen readers only. */
  caption: ReactNode;
  hideCaption?: boolean;
  loading?: boolean;
  loadingRowCount?: number;
  emptyState?: ReactNode;
  initialSort?: SortState;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  hideCaption = false,
  loading = false,
  loadingRowCount = 3,
  emptyState = "Nothing to show yet.",
  initialSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);

  const sortedRows = useMemo(() => {
    const column = sort && columns.find((candidate) => candidate.key === sort.key);
    return column?.sortValue && sort ? sortBy(rows, column.sortValue, sort.direction) : rows;
  }, [rows, columns, sort]);

  const toggleSort = (key: string) => {
    setSort((current) => ({
      key,
      direction: current?.key === key && current.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  return (
    <div className="th-table-wrap">
      <table className="th-table" aria-busy={loading || undefined}>
        <caption className={cx(hideCaption && "th-visually-hidden")}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const direction = sort?.key === column.key ? sort.direction : undefined;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={direction}
                  className={cx(column.align === "end" && "th-align-end")}
                >
                  {column.sortValue ? (
                    <button type="button" className="th-table__sort" onClick={() => toggleSort(column.key)}>
                      {column.header}
                      <SortIcon direction={direction ?? "none"} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRowCount }, (_, index) => (
              <tr key={`loading-${index}`}>
                {columns.map((column) => (
                  <td key={column.key}>
                    <Skeleton width="70%" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="th-table__empty">
                {emptyState}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr key={getRowId(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={cx(column.align === "end" && "th-align-end")}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
