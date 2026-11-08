import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("is a non-submitting button by default and handles clicks", async () => {
    const onClick = vi.fn();
    render(
      <form
        onSubmit={() => {
          throw new Error("should not submit");
        }}
      >
        <Button onClick={onClick}>Save</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("while loading, ignores clicks, stays focusable, and reports busy", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });

    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
  });

  it("activates with Enter and Space", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book</Button>);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("applies variant and size classes and forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="danger" size="sm" className="extra">
        Delete
      </Button>,
    );

    expect(ref.current).toBe(screen.getByRole("button", { name: "Delete" }));
    expect(ref.current).toHaveClass("th-button--danger", "th-button--sm", "extra");
  });

  it("renders an icon before the label", () => {
    render(<Button icon={<svg data-testid="icon" />}>Add</Button>);
    expect(screen.getByRole("button", { name: "Add" }).firstChild).toBe(screen.getByTestId("icon"));
  });
});
