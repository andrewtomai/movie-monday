import type { MovieStatus } from "../../types";

export const queryKeys = {
  movies: {
    all: ["movies"] as const,
    list: (status?: MovieStatus) => ["movies", status] as const,
    detail: (id: number) => ["movie", id] as const,
    ratings: (id: number) => ["movie", id, "ratings"] as const,
  },
  members: {
    all: ["members"] as const,
    movies: (id: number, status?: MovieStatus) => ["member-movies", id, status] as const,
  },
};
