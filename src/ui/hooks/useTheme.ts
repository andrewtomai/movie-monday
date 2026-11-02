import { useCallback, useSyncExternalStore } from "react";
import {
  getResolvedTheme,
  getTheme,
  setTheme,
  subscribeTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";

const getServerTheme = () => "dark" as Theme;
const getServerResolvedTheme = () => "dark" as ResolvedTheme;

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getTheme,
    getServerTheme,
  );
  const resolvedTheme = useSyncExternalStore(
    subscribeTheme,
    getResolvedTheme,
    getServerResolvedTheme,
  );

  const updateTheme = useCallback((next: Theme) => setTheme(next), []);

  return { theme, resolvedTheme, setTheme: updateTheme };
}
