import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { useMembersMovies } from "../hooks/useMemberMovies";
import { useColumnLayout } from "../hooks/useColumnLayout";
import { MovieCard } from "../components/MovieCard";
import { PageLayout } from "../components/PageLayout";
import { Button } from "@/components/ui/button";
import { UNWATCHED } from "../../types";

export function RollingPoolPage() {
  const navigate = useNavigate();
  const selectedAttendees = useStore((s) => s.selectedAttendees);
  const rollingPool = useStore((s) => s.rollingPool);
  const assignRollingPool = useStore((s) => s.assignRollingPool);
  const toggleChecked = useStore((s) => s.toggleChecked);
  const reseed = useStore((s) => s.reseed);
  const { gridRef, style } = useColumnLayout({ itemHeight: 76 });

  const { titles } = useMembersMovies(
    selectedAttendees.map((a) => a.id),
    UNWATCHED,
  );

  useEffect(() => {
    if (selectedAttendees.length === 0) {
      navigate("/", { replace: true });
    }
  }, [selectedAttendees, navigate]);

  useEffect(() => {
    if (titles.length > 0) {
      assignRollingPool(titles);
    }
  }, [titles, assignRollingPool]);

  const isAnyChecked = rollingPool.some((m) => m.isChecked);

  const handleNext = () => {
    if (isAnyChecked) {
      navigate("/voting-pool");
    }
  };

  if (rollingPool.length === 0) {
    return (
      <PageLayout center>
        <p className="mb-2 text-lg text-foreground">No eligible movies</p>
        <p className="mb-6 text-center text-muted-foreground">
          All movies from selected attendees have been watched.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/")}>Go back</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h2 className="mb-1 text-2xl font-light tracking-tight text-foreground">
        Rolling Pool
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Select the movies to vote on
      </p>

      <div ref={gridRef} className="grid gap-3 overflow-auto" style={style}>
        {rollingPool.map((m, i) => (
          <MovieCard
            key={m.title}
            title={m.title}
            assignedNumber={i + 1}
            checked={m.isChecked}
            onClick={() => toggleChecked(m.title)}
          />
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back
        </Button>
        <Button variant="outline" className="flex-1" onClick={reseed} disabled={isAnyChecked}>
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
    </PageLayout>
  );
}
