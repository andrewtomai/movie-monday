import { describe, it, expect } from "vitest";
import app from "./app";

describe("worker", () => {
  it("GET /api/ping returns ok", async () => {
    const res = await app.request("/api/ping");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /api/ping responds with application/json", async () => {
    const res = await app.request("/api/ping");
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await app.request("/api/nope");
    expect(res.status).toBe(404);
  });
});
