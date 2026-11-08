import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeName } from "../tokens/tokens";

export type ThemePreference = ThemeName | "system";

interface ThemeApi {
  preference: ThemePreference;
  resolvedTheme: ThemeName;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeApi | null>(null);
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readPreference(storageKey: string, fallback: ThemePreference): ThemePreference {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
  } catch {
    return fallback;
  }
}

function systemPrefersDark(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultPreference?: ThemePreference;
  storageKey?: string;
}

/**
 * Applies `data-theme` to <html>. "system" follows the operating system and
 * updates live when it changes. The choice is remembered in localStorage when
 * storage is available.
 */
export function ThemeProvider({
  children,
  defaultPreference = "system",
  storageKey = "inclusive-ui.theme",
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState(() => readPreference(storageKey, defaultPreference));
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: ThemeName = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Storage can be unavailable (private mode); the in-memory choice still applies.
      }
    },
    [storageKey],
  );

  const api = useMemo(() => ({ preference, resolvedTheme, setPreference }), [preference, resolvedTheme, setPreference]);
  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeApi {
  const api = useContext(ThemeContext);
  if (!api) throw new Error("useTheme must be used inside <ThemeProvider>");
  return api;
}
