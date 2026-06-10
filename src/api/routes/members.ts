import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, isNull } from "drizzle-orm";
import { members, movies } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";
import { UNWATCHED } from "../../types";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const role = c.req.query("role");

  const query = db
    .select({ id: members.id, name: members.name })
    .from(members);

  if (role) {
    const result = await query.where(eq(members.role, role));
    return c.json(result);
  }

  const result = await query;
  return c.json(result);
});

app.post("/", async (c) => {
  const db = drizzle(c.env.DB);
  const { name, role } = await c.req.json<{
    name?: string;
    role?: string;
  }>();

  if (!name) {
    return c.json({ error: "name is required" }, 400);
  }

  try {
    const result = await db
      .insert(members)
      .values({ name, role: role ?? "guest" })
      .returning({ id: members.id, name: members.name, role: members.role });

    return c.json(result[0], 201);
  } catch {
    return c.json({ error: "A person with that name already exists" }, 409);
  }
});

app.get("/:id/movies", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  const status = c.req.query("status");

  const conditions = [eq(movies.nominatedBy, id)];
  if (status === UNWATCHED) {
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
