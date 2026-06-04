import { describe, it, expect, vi, beforeEach } from "vitest";
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

const mockRatingsRows = [
  { rating: 1, count: 0 },
  { rating: 2, count: 0 },
  { rating: 3, count: 0 },
  { rating: 4, count: 0 },
  { rating: 5, count: 0 },
  { rating: 6, count: 0 },
  { rating: 7, count: 3 },
  { rating: 8, count: 5 },
  { rating: 9, count: 3 },
  { rating: 10, count: 1 },
];

let resolveData: Array<unknown> = mockMovieRows;

const mockQueryBuilder: any = {
  leftJoin: vi.fn(() => mockQueryBuilder),
  where: vi.fn(() => mockQueryBuilder),
  build: vi.fn(() => mockQueryBuilder),
  groupBy: vi.fn(() => mockQueryBuilder),
  orderBy: vi.fn(() => mockQueryBuilder),
  then: (onfulfilled: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) =>
    Promise.resolve(resolveData).then(onfulfilled, onrejected),
};

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => ({
    select: () => ({
      from: vi.fn(() => mockQueryBuilder),
    }),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve({ success: true })),
      })),
    })),
  }),
}));

const { default: moviesRoutes } = await import("./movies");
const app = new Hono().route("/api/movies", moviesRoutes);

beforeEach(() => {
  resolveData = mockMovieRows;
  vi.clearAllMocks();
});

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

  it("GET /api/movies?status=watched returns 200", async () => {
    const res = await app.request("/api/movies?status=watched", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(3);
  });

  it("GET /api/movies?status=unwatched returns 200", async () => {
    const res = await app.request("/api/movies?status=unwatched", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
  });

  it("GET /api/movies?status=watched filters with isNotNull", async () => {
    await app.request("/api/movies?status=watched", {}, { DB: {} as D1Database });
    expect(mockQueryBuilder.where).toHaveBeenCalled();
  });

  describe("PATCH /api/movies/:id", () => {
    it("marks a movie as watched", async () => {
      const res = await app.request(
        "/api/movies/1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watchedAt: "2026-06-04" }),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it("returns 400 when watchedAt is missing", async () => {
      const res = await app.request(
        "/api/movies/1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("watchedAt is required");
    });

    it("returns 200 when watchedAt is null (unwatch)", async () => {
      const res = await app.request(
        "/api/movies/1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watchedAt: null }),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });
  });

  describe("GET /api/movies/:id", () => {
    it("returns movie with rating summary", async () => {
      const res = await app.request("/api/movies/1", {}, { DB: {} as D1Database });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        id: 1,
        title: "10 Things I Hate About You",
        nominatedBy: "Alex B",
        watchedAt: null,
        rating: { avg: null, count: 0 },
      });
    });

    it("returns 404 for non-existent movie", async () => {
      resolveData = [];
      const res = await app.request("/api/movies/999", {}, { DB: {} as D1Database });
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/movies/:id/ratings", () => {
    it("returns rating distribution", async () => {
      resolveData = mockRatingsRows;
      const res = await app.request("/api/movies/1/ratings", {}, { DB: {} as D1Database });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockRatingsRows);
    });
  });
});
