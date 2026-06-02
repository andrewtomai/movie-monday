import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { members, movies } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(members)
    .leftJoin(movies, eq(members.id, movies.nominatedBy));

  const memberMap = new Map<string, { name: string; movies: string[] }>();
  for (const row of result) {
    const name = row.members.name;
    if (!memberMap.has(name)) {
      memberMap.set(name, { name, movies: [] });
    }
    if (row.movies?.title) {
      memberMap.get(name)!.movies.push(row.movies.title);
    }
  }

  return c.json(Array.from(memberMap.values()));
});

export default app;
