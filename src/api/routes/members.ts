import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { members } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";

type Env = { DB: D1Database };

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(members);
  const data = result.map((row) => ({
    name: row.name,
  }));
  return c.json(data);
});

export default app;
