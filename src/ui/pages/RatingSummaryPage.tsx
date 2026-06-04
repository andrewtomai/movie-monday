import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useMovie, useMovieRatings } from "../api/movies";

export function RatingSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const {
    data: movie,
    isLoading: movieLoading,
    isError: movieError,
  } = useMovie(movieId, { refetchInterval: 5_000 });
  const { data: ratings } = useMovieRatings(movieId, { refetchInterval: 5_000 });

  if (movieLoading) {
    return (
      <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
        <p className="text-center text-muted-foreground">Movie not found</p>
      </div>
    );
  }

  const maxCount = ratings ? Math.max(...ratings.map((r) => r.count), 1) : 1;
  const rateUrl = `${window.location.origin}/movie/${movieId}/rate`;

  return (
    <div className="mx-auto min-h-svh max-w-lg px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-light tracking-tight text-foreground">
        {movie.title}
      </h1>

      <div className="mb-8 text-center">
        <p className="text-7xl font-light tracking-tight text-foreground">
          {movie.rating.avg?.toFixed(2) ?? "—"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {movie.rating.count} {movie.rating.count === 1 ? "rating" : "ratings"}
        </p>
      </div>

      <div className="mb-10 space-y-1.5">
        {ratings?.map((r) => (
          <div key={r.rating} className="flex items-center gap-3">
            <span className="w-6 text-right text-sm text-muted-foreground">
              {r.rating}
            </span>
            <div className="flex-1">
              <div className="h-5 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground/20 transition-all"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <span className="w-8 text-right text-sm text-muted-foreground">
              {r.count}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">Scan to rate this movie</p>
        <div className="rounded-xl border p-3">
          <QRCodeSVG value={rateUrl} size={160} />
        </div>
      </div>
    </div>
  );
}
