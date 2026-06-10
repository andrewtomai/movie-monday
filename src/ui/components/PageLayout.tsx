import { cn } from "@/lib/utils";

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
        "mx-auto min-h-svh px-4",
        center ? "flex flex-col justify-center" : "py-12",
        narrow
          ? "max-w-lg"
          : "max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
