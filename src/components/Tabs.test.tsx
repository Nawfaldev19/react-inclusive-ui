import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, type TabItem } from "./Tabs";

const items: TabItem[] = [
  { id: "overview", label: "Overview", content: "Overview panel" },
  { id: "usage", label: "Usage", content: "Usage panel" },
  { id: "archived", label: "Archived", content: "Archived panel", disabled: true },
  { id: "history", label: "History", content: "History panel" },
];

describe("Tabs", () => {
  it("links tabs and panels and shows only the selected panel", () => {
    render(<Tabs label="Equipment details" items={items} />);
    const tab = screen.getByRole("tab", { name: "Overview" });
    const panel = screen.getByRole("tabpanel", { name: "Overview" });

    expect(screen.getByRole("tablist", { name: "Equipment details" })).toBeInTheDocument();
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveTextContent("Overview panel");
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  });

  it("uses a roving tabindex so only the selected tab is in the Tab order", async () => {
    render(<Tabs label="Details" items={items} />);

    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("moves focus and selection with arrows, skipping disabled tabs and wrapping", async () => {
    render(<Tabs label="Details" items={items} />);
    await userEvent.click(screen.getByRole("tab", { name: "Usage" }));

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("History panel");

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
  });

  it("supports Home and End and ignores other keys", async () => {
    render(<Tabs label="Details" items={items} defaultSelectedId="usage" />);
    await userEvent.click(screen.getByRole("tab", { name: "Usage" }));

    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "History" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("x");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });

  it("can be controlled by a parent", async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [selected, setSelected] = useState("history");
      return (
        <Tabs
          label="Details"
          items={items}
          selectedId={selected}
          onSelectedChange={(id) => {
            onChange(id);
            setSelected(id);
          }}
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("History panel");

    await userEvent.click(screen.getByRole("tab", { name: "Usage" }));

    expect(onChange).toHaveBeenCalledWith("usage");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Usage panel");
  });

  describe("when the selected tab is missing or disabled", () => {
    function tabStops() {
      return screen.getAllByRole("tab").filter((tab) => tab.tabIndex === 0);
    }

    it("falls back to the first enabled tab for an unknown default id", async () => {
      render(<Tabs label="Details" items={items} defaultSelectedId="does-not-exist" />);

      expect(tabStops()).toEqual([screen.getByRole("tab", { name: "Overview" })]);
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
      await userEvent.tab();
      expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    });

    it("never gives the tab stop to a disabled tab, even when a parent selects it", async () => {
      render(<Tabs label="Details" items={items} selectedId="archived" />);

      expect(screen.getByRole("tab", { name: "Archived" })).toHaveAttribute("tabindex", "-1");
      expect(tabStops()).toEqual([screen.getByRole("tab", { name: "Overview" })]);
      await userEvent.tab();
      expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    });

    it("recovers when the selected tab is removed, and arrows move from the fallback", async () => {
      const { rerender } = render(<Tabs label="Details" items={items} defaultSelectedId="history" />);
      rerender(
        <Tabs label="Details" items={items.filter((item) => item.id !== "history")} defaultSelectedId="history" />,
      );

      expect(tabStops()).toEqual([screen.getByRole("tab", { name: "Overview" })]);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowLeft}");
      expect(screen.getByRole("tab", { name: "Usage" })).toHaveFocus();
    });

    it("ignores arrow keys when every tab is disabled", () => {
      const allDisabled = items.map((item) => ({ ...item, disabled: true }));
      render(<Tabs label="Details" items={allDisabled} />);

      expect(tabStops()).toEqual([]);
      const notPrevented = fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
      expect(notPrevented).toBe(true);
      expect(screen.queryByRole("tabpanel")).toBeNull();
    });
  });
});
