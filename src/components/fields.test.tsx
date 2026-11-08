import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";
import { Select } from "./Select";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("labels the input and describes it with the error first, then the hint", () => {
    render(<TextField label="Email" hint="We never share it." error="Enter a valid email" />);
    const input = screen.getByLabelText("Email");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email We never share it.");
  });

  it("has no description or invalid state when there is no hint or error", () => {
    render(<TextField label="Name" />);
    const input = screen.getByLabelText("Name");

    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks required fields for both sighted and assistive users", () => {
    render(<TextField label="Name" required />);

    expect(screen.getByRole("textbox", { name: "Name" })).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts typing, a custom id, and a forwarded ref", async () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField ref={ref} id="custom" label="Project" hint="Short name" />);

    await userEvent.type(screen.getByLabelText("Project"), "Lamp");

    expect(ref.current).toHaveValue("Lamp");
    expect(ref.current).toHaveAttribute("id", "custom");
    expect(ref.current).toHaveAttribute("aria-describedby", "custom-hint");
  });
});

describe("Select", () => {
  const options = [
    { value: "wood", label: "Woodworking" },
    { value: "metal", label: "Metalworking", disabled: true },
  ];

  it("shows a non-selectable placeholder and reports changes", async () => {
    const onChange = vi.fn();
    render(<Select label="Category" options={options} placeholder="Choose one" defaultValue="" onChange={onChange} />);
    const select = screen.getByLabelText("Category");

    expect(screen.getByRole("option", { name: "Choose one" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Metalworking" })).toBeDisabled();
    await userEvent.selectOptions(select, "wood");

    expect(select).toHaveValue("wood");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("links errors to the control", () => {
    render(<Select label="Category" options={options} error="Pick a category" />);
    expect(screen.getByLabelText("Category")).toHaveAccessibleDescription("Pick a category");
  });
});

describe("Checkbox", () => {
  it("toggles and is described by its description", async () => {
    render(<Checkbox label="Email me" description="At most once a week." />);
    const box = screen.getByRole("checkbox", { name: "Email me" });

    await userEvent.click(box);

    expect(box).toBeChecked();
    expect(box).toHaveAccessibleDescription("At most once a week.");
  });

  it("reflects the indeterminate prop on the DOM property, including updates", () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Checkbox ref={ref} label="Select all" indeterminate />);
    expect(ref.current?.indeterminate).toBe(true);

    rerender(<Checkbox ref={ref} label="Select all" indeterminate={false} />);
    expect(ref.current?.indeterminate).toBe(false);
  });
});
