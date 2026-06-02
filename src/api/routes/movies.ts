import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { movies, members } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(movies)
    .leftJoin(members, eq(movies.nominatedBy, members.id));

  const data = result.map((row) => ({
    id: row.movies.id,
    title: row.movies.title,
    nominatedBy: row.members?.name ?? null,
    watchedAt: row.movies.watchedAt,
    createdAt: row.movies.createdAt,
  }));

  return c.json(data);
});

export default app;
