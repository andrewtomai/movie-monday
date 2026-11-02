import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/lib/theme";

const NEXT_THEME: Record<Theme, Theme> = {
  dark: "light",
  light: "system",
  system: "dark",
};

const LABELS: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
};

const ICONS = {
  dark: Moon,
  light: Sun,
  system: Monitor,
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = NEXT_THEME[theme];
  const Icon = ICONS[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`Color theme: ${LABELS[theme]}. Switch to ${LABELS[next]}.`}
      title={`Color theme: ${LABELS[theme]} (switch to ${LABELS[next]})`}
      data-testid="theme-toggle"
    >
      <Icon />
    </Button>
  );
}
