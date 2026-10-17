import { useMemo } from "react";
import { useMovies } from "./useMovies";
import type { OmdbData } from "../api/movies";

export function useOmdbByTitle(): Map<string, OmdbData> {
  const { data } = useMovies();

  return useMemo(() => {
    const map = new Map<string, OmdbData>();
    for (const movie of data ?? []) {
      if (movie.omdb) map.set(movie.title, movie.omdb);
    }
    return map;
  }, [data]);
}
