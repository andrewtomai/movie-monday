import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { MovieCard } from "../components/MovieCard";
import { Button } from "@/components/ui/button";

export function VotingPoolPage() {
  const navigate = useNavigate();
  const rollingPool = useStore((s) => s.rollingPool);
  const [votes, setVotes] = useState<Record<string, number>>({});

  const votingMovies = rollingPool
    .filter((m) => m.isChecked)
    .map((m) => m.title);

  const handleVote = (title: string, delta: 1 | -1) => {
    setVotes((prev) => {
      const current = prev[title] ?? 0;
      const next = current + delta;
      if (next <= 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [title]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [title]: next };
    });
  };

  if (votingMovies.length === 0) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h2 className="mb-1 text-2xl font-light tracking-tight text-foreground">
        Voting Pool
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Time to vote on the final selection
      </p>

      <div className="space-y-3">
        {votingMovies.map((title) => (
          <MovieCard
            key={title}
            title={title}
            votes={votes[title] ?? 0}
            onVote={(delta) => handleVote(title, delta)}
          />
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => navigate("/rolling-pool")}>
          ← Back
        </Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Start over
        </Button>
      </div>
    </div>
  );
}
