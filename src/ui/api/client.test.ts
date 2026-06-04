import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, ApiError } from "./client";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ApiError", () => {
  it("is an instance of Error", () => {
    const err = new ApiError(404, "Not found");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("stores status and message", () => {
    const err = new ApiError(500, "Server error");
    expect(err.status).toBe(500);
    expect(err.message).toBe("Server error");
    expect(err.name).toBe("ApiError");
  });
});

describe("apiFetch", () => {
  it("returns JSON on success", async () => {
    const data = { name: "Alice", movies: ["Inception"] };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    } as Response);

    const result = await apiFetch<typeof data>("/api/members");
    expect(result).toEqual(data);
  });

  it("throws ApiError on non-ok response", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch");
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    await expect(apiFetch("/api/members")).rejects.toThrow(ApiError);
    await expect(apiFetch("/api/members")).rejects.toThrow(
      "API request failed: Not Found",
    );

    mockFetch.mockRestore();
  });

  it("throws ApiError with correct status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    try {
      await apiFetch("/api/members");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });

  it("calls fetch with the given path", async () => {
    const mockFetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await apiFetch("/api/members");
    expect(mockFetch).toHaveBeenCalledWith("/api/members", undefined);
  });
});
