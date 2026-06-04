import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMovies,
  useMarkMovieWatched,
  type MovieData,
} from "../api/movies";
import { useMovies } from "../hooks/useMovies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovieCard } from "../components/MovieCard";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WATCHED, UNWATCHED } from "../../types";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${month}, ${d.getFullYear()}`;
}

export function RankingsPage() {
  const navigate = useNavigate();
  const { data } = useMovies(WATCHED);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: unwatched } = useQuery({
    queryKey: ["movies", UNWATCHED],
    queryFn: () => fetchMovies(UNWATCHED),
    staleTime: 5 * 60 * 1000,
  });
  const markWatched = useMarkMovieWatched();

  const sorted = (data ?? [])
    .filter((m) => m.watchedAt != null)
    .sort((a, b) => (b.rating.avg ?? 0) - (a.rating.avg ?? 0));

  const filtered = (unwatched ?? []).filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(movie: MovieData) {
    markWatched.mutate(
      { id: movie.id, watchedAt: new Date().toISOString().split("T")[0] },
      {
        onSuccess: () => {
          toast.success(`"${movie.title}" marked as watched`);
          setDialogOpen(false);
          setSearch("");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to mark movie as watched",
          );
        },
      },
    );
  }

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
            subtitle={`— ${movie.nominatedBy} · ${formatDate(movie.watchedAt)}`}
            rank={idx + 1}
            rightContent={
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  ({movie.rating.count})
                </span>
                <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {movie.rating.avg?.toFixed(2) ?? "—"}
                </span>
              </span>
            }
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Home
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Watched Movie</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Watched Movie</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search unwatched movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {filtered.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => handleSelect(movie)}
                  disabled={markWatched.isPending}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {movie.title}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {search ? "No matches found." : "No unwatched movies."}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
