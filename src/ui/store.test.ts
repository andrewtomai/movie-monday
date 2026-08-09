import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./store";

beforeEach(() => {
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
});

describe("store", () => {
  describe("setAttendees", () => {
    it("sets selected attendees with name and id", () => {
      useStore
        .getState()
        .setAttendees([
          { name: "Alice", id: 1 },
          { name: "Bob", id: 2 },
        ]);
      expect(useStore.getState().selectedAttendees).toEqual([
        { name: "Alice", id: 1 },
        { name: "Bob", id: 2 },
      ]);
    });
  });

  describe("assignRollingPool", () => {
    it("creates rolling pool from title strings", () => {
      useStore.getState().assignRollingPool(["Inception", "Tenet", "Dunkirk"]);

      const pool = useStore.getState().rollingPool;
      const titles = pool.map((m) => m.title);

      expect(titles).toContain("Inception");
      expect(titles).toContain("Tenet");
      expect(titles).toContain("Dunkirk");
      expect(pool.every((m) => m.isChecked === false)).toBe(true);
    });

    it("does nothing when titles array is empty", () => {
      useStore.getState().assignRollingPool([]);
      expect(useStore.getState().rollingPool).toEqual([]);
    });

    it("does not reshuffle or reset checks when given the same titles", () => {
      useStore.setState({
        rollingPool: [
          { title: "Tenet", isChecked: true },
          { title: "Dunkirk", isChecked: false },
        ],
      });

      useStore.getState().assignRollingPool(["Dunkirk", "Tenet"]);

      expect(useStore.getState().rollingPool).toEqual([
        { title: "Tenet", isChecked: true },
        { title: "Dunkirk", isChecked: false },
      ]);
    });

    it("re-seeds and clears checks when titles change", () => {
      useStore.setState({
        rollingPool: [
          { title: "Tenet", isChecked: true },
          { title: "Dunkirk", isChecked: false },
        ],
      });

      useStore.getState().assignRollingPool(["Tenet", "Dunkirk", "Inception"]);

      const pool = useStore.getState().rollingPool;
      expect(pool.map((m) => m.title).sort()).toEqual([
        "Dunkirk",
        "Inception",
        "Tenet",
      ]);
      expect(pool.every((m) => !m.isChecked)).toBe(true);
    });

    it("shuffles the pool when re-seeding with changed titles", () => {
      const titles = ["Inception", "Tenet", "Dunkirk", "Baby Driver"];

      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const variant = titles.map((t) => `${t}-${i}`);
        useStore.getState().assignRollingPool(variant);
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
        rollingPool: [
          { title: "Tenet", isChecked: true },
        ],
      });

      useStore.getState().toggleChecked("Tenet");
      expect(useStore.getState().rollingPool[0].isChecked).toBe(false);
    });
  });

  describe("reseed", () => {
    it("reshuffles rolling pool and resets checked states", () => {
      useStore.setState({
        rollingPool: [
          { title: "Inception", isChecked: true },
          { title: "Tenet", isChecked: false },
        ],
      });

      useStore.getState().reseed();
      expect(useStore.getState().rollingPool.every((m) => !m.isChecked)).toBe(
        true,
      );
    });
  });

  describe("reset", () => {
    it("clears selected attendees and rolling pool", () => {
      useStore.setState({
        selectedAttendees: [{ name: "Alice", id: 1 }],
        rollingPool: [{ title: "Inception", isChecked: false }],
      });

      useStore.getState().reset();
      expect(useStore.getState().selectedAttendees).toEqual([]);
      expect(useStore.getState().rollingPool).toEqual([]);
    });
  });
});
