import { describe, it, expect, vi } from "vitest";
import type { D1Database } from "@cloudflare/workers-types";

const mockMovieRows = [
  {
    movies: { id: 1, title: "10 Things I Hate About You", nominatedBy: 1, watchedAt: null, createdAt: "2026-01-01" },
    members: { id: 1, name: "Alex B", createdAt: "2026-01-01" },
  },
  {
    movies: { id: 2, title: "The Orphanage", nominatedBy: 1, watchedAt: null, createdAt: "2026-01-01" },
    members: { id: 1, name: "Alex B", createdAt: "2026-01-01" },
  },
  {
    movies: { id: 3, title: "Baby Driver", nominatedBy: 7, watchedAt: "2026-02-09", createdAt: "2026-01-01" },
    members: { id: 7, name: "Devin", createdAt: "2026-01-01" },
  },
];

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => ({
    select: () => ({
      from: () => ({
        leftJoin: vi.fn().mockResolvedValue(mockMovieRows),
      }),
    }),
  }),
}));

const { default: app } = await import("./app");

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

  it("GET /api/movies returns all movies with nominatedBy names", async () => {
    const res = await app.request("/api/movies", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(3);
    expect(body[0]).toEqual({
      id: 1,
      title: "10 Things I Hate About You",
      nominatedBy: "Alex B",
      watchedAt: null,
      createdAt: "2026-01-01",
    });
  });

  it("GET /api/movies responds with application/json", async () => {
    const res = await app.request("/api/movies", {}, { DB: {} as D1Database });
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });
});
