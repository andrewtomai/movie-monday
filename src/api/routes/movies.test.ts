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
  { memberId: 1, name: "Alice", rating: 8 },
  { memberId: 2, name: "Bob", rating: 7 },
  { memberId: 3, name: "Devin", rating: 9 },
  { memberId: null, name: null, rating: 7 },
];

let resolveData: Array<unknown> = mockMovieRows;

const mockQueryBuilder: any = {
  leftJoin: vi.fn(() => mockQueryBuilder),
  where: vi.fn(() => mockQueryBuilder),
  build: vi.fn(() => mockQueryBuilder),
  groupBy: vi.fn(() => mockQueryBuilder),
  orderBy: vi.fn(() => mockQueryBuilder),
  limit: vi.fn(() => mockQueryBuilder),
  then: (onfulfilled: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) =>
    Promise.resolve(resolveData).then(onfulfilled, onrejected),
};

let insertResolve: unknown = undefined;

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
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => Promise.resolve(insertResolve)),
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
    it("returns one row per rater with member names", async () => {
      resolveData = mockRatingsRows;
      const res = await app.request("/api/movies/1/ratings", {}, { DB: {} as D1Database });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockRatingsRows);
    });
  });

  describe("POST /api/movies/:id/ratings", () => {
    beforeEach(() => {
      insertResolve = undefined;
    });

    it("creates a new rating", async () => {
      resolveData = mockMovieRows;
      const res = await app.request(
        "/api/movies/1/ratings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: 1, rating: 8 }),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it("updates an existing rating (upsert)", async () => {
      resolveData = mockMovieRows;
      const first = await app.request(
        "/api/movies/1/ratings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: 1, rating: 8 }),
        },
        { DB: {} as D1Database },
      );
      expect(first.status).toBe(200);

      const second = await app.request(
        "/api/movies/1/ratings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: 1, rating: 9 }),
        },
        { DB: {} as D1Database },
      );
      expect(second.status).toBe(200);
      expect(await second.json()).toEqual({ success: true });
    });

    it("returns 400 when memberId is missing", async () => {
      const res = await app.request(
        "/api/movies/1/ratings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: 8 }),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("memberId and rating are required");
    });

    it("returns 400 when rating is missing", async () => {
      const res = await app.request(
        "/api/movies/1/ratings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: 1 }),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("memberId and rating are required");
    });

    it("returns 404 for non-existent movie", async () => {
      resolveData = [];
      const res = await app.request(
        "/api/movies/999/ratings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: 1, rating: 8 }),
        },
        { DB: {} as D1Database },
      );
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Movie not found");
    });
  });
});
