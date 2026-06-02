import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";
import moviesRoutes from "./routes/movies";
import membersRoutes from "./routes/members";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();
app.route("/api/movies", moviesRoutes);
app.route("/api/members", membersRoutes);

export default app;
