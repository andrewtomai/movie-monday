## 1. Store idempotency

- [x] 1.1 Add a `titlesKey` helper (order-independent, duplicates preserved) in `src/ui/store.ts`
- [x] 1.2 Make `assignRollingPool` return early when the incoming title set equals the current pool's title set (preserving order and checked state)
- [x] 1.3 Keep existing behavior: empty titles array is a no-op, non-equal titles still shuffle-seed fresh

## 2. Seeding waits for full load

- [x] 2.1 In `RollingPoolPage.tsx`, gate the seeding effect on `!isLoading` from `useMembersMovies`
- [x] 2.2 Confirm the effect still seeds on first mount once all attendees' movies are loaded

## 3. Regression tests

- [x] 3.1 `src/ui/store.test.ts`: `assignRollingPool` with the same titles does not reshuffle or reset checked state
- [x] 3.2 `src/ui/store.test.ts`: `assignRollingPool` with changed titles re-seeds and clears checks
- [x] 3.3 `src/ui/pages/RollingPoolPage.test.tsx`: mock `useMemberMovies` to return loaded titles matching a pre-seeded, partially checked pool; assert pool and checks are unchanged after render (covers back-nav remount)
- [x] 3.4 `src/ui/pages/RollingPoolPage.test.tsx`: mock `useMemberMovies` with `isLoading: true`; assert pool is not seeded from partial data

## 4. Verify

- [x] 4.1 Run `yarn test -- src/ui/store.test.ts src/ui/pages/RollingPoolPage.test.tsx`
- [x] 4.2 Run `yarn lint` and `yarn tsc -b`
- [x] 4.3 Manual check in `yarn dev`: roll, check movies, advance to voting pool, go back — selections and order preserved
