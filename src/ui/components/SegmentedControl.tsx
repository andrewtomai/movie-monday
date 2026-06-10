import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: [SegmentedControlOption, SegmentedControlOption, ...SegmentedControlOption[]];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div className={cn("flex overflow-hidden rounded-lg border border-border", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
