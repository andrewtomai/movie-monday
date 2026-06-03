import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";

const mockMovieRows = [
  {
    id: 1,
    title: "10 Things I Hate About You",
    nominatedBy: "Alex B",
    watchedAt: null,
    createdAt: "2026-01-01",
    avgRating: null,
    ratingCount: 0,
  },
  {
    id: 2,
    title: "The Orphanage",
    nominatedBy: "Alex B",
    watchedAt: null,
    createdAt: "2026-01-01",
    avgRating: null,
    ratingCount: 0,
  },
  {
    id: 3,
    title: "Baby Driver",
    nominatedBy: "Devin",
    watchedAt: "2026-02-09",
    createdAt: "2026-01-01",
    avgRating: 7.92,
    ratingCount: 12,
  },
];

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => ({
    select: () => ({
      from: () => ({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(mockMovieRows),
          }),
        }),
      }),
    }),
  }),
}));

const { default: moviesRoutes } = await import("./movies");
const app = new Hono().route("/api/movies", moviesRoutes);

describe("movies", () => {
  it("GET /api/movies returns all movies with nested rating", async () => {
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
      rating: { avg: null, count: 0 },
    });
    expect(body[2].rating).toEqual({ avg: 7.92, count: 12 });
  });

  it("GET /api/movies responds with application/json", async () => {
    const res = await app.request("/api/movies", {}, { DB: {} as D1Database });
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });
});
