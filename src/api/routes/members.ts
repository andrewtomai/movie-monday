import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, isNull } from "drizzle-orm";
import { members, movies } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db
    .select({ id: members.id, name: members.name })
    .from(members);
  return c.json(result);
});

app.get("/:id/movies", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  const status = c.req.query("status");

  const conditions = [eq(movies.nominatedBy, id)];
  if (status === "unwatched") {
    conditions.push(isNull(movies.watchedAt));
  }

  const result = await db
    .select({
      id: movies.id,
      title: movies.title,
      watchedAt: movies.watchedAt,
      createdAt: movies.createdAt,
    })
    .from(movies)
    .where(and(...conditions));

  return c.json(result);
});

export default app;
