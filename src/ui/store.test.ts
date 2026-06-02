import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./store";
import type { MemberData } from "./api/members";

const mockMembers: MemberData[] = [
  { name: "Alice", movies: ["Inception", "Tenet", "Baby Driver"] },
  { name: "Bob", movies: ["Inception", "Dunkirk"] },
  { name: "Charlie", movies: ["Oppenheimer"] },
];

beforeEach(() => {
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
});

describe("store", () => {
  describe("setAttendees", () => {
    it("sets selected attendees", () => {
      useStore.getState().setAttendees(["Alice", "Bob"]);
      expect(useStore.getState().selectedAttendees).toEqual(["Alice", "Bob"]);
    });
  });

  describe("assignRollingPool", () => {
    it("creates rolling pool from selected members' unwatched movies", () => {
      useStore.getState().setAttendees(["Alice", "Bob"]);
      useStore.getState().assignRollingPool(mockMembers);

      const pool = useStore.getState().rollingPool;
      const titles = pool.map((m) => m.title);

      expect(titles).toContain("Tenet");
      expect(titles).toContain("Dunkirk");
      expect(titles).not.toContain("Baby Driver");
      expect(pool.every((m) => m.isChecked === false)).toBe(true);
    });

    it("deduplicates movies across members", () => {
      useStore.getState().setAttendees(["Alice", "Bob"]);
      useStore.getState().assignRollingPool(mockMembers);

      const titles = useStore
        .getState()
        .rollingPool.map((m) => m.title);
      const inceptionCount = titles.filter((t) => t === "Inception").length;
      expect(inceptionCount).toBe(1);
    });

    it("returns empty pool when no eligible movies", () => {
      useStore.getState().setAttendees(["Charlie"]);
      useStore.getState().assignRollingPool(mockMembers);
      expect(useStore.getState().rollingPool).toHaveLength(1);
    });

    it("does nothing when members array is empty", () => {
      useStore.getState().setAttendees(["Alice"]);
      useStore.getState().assignRollingPool([]);
      expect(useStore.getState().rollingPool).toEqual([]);
    });

    it("shuffles the pool", () => {
      useStore.getState().setAttendees(["Alice", "Bob", "Charlie"]);

      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        useStore.getState().assignRollingPool(mockMembers);
        const order = useStore
          .getState()
          .rollingPool.map((m) => m.title)
          .join(",");
        results.add(order);
      }

      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("toggleChecked", () => {
    it("toggles isChecked for a movie", () => {
      useStore.setState({
        rollingPool: [
          { title: "Tenet", isChecked: false },
          { title: "Dunkirk", isChecked: false },
        ],
      });

      useStore.getState().toggleChecked("Tenet");
      expect(useStore.getState().rollingPool[0].isChecked).toBe(true);
      expect(useStore.getState().rollingPool[1].isChecked).toBe(false);
    });

    it("toggles back to unchecked", () => {
      useStore.setState({
        rollingPool: [{ title: "Tenet", isChecked: true }],
      });

      useStore.getState().toggleChecked("Tenet");
      expect(useStore.getState().rollingPool[0].isChecked).toBe(false);
    });
  });

  describe("reseed", () => {
    it("shuffles the pool and resets all checked states", () => {
      useStore.setState({
        rollingPool: [
          { title: "Tenet", isChecked: true },
          { title: "Dunkirk", isChecked: false },
        ],
      });

      useStore.getState().reseed();
      const pool = useStore.getState().rollingPool;

      expect(pool.every((m) => m.isChecked)).toBe(false);
      expect(pool.map((m) => m.title).sort()).toEqual([
        "Dunkirk",
        "Tenet",
      ]);
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      useStore.setState({
        selectedAttendees: ["Alice"],
        rollingPool: [{ title: "Tenet", isChecked: false }],
      });

      useStore.getState().reset();
      expect(useStore.getState().selectedAttendees).toEqual([]);
      expect(useStore.getState().rollingPool).toEqual([]);
    });
  });
});
