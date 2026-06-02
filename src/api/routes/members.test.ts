import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";

const mockMemberRows = [
  { id: 1, name: "Alex B", createdAt: "2026-01-01" },
  { id: 2, name: "Alex L", createdAt: "2026-01-01" },
  { id: 3, name: "Andrew", createdAt: "2026-01-01" },
];

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => ({
    select: () => ({
      from: vi.fn().mockResolvedValue(mockMemberRows),
    }),
  }),
}));

const { default: membersRoutes } = await import("./members");
const app = new Hono().route("/api/members", membersRoutes);

describe("members", () => {
  it("GET /api/members returns all members", async () => {
    const res = await app.request("/api/members", {}, { DB: {} as D1Database });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(3);
    expect(body[0]).toEqual({ name: "Alex B" });
    expect(body[1]).toEqual({ name: "Alex L" });
    expect(body[2]).toEqual({ name: "Andrew" });
  });

  it("GET /api/members responds with application/json", async () => {
    const res = await app.request("/api/members", {}, { DB: {} as D1Database });
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
  });
});
