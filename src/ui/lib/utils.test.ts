import { describe, it, expect } from "vitest";
import { cn, isBlockedGuestName } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles clsx arrays", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("isBlockedGuestName", () => {
  it("blocks Chris S and Chris Stouffer in any casing", () => {
    expect(isBlockedGuestName("Chris")).toBe(true);
    expect(isBlockedGuestName("chris")).toBe(true);
    expect(isBlockedGuestName("CHRIS")).toBe(true);
    expect(isBlockedGuestName("Chris S")).toBe(true);
    expect(isBlockedGuestName("chris s")).toBe(true);
    expect(isBlockedGuestName("CHRIS S")).toBe(true);
    expect(isBlockedGuestName("Chris Stouffer")).toBe(true);
    expect(isBlockedGuestName("chrisSTOUFFER")).toBe(false);
    expect(isBlockedGuestName("chris stouffer")).toBe(true);
  });

  it("ignores surrounding and repeated whitespace", () => {
    expect(isBlockedGuestName("  Chris   S  ")).toBe(true);
  });

  it("allows other names", () => {
    expect(isBlockedGuestName("Chris P")).toBe(false);
    expect(isBlockedGuestName("Christine")).toBe(false);
    expect(isBlockedGuestName("Bob")).toBe(false);
    expect(isBlockedGuestName("")).toBe(false);
  });
});
