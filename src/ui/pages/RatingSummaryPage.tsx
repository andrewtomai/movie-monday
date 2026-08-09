import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useMovie, useMovieRatings, type MovieRater } from "../api/movies";
import { PageLayout } from "../components/PageLayout";
import { Badge } from "@/components/ui/badge";

type Mode = "results" | "voting";

const MODE_STORAGE_KEY = "rating-summary-mode";

export function RatingSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const [mode, setMode] = useState<Mode>(() =>
    localStorage.getItem(MODE_STORAGE_KEY) === "voting" ? "voting" : "results",
  );

  const {
    data: movie,
    isLoading: movieLoading,
    isError: movieError,
  } = useMovie(movieId, { refetchInterval: 5_000 });
  const { data: raters } = useMovieRatings(movieId, { refetchInterval: 5_000 });

  const histogram = useMemo(() => {
    if (!raters) return [];
    const counts = new Map<number, number>();
    for (const rater of raters) {
      counts.set(rater.rating, (counts.get(rater.rating) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([rating, count]) => ({ rating, count }));
  }, [raters]);

  const { namedRaters, anonymousCount } = useMemo(() => {
    const named: MovieRater[] = [];
    let anonymous = 0;
    for (const rater of raters ?? []) {
      if (rater.memberId == null) {
        anonymous += 1;
      } else {
        named.push(rater);
      }
    }
    return { namedRaters: named, anonymousCount: anonymous };
  }, [raters]);

  if (movieLoading) {
    return (
      <PageLayout>
        <p className="text-center text-muted-foreground">Loading...</p>
      </PageLayout>
    );
  }

  if (movieError || !movie) {
    return (
      <PageLayout>
        <p className="text-center text-muted-foreground">Movie not found</p>
      </PageLayout>
    );
  }

  const maxCount = histogram.length ? Math.max(...histogram.map((h) => h.count), 1) : 1;
  const rateUrl = `${window.location.origin}/movie/${movieId}/rate`;

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "results" ? "voting" : "results";
      localStorage.setItem(MODE_STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-foreground">
          {movie.title}
        </h1>

        <div className="mb-8 text-center">
          {mode === "results" && (
            <p className="text-7xl font-light tracking-tight text-foreground">
              {movie.rating.avg?.toFixed(2) ?? "—"}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {movie.rating.count} {movie.rating.count === 1 ? "rating" : "ratings"}
          </p>
          <button
            onClick={toggleMode}
            className="mt-4 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            {mode === "results" ? "Start Voting" : "Show Results"}
          </button>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {namedRaters.map((rater) => (
            <Badge key={rater.memberId} variant="secondary">
              {rater.name}
            </Badge>
          ))}
          {anonymousCount > 0 && (
            <Badge key="anonymous" variant="secondary">
              {anonymousCount} anonymous
            </Badge>
          )}
        </div>

        {mode === "results" && (
          <div className="mb-10 space-y-1.5">
            {histogram.map((h) => (
              <div key={h.rating} className="flex items-center gap-3">
                <span className="w-6 text-right text-sm text-muted-foreground">
                  {h.rating}
                </span>
                <div className="flex-1">
                  <div className="h-5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-foreground/20 transition-all"
                      style={{ width: `${(h.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm text-muted-foreground">
                  {h.count}
                </span>
              </div>
            ))}
          </div>
        )}

        {mode === "voting" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">Scan to rate this movie</p>
            <div className="w-full max-w-[min(70vw,50vh)] rounded-xl border p-3">
              <QRCodeSVG
                value={rateUrl}
                size={512}
                className="h-auto w-full"
                marginSize={4}
                level="M"
              />
            </div>
            <p className="w-full break-all text-center font-mono text-sm text-muted-foreground">
              {rateUrl}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
