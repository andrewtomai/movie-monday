import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, avg, count, isNotNull, isNull } from "drizzle-orm";
import { movies, members, ratings } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";
import { UNWATCHED, WATCHED } from "../../types";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const status = c.req.query("status");

  const baseQuery = db
    .select({
      id: movies.id,
      title: movies.title,
      nominatedBy: members.name,
      watchedAt: movies.watchedAt,
      createdAt: movies.createdAt,
      avgRating: avg(ratings.rating),
      ratingCount: count(ratings.id),
    })
    .from(movies)
    .leftJoin(members, eq(movies.nominatedBy, members.id))
    .leftJoin(ratings, eq(movies.id, ratings.movieId));

  const filteredQuery =
    status === WATCHED
      ? baseQuery.where(isNotNull(movies.watchedAt))
      : status === UNWATCHED
        ? baseQuery.where(isNull(movies.watchedAt))
        : baseQuery;

  const result = await filteredQuery.groupBy(movies.id);

  return c.json(
    result.map((r) => ({
      id: r.id,
      title: r.title,
      nominatedBy: r.nominatedBy,
      watchedAt: r.watchedAt,
      createdAt: r.createdAt,
      rating: {
        avg: r.avgRating ? Number(r.avgRating) : null,
        count: r.ratingCount,
      },
    })),
  );
});

export default app;
