import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";

const mockMemberRows = [
  { id: 1, name: "Alex B" },
  { id: 2, name: "Alex L" },
  { id: 3, name: "Andrew" },
];

const mockMovieRows = [
  { id: 1, title: "10 Things I Hate About You", watchedAt: null, createdAt: "2026-01-01" },
  { id: 2, title: "The Orphanage", watchedAt: null, createdAt: "2026-01-01" },
];

const mockInsertValues = vi.fn();
const mockInsertReturning = vi.fn();

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => ({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockImplementation(() =>
        Object.assign(Promise.resolve(mockMemberRows), {
          where: vi.fn().mockResolvedValue(mockMovieRows),
        }),
      ),
    }),
    insert: vi.fn().mockReturnValue({
      values: mockInsertValues.mockReturnValue({
        returning: mockInsertReturning,
      }),
    }),
  }),
}));

const { default: membersRoutes } = await import("./members");
const app = new Hono().route("/api/members", membersRoutes);

describe("members", () => {
  it("GET /api/members returns members with id and name", async () => {
    const res = await app.request("/api/members", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(3);
    expect(body[0]).toEqual({ id: 1, name: "Alex B" });
    expect(body[1]).toEqual({ id: 2, name: "Alex L" });
    expect(body[2]).toEqual({ id: 3, name: "Andrew" });
  });

  it("GET /api/members responds with application/json", async () => {
    const res = await app.request("/api/members", {}, { DB: {} as D1Database });
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("POST /api/members returns 409 when the DB rejects an existing name", async () => {
    mockInsertReturning.mockRejectedValueOnce(
      new Error("UNIQUE constraint failed: members.name_nocase_unique"),
    );

    const res = await app.request(
      "/api/members",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Andrew" }),
      },
      { DB: {} as D1Database },
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ error: "A person with that name already exists" });
  });

  it("POST /api/members trims the name and defers casing to the DB index", async () => {
    for (const name of ["andrew", "ANDREW", "  Andrew  "]) {
      mockInsertReturning.mockRejectedValueOnce(
        new Error("UNIQUE constraint failed: members.name_nocase_unique"),
      );

      const res = await app.request(
        "/api/members",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        },
        { DB: {} as D1Database },
      );

      expect(res.status, `expected 409 for ${JSON.stringify(name)}`).toBe(409);
      const body = await res.json();
      expect(body).toEqual({ error: "A person with that name already exists" });
    }

    expect(mockInsertValues).toHaveBeenLastCalledWith({
      name: "Andrew",
      role: "guest",
    });
  });

  it("POST /api/members returns 409 when insert races a duplicate", async () => {
    mockInsertReturning.mockRejectedValueOnce(new Error("UNIQUE constraint failed"));

    const res = await app.request(
      "/api/members",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Zoe" }),
      },
      { DB: {} as D1Database },
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ error: "A person with that name already exists" });
  });

  it("POST /api/members creates a guest and returns 201", async () => {
    mockInsertReturning.mockResolvedValueOnce([{ id: 4, name: "Chris P", role: "guest" }]);

    const res = await app.request(
      "/api/members",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Chris P" }),
      },
      { DB: {} as D1Database },
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ id: 4, name: "Chris P", role: "guest" });
  });

  it("POST /api/members returns 400 when name is missing", async () => {
    const res = await app.request(
      "/api/members",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      },
      { DB: {} as D1Database },
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "name is required" });
  });
});

describe("member movies", () => {
  it("GET /api/members/:id/movies returns movies for a member", async () => {
    const res = await app.request("/api/members/1/movies", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({
      id: 1,
      title: "10 Things I Hate About You",
      watchedAt: null,
      createdAt: "2026-01-01",
    });
  });

  it("GET /api/members/:id/movies?status=unwatched filters to unwatched", async () => {
    const res = await app.request("/api/members/1/movies?status=unwatched", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
  });
});
