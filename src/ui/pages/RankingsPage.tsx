import { useNavigate } from "react-router-dom";
import { useMovies } from "../hooks/useMovies";
import { Button } from "@/components/ui/button";
import { MovieCard } from "../components/MovieCard";

export function RankingsPage() {
  const navigate = useNavigate();
  const { data } = useMovies();

  const watched = data?.filter((m) => m.watchedAt !== null) ?? [];
  const sorted = [...watched].sort(
    (a, b) => (b.rating.avg ?? 0) - (a.rating.avg ?? 0),
  );

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-foreground">
        Movie Rankings
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        All watched movies, ranked
      </p>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-center text-muted-foreground">
            No rankings available yet.
          </p>
        )}
        {sorted.map((movie, idx) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            subtitle={`— ${movie.nominatedBy}  ·  ${movie.watchedAt}`}
            rank={idx + 1}
            rightContent={
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  ({movie.rating.count})
                </span>
                <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {(movie.rating.avg ?? 0).toFixed(2)}
                </span>
              </span>
            }
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Home
        </Button>
      </div>
    </div>
  );
}
