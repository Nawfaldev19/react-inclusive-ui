import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast, type ToastOptions } from "./Toast";

let api: ReturnType<typeof useToast>;
function Capture() {
  api = useToast();
  return null;
}

function setup(props: { maxVisible?: number; defaultDuration?: number } = {}) {
  render(
    <ToastProvider {...props}>
      <Capture />
      <button type="button">Outside</button>
    </ToastProvider>,
  );
}

const show = (options: ToastOptions) => {
  act(() => {
    api.toast(options);
  });
};
const region = () => screen.getByRole("region", { name: "Notifications" });

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a toast and announces it in the polite live region", () => {
    setup();
    show({ title: "Booking saved", description: "Laser cutter, 10:00" });

    expect(region()).toHaveTextContent("Booking saved");
    const polite = document.querySelector('[aria-live="polite"]');
    expect(polite).toHaveTextContent("Booking saved. Laser cutter, 10:00");
    expect(document.querySelector('[aria-live="assertive"]')).toBeEmptyDOMElement();
  });

  it("announces danger toasts assertively", () => {
    setup();
    show({ title: "Booking failed", tone: "danger" });
    expect(document.querySelector('[aria-live="assertive"]')).toHaveTextContent("Booking failed");
  });

  it("dismisses automatically after its duration", () => {
    setup({ defaultDuration: 3000 });
    show({ title: "Saved" });

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(region()).toHaveTextContent("Saved");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(region()).not.toHaveTextContent("Saved");
  });

  it("pauses while hovered and resumes with the remaining time", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup({ defaultDuration: 3000 });
    show({ title: "Saved" });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await user.hover(region());
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(region()).toHaveTextContent("Saved");

    await user.unhover(region());
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(region()).toHaveTextContent("Saved");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(region()).not.toHaveTextContent("Saved");
  });

  it("pauses while keyboard focus is inside and resumes when it leaves", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup({ defaultDuration: 1000 });
    show({ title: "Saved" });

    act(() => {
      screen.getByRole("button", { name: "Dismiss notification: Saved" }).focus();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(region()).toHaveTextContent("Saved");

    await user.click(screen.getByRole("button", { name: "Outside" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(region()).not.toHaveTextContent("Saved");
  });

  it("queues beyond the visible limit and shows the next as one closes", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup({ maxVisible: 2, defaultDuration: 60_000 });
    show({ title: "First" });
    show({ title: "Second" });
    show({ title: "Third" });

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(region()).not.toHaveTextContent("Third");

    await user.click(screen.getByRole("button", { name: "Dismiss notification: First" }));

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Second", "Third"]);
  });

  it("keeps persistent toasts until dismissed", () => {
    setup();
    let id = "";
    act(() => {
      id = api.toast({ title: "Read me", duration: null });
    });

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(region()).toHaveTextContent("Read me");
    act(() => {
      api.dismiss(id);
    });
    expect(region()).not.toHaveTextContent("Read me");
  });

  it("useToast throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Capture />)).toThrow("useToast must be used inside <ToastProvider>");
  });
});
