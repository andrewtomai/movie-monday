import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useMarkMovieWatched,
  useRemoveMovieWatched,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
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
  const { data: unwatched } = useMovies(UNWATCHED);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const markWatched = useMarkMovieWatched();
  const removeMovie = useRemoveMovieWatched();
  const [removeDialogMovie, setRemoveDialogMovie] = useState<MovieData | null>(
    null,
  );

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
            onClick={() => navigate(`/movie/${movie.id}`)}
            title={movie.title}
            subtitle={`— ${movie.nominatedBy} · ${formatDate(movie.watchedAt)}`}
            rank={idx + 1}
            rightContent={
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    ({movie.rating.count})
                  </span>
                  <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                    {movie.rating.avg?.toFixed(2) ?? "—"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRemoveDialogMovie(movie);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
          <DialogContent className="top-4 translate-y-0 sm:top-8 sm:translate-y-0 flex flex-col sm:h-[70vh] h-[80dvh] max-h-[600px]">
            <DialogHeader>
              <DialogTitle>Add Watched Movie</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search unwatched movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
              {filtered.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => handleSelect(movie)}
                  disabled={markWatched.isPending}
                  className="w-full rounded-lg px-3 py-3 sm:py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
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

        <Dialog
          open={removeDialogMovie !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveDialogMovie(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove from watched list?</DialogTitle>
              <DialogDescription>
                Remove "{removeDialogMovie?.title}" from the watched list?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoveDialogMovie(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!removeDialogMovie) return;
                  removeMovie.mutate(removeDialogMovie.id, {
                    onSuccess: () => {
                      toast.success(
                        `"${removeDialogMovie.title}" removed from watched list`,
                      );
                      setRemoveDialogMovie(null);
                    },
                    onError: (err) => {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to remove movie from watched list",
                      );
                    },
                  });
                }}
                disabled={removeMovie.isPending}
              >
                {removeMovie.isPending ? "Removing..." : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
