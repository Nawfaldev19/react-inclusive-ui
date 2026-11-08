import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function Probe() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  return (
    <>
      <p>
        {preference}/{resolvedTheme}
      </p>
      <button type="button" onClick={() => setPreference("dark")}>
        Dark
      </button>
      <button type="button" onClick={() => setPreference("system")}>
        System
      </button>
    </>
  );
}

function mockSystemTheme(initiallyDark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: initiallyDark,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => query),
  );
  return {
    change(dark: boolean) {
      query.matches = dark;
      act(() => listeners.forEach((listener) => listener({ matches: dark } as MediaQueryListEvent)));
    },
    listenerCount: () => listeners.size,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ThemeProvider", () => {
  it("follows the system theme by default, live", () => {
    const system = mockSystemTheme(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("system/dark")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("dark");

    system.change(false);

    expect(screen.getByText("system/light")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("stores an explicit choice and restores it on the next visit", async () => {
    mockSystemTheme(false);
    const { unmount } = render(
      <ThemeProvider storageKey="test.theme">
        <Probe />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(window.localStorage.getItem("test.theme")).toBe("dark");
    unmount();

    render(
      <ThemeProvider storageKey="test.theme">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("dark/dark")).toBeInTheDocument();
  });

  it("ignores invalid stored values and works without matchMedia or storage", async () => {
    window.localStorage.setItem("inclusive-ui.theme", "purple");
    vi.stubGlobal("matchMedia", undefined);
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(
      <ThemeProvider defaultPreference="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("light/light")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(screen.getByText("dark/dark")).toBeInTheDocument();
    setItem.mockRestore();
  });

  it("falls back to the default when storage cannot be read", () => {
    mockSystemTheme(false);
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(
      <ThemeProvider defaultPreference="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("dark/dark")).toBeInTheDocument();
    getItem.mockRestore();
  });

  it("stops listening to the system after unmount", () => {
    const system = mockSystemTheme(false);
    const { unmount } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(system.listenerCount()).toBe(1);
    unmount();
    expect(system.listenerCount()).toBe(0);
  });

  it("useTheme throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow("useTheme must be used inside <ThemeProvider>");
  });
});
