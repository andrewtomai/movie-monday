import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  center?: boolean;
}

export function PageLayout({ children, className, narrow, center }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "relative mx-auto min-h-svh px-4",
        center ? "flex flex-col justify-center" : "py-12",
        narrow
          ? "max-w-lg"
          : "max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl",
        className,
      )}
    >
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
