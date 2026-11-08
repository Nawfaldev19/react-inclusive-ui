import { sortBy } from "./sort";
import { cx } from "./cx";

interface Row {
  name: string;
  size: number | null;
  added?: Date;
}

const rows: Row[] = [
  { name: "Lathe", size: 3 },
  { name: "anvil", size: null },
  { name: "Kiln", size: 1 },
  { name: "Drill 10", size: 3 },
  { name: "Drill 9", size: 2 },
];

describe("sortBy", () => {
  it("sorts strings case-insensitively with natural number order", () => {
    expect(sortBy(rows, (row) => row.name, "ascending").map((row) => row.name)).toEqual([
      "anvil",
      "Drill 9",
      "Drill 10",
      "Kiln",
      "Lathe",
    ]);
  });

  it("sorts descending", () => {
    expect(sortBy(rows, (row) => row.name, "descending").map((row) => row.name)).toEqual([
      "Lathe",
      "Kiln",
      "Drill 10",
      "Drill 9",
      "anvil",
    ]);
  });

  it("keeps empty values last in both directions", () => {
    expect(sortBy(rows, (row) => row.size, "ascending").at(-1)?.name).toBe("anvil");
    expect(sortBy(rows, (row) => row.size, "descending").at(-1)?.name).toBe("anvil");
  });

  it("is stable for equal keys", () => {
    expect(sortBy(rows, (row) => row.size, "ascending").map((row) => row.name)).toEqual([
      "Kiln",
      "Drill 9",
      "Lathe",
      "Drill 10",
      "anvil",
    ]);
    expect(sortBy(rows, (row) => row.size, "descending").map((row) => row.name)).toEqual([
      "Lathe",
      "Drill 10",
      "Drill 9",
      "Kiln",
      "anvil",
    ]);
  });

  it("compares dates by time and does not mutate the input", () => {
    const dated = [{ added: new Date(2031, 1, 2) }, { added: new Date(2031, 0, 1) }];
    const copy = [...dated];
    expect(sortBy(dated, (row) => row.added, "ascending")[0]).toBe(dated[1]);
    expect(dated).toEqual(copy);
  });

  it("keeps multiple empty values in their original order", () => {
    const empties = [
      { v: null, id: 1 },
      { v: undefined, id: 2 },
      { v: 5, id: 3 },
    ];
    expect(sortBy(empties, (row) => row.v, "ascending").map((row) => row.id)).toEqual([3, 1, 2]);
  });
});

describe("cx", () => {
  it("joins truthy class names", () => {
    expect(cx("a", false, null, undefined, "b")).toBe("a b");
  });
});
