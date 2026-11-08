import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";
import { VisuallyHidden } from "./VisuallyHidden";

describe("display components", () => {
  it("Spinner announces a status label by default", () => {
    render(<Spinner label="Saving" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saving");
  });

  it("Spinner can be purely decorative", () => {
    const { container } = render(<Spinner label={null} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("Skeleton is hidden from assistive technology and sized by props", () => {
    const { container } = render(<Skeleton width="40%" height="2rem" />);
    const shape = container.firstElementChild as HTMLElement;
    expect(shape).toHaveAttribute("aria-hidden", "true");
    expect(shape.style.width).toBe("40%");
    expect(shape.style.height).toBe("2rem");
  });

  it("Badge renders its tone class", () => {
    render(<Badge tone="success">Confirmed</Badge>);
    expect(screen.getByText("Confirmed")).toHaveClass("th-badge", "th-badge--success");
  });

  it("VisuallyHidden keeps text in the accessible tree", () => {
    render(
      <button type="button">
        <svg aria-hidden="true" />
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
