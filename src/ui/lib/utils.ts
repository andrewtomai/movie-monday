import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Guests who already exist as members under a variant of their name.
// Blocking these client-side avoids duplicate member rows.
const BLOCKED_GUEST_NAMES = new Set(["chris", "chris s", "chris stouffer"]);

export function isBlockedGuestName(name: string): boolean {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, " ");
  return BLOCKED_GUEST_NAMES.has(normalized);
}
