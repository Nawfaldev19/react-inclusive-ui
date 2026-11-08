import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "./DataTable";

interface Item {
  id: string;
  name: string;
  bookings: number | null;
}

const rows: Item[] = [
  { id: "1", name: "Lathe", bookings: 4 },
  { id: "2", name: "Kiln", bookings: null },
  { id: "3", name: "Anvil", bookings: 9 },
];

const columns: DataTableColumn<Item>[] = [
  { key: "name", header: "Name", cell: (row) => row.name, sortValue: (row) => row.name },
  {
    key: "bookings",
    header: "Bookings",
    cell: (row) => row.bookings ?? "–",
    sortValue: (row) => row.bookings,
    align: "end",
  },
  { key: "action", header: "Action", cell: (row) => <button type="button">Edit {row.name}</button> },
];

const names = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

describe("DataTable", () => {
  it("renders a captioned table in the given order", () => {
    render(<DataTable caption="Equipment" columns={columns} rows={rows} getRowId={(row) => row.id} />);

    expect(screen.getByRole("table", { name: "Equipment" })).toBeInTheDocument();
    expect(names()).toEqual(["Lathe", "Kiln", "Anvil"]);
    expect(screen.getByRole("columnheader", { name: "Action" })).not.toHaveAttribute("aria-sort");
  });

  it("sorts by a column, toggles direction, and exposes aria-sort", async () => {
    render(<DataTable caption="Equipment" columns={columns} rows={rows} getRowId={(row) => row.id} />);
    const header = screen.getByRole("columnheader", { name: "Name" });

    await userEvent.click(within(header).getByRole("button", { name: "Name" }));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(names()).toEqual(["Anvil", "Kiln", "Lathe"]);

    await userEvent.click(within(header).getByRole("button", { name: "Name" }));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(names()).toEqual(["Lathe", "Kiln", "Anvil"]);
  });

  it("switching columns starts ascending and keeps empty values last", async () => {
    render(
      <DataTable
        caption="Equipment"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        initialSort={{ key: "name", direction: "descending" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Bookings" }));

    expect(screen.getByRole("columnheader", { name: "Bookings" })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Name" })).not.toHaveAttribute("aria-sort");
    expect(names()).toEqual(["Lathe", "Anvil", "Kiln"]);
  });

  it("shows loading rows and marks the table busy", () => {
    render(
      <DataTable
        caption="Equipment"
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
        loading
        loadingRowCount={2}
      />,
    );

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("shows an empty state spanning all columns", () => {
    render(
      <DataTable
        caption="Equipment"
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
        emptyState="No equipment yet."
      />,
    );

    const cell = screen.getByRole("cell", { name: "No equipment yet." });
    expect(cell).toHaveAttribute("colspan", "3");
  });

  it("can visually hide the caption while keeping the table name", () => {
    render(<DataTable caption="Equipment" hideCaption columns={columns} rows={rows} getRowId={(row) => row.id} />);

    expect(screen.getByText("Equipment")).toHaveClass("th-visually-hidden");
    expect(screen.getByRole("table", { name: "Equipment" })).toBeInTheDocument();
  });
});
