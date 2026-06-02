import { Hono } from "hono";

const app = new Hono();

app.get("/api/ping", (c) => c.json({ status: "ok" }));

export default app;
