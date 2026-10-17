import type { OmdbData } from "../api/movies";

interface OmdbRatingsProps {
  omdb?: OmdbData | null;
}

export function OmdbRatings({ omdb }: OmdbRatingsProps) {
  if (!omdb || (omdb.imdb == null && omdb.rt == null)) return null;

  return (
    <div className="flex items-center gap-1.5">
      {omdb.imdb != null && (
        <span className="rounded-md bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          IMDb {omdb.imdb.toFixed(1)}
        </span>
      )}
      {omdb.rt != null && (
        <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400">
          RT {omdb.rt}%
        </span>
      )}
    </div>
  );
}
