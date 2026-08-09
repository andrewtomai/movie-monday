import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useMovie, useMovieRatings } from "../api/movies";
import { PageLayout } from "../components/PageLayout";

export function RatingSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const {
    data: movie,
    isLoading: movieLoading,
    isError: movieError,
    refetch: refetchMovie,
  } = useMovie(movieId);
  const { data: ratings, refetch: refetchRatings } = useMovieRatings(movieId);

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

  const maxCount = ratings ? Math.max(...ratings.map((r) => r.count), 1) : 1;
  const rateUrl = `${window.location.origin}/movie/${movieId}/rate`;

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl">
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
          <button
            onClick={async () => {
              await Promise.all([refetchMovie(), refetchRatings()]);
              toast.success("Ratings refreshed");
            }}
            className="mt-4 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            Refresh Ratings
          </button>
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
      </div>
    </PageLayout>
  );
}
