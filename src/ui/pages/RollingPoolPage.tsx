import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { MovieCard } from "../components/MovieCard";
import { Button } from "@/components/ui/button";

export function RollingPoolPage() {
  const navigate = useNavigate();
  const selectedAttendees = useStore((s) => s.selectedAttendees);
  const rollingPool = useStore((s) => s.rollingPool);
  const assignRollingPool = useStore((s) => s.assignRollingPool);
  const toggleChecked = useStore((s) => s.toggleChecked);
  const reseed = useStore((s) => s.reseed);

  useEffect(() => {
    if (selectedAttendees.length === 0) {
      navigate("/", { replace: true });
      return;
    }
    assignRollingPool();
  }, [selectedAttendees, assignRollingPool, reseed, navigate]);

  const isAnyChecked = rollingPool.some((m) => m.isChecked);

  const handleNext = () => {
    if (isAnyChecked) {
      navigate("/voting-pool");
    }
  };

  if (rollingPool.length === 0) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="mb-2 text-lg text-foreground">No eligible movies</p>
        <p className="mb-6 text-muted-foreground">
          All movies from selected attendees have been watched.
        </p>
        <Button onClick={() => navigate("/")}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h2 className="mb-1 text-2xl font-light tracking-tight text-foreground">
        Rolling Pool
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Check the numbers that were rolled
      </p>

      <div className="space-y-3">
        {rollingPool.map((m, i) => (
          <MovieCard
            key={m.title}
            title={m.title}
            assignedNumber={i + 1}
            checked={m.isChecked}
            onToggle={() => toggleChecked(m.title)}
            showCheckbox
          />
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back
        </Button>
        <Button variant="outline" onClick={reseed} disabled={isAnyChecked}>
          ++random
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isAnyChecked}
          className="flex-1"
        >
          Vote →
        </Button>
      </div>
    </div>
  );
}
