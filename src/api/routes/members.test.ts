import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";

const mockJoinedRows = [
  {
    members: { id: 1, name: "Alex B", createdAt: "2026-01-01" },
    movies: { title: "10 Things I Hate About You", id: 1, nominatedBy: 1, watchedAt: null, createdAt: "2026-01-01" },
  },
  {
    members: { id: 1, name: "Alex B", createdAt: "2026-01-01" },
    movies: { title: "The Orphanage", id: 2, nominatedBy: 1, watchedAt: null, createdAt: "2026-01-01" },
  },
  {
    members: { id: 2, name: "Alex L", createdAt: "2026-01-01" },
    movies: null,
  },
  {
    members: { id: 3, name: "Andrew", createdAt: "2026-01-01" },
    movies: { title: "Kubo and the Two Strings", id: 3, nominatedBy: 3, watchedAt: null, createdAt: "2026-01-01" },
  },
];

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => ({
    select: () => ({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockResolvedValue(mockJoinedRows),
      }),
    }),
  }),
}));

const { default: membersRoutes } = await import("./members");
const app = new Hono().route("/api/members", membersRoutes);

describe("members", () => {
  it("GET /api/members returns members with their movies", async () => {
    const res = await app.request("/api/members", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(3);
    expect(body[0]).toEqual({ name: "Alex B", movies: ["10 Things I Hate About You", "The Orphanage"] });
    expect(body[1]).toEqual({ name: "Alex L", movies: [] });
    expect(body[2]).toEqual({ name: "Andrew", movies: ["Kubo and the Two Strings"] });
  });

  it("GET /api/members responds with application/json", async () => {
    const res = await app.request("/api/members", {}, { DB: {} as D1Database });
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });
});
