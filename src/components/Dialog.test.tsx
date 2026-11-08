import { useRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, type DialogProps } from "./Dialog";

function Harness(props: Partial<DialogProps> & { withInitialFocus?: boolean; empty?: boolean }) {
  const [open, setOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Retire equipment"
        description="Members will no longer be able to book it."
        initialFocusRef={props.withInitialFocus ? confirmRef : undefined}
        footer={
          props.empty ? undefined : (
            <>
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" ref={confirmRef}>
                Retire
              </button>
            </>
          )
        }
        {...props}
      />
    </>
  );
}

async function openDialog() {
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  return screen.getByRole("dialog", { name: "Retire equipment" });
}

describe("Dialog", () => {
  it("is a labelled, described modal that moves focus inside on open", async () => {
    render(<Harness />);
    const dialog = await openDialog();

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Members will no longer be able to book it.");
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
  });

  it("keeps Tab and Shift+Tab inside the dialog", async () => {
    render(<Harness />);
    await openDialog();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Retire" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Retire" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the opener", async () => {
    render(<Harness />);
    await openDialog();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
  });

  it("locks page scroll while open and restores it after", async () => {
    document.body.style.overflow = "scroll";
    render(<Harness />);
    await openDialog();
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("closes on a backdrop click but not on a click inside the panel", async () => {
    render(<Harness />);
    const dialog = await openDialog();

    await userEvent.click(dialog);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(dialog.parentElement as HTMLElement);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can ignore backdrop clicks", async () => {
    render(<Harness closeOnBackdropClick={false} />);
    const dialog = await openDialog();

    await userEvent.click(dialog.parentElement as HTMLElement);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("focuses a chosen element first", async () => {
    render(<Harness withInitialFocus />);
    await openDialog();
    expect(screen.getByRole("button", { name: "Retire" })).toHaveFocus();
  });

  it("with only the close button, Tab stays on it", async () => {
    render(<Harness empty />);
    await openDialog();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
  });

  it("renders nothing while closed", () => {
    render(<Dialog open={false} onClose={vi.fn()} title="Hidden" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("skips hidden, disabled, and inert controls when wrapping focus", async () => {
    render(
      <Harness
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Retire</button>
            <button type="button" style={{ display: "none" }}>
              Display none
            </button>
            <button type="button" style={{ visibility: "hidden" }}>
              Visibility hidden
            </button>
            <div hidden>
              <button type="button">Inside hidden</button>
            </div>
            <div style={{ display: "none" }}>
              <a href="#archive">Inside display none</a>
            </div>
            <fieldset disabled>
              <input aria-label="Inside disabled fieldset" />
            </fieldset>
            {/* React 18 drops a bare `inert` prop, so set the attribute directly. */}
            <div ref={(node) => node?.setAttribute("inert", "")}>
              <button type="button">Inside inert</button>
            </div>
          </>
        }
      />,
    );
    await openDialog();
    screen.getByRole("button", { name: "Retire" }).focus();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Retire" })).toHaveFocus();
  });

  it("makes the rest of the page inert while open and restores it on close", async () => {
    const outside = document.createElement("div");
    const alreadyInert = document.createElement("div");
    alreadyInert.setAttribute("inert", "");
    document.body.append(outside, alreadyInert);

    const { container } = render(<Harness />);
    const dialog = await openDialog();
    const backdrop = dialog.parentElement as HTMLElement;

    expect(container).toHaveAttribute("inert");
    expect(outside).toHaveAttribute("inert");
    expect(backdrop).not.toHaveAttribute("inert");

    await userEvent.keyboard("{Escape}");

    expect(container).not.toHaveAttribute("inert");
    expect(outside).not.toHaveAttribute("inert");
    expect(alreadyInert).toHaveAttribute("inert");
    outside.remove();
    alreadyInert.remove();
  });
});
