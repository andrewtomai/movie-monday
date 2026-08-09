## Why

Leaving the rolling pool page (back-nav from voting pool, browser back, or page refresh) wipes every movie selection. The host rolls dice, advances, realizes someone was skipped, and going back starts the pool from scratch — all checked picks lost.

## What Changes

- Rolling pool is seeded once per movie-title set and frozen; leaving and returning to the page does not rebuild it.
- `assignRollingPool` is no longer triggered by an effect on every remount; seeding happens only when the pool is empty or the fetched titles differ from the pool's.
- Seeding waits for all attendees' movies to load (no partial pool).
- Checked state, shuffle order, and assigned numbers survive back-nav, browser back, and page refresh.
- `++random` reseed remains an explicit user action and keeps its current behavior.

## Capabilities

### New Capabilities

- `rolling-pool`: The rolling pool's lifecycle — seeding, checking, reseeding, and persistence across navigation.

### Modified Capabilities

- None.

## Impact

- `src/ui/pages/RollingPoolPage.tsx`: the seeding effect gains a guard (currently re-fires on every mount).
- `src/ui/store.ts`: `assignRollingPool` behavior may need adjustment (e.g., no-op when titles unchanged) if the guard lives there rather than in the page.
- `src/ui/hooks/useMemberMovies.ts`: seeding must wait for `isLoading === false`.
- Tests: `RollingPoolPage.test.tsx`, `store.test.ts`; add regression coverage for returning to the page with an existing pool.
- No API, schema, or dependency changes.
