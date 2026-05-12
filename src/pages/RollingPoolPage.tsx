import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { members } from "../config/members";
import { watchedMovies } from "../config/history";
import { useStore } from "../store";
import { MovieCard } from "../components/MovieCard";
import { Button } from "@/components/ui/button";

export function RollingPoolPage() {
  const navigate = useNavigate();
  const selectedAttendees = useStore((s) => s.selectedAttendees);
  const assignedNumbers = useStore((s) => s.assignedNumbers);
  const rolledNumbers = useStore((s) => s.rolledNumbers);
  const assignRollingNumbers = useStore((s) => s.assignRollingNumbers);
  const toggleRolledNumber = useStore((s) => s.toggleRolledNumber);
  const reseedUnchecked = useStore((s) => s.reseedUnchecked);

  const eligibleMovies = useMemo(() => {
    const memberMovies = members
      .filter((m) => selectedAttendees.includes(m.name))
      .flatMap((m) => m.movies);
    return [...new Set(memberMovies)].filter(
      (m) => !watchedMovies.map((w) => w.title).includes(m),
    );
  }, [selectedAttendees]);

  useEffect(() => {
    if (selectedAttendees.length === 0) {
      navigate("/", { replace: true });
      return;
    }
    if (Object.keys(assignedNumbers).length === 0) {
      assignRollingNumbers(eligibleMovies);
    }
  }, [
    selectedAttendees,
    assignedNumbers,
    eligibleMovies,
    assignRollingNumbers,
    navigate,
  ]);

  const hasVotable = rolledNumbers.length > 0;

  const movieEntries = useMemo(
    () =>
      eligibleMovies
        .map((title) => ({
          title,
          number: assignedNumbers[title],
          checked: rolledNumbers.includes(assignedNumbers[title]),
        }))
        .sort((a, b) => a.number - b.number),
    [eligibleMovies, assignedNumbers, rolledNumbers],
  );

  const handleNext = () => {
    if (hasVotable) {
      navigate("/voting-pool");
    }
  };

  if (eligibleMovies.length === 0) {
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
        {movieEntries.map(({ title, number, checked }) =>
          number != null ? (
            <MovieCard
              key={title}
              title={title}
              assignedNumber={number}
              checked={checked}
              onToggle={() => toggleRolledNumber(number)}
              showCheckbox
            />
          ) : null,
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back
        </Button>
        <Button
          variant="outline"
          onClick={() => reseedUnchecked(eligibleMovies)}
        >
          ++random
        </Button>
        <Button onClick={handleNext} disabled={!hasVotable} className="flex-1">
          Vote →
        </Button>
      </div>
    </div>
  );
}
