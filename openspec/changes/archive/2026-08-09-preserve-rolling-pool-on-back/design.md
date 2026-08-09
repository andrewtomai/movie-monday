## Context

Rolling pool is seeded by a `useEffect` in `RollingPoolPage.tsx:31-35` that calls `assignRollingPool(titles)` on every mount (see proposal.md - Why). `assignRollingPool` (store.ts:42-52) unconditionally rebuilds the pool — reshuffling and resetting `isChecked` to `false` — so any remount discards selections. `useMembersMovies` returns a stable `titles` reference between renders (react-query `combine` memoizes via `replaceEqualDeep`), so the effect fires on mount and on genuine data changes, not every render. The store is persisted to localStorage via zustand `persist`.

## Goals / Non-Goals

**Goals:**
- Make pool seeding idempotent: same title set in, same pool out (order + checks preserved).
- Never seed from a partially loaded title set.
- Keep `++random` reseed and attendee-change re-seed working as today.

**Non-Goals:**
- No UI changes, no new routes, no state shape changes (no localStorage migration).
- Not touching the render-phase `navigate()` in `VotingPoolPage.tsx:33` (unrelated latent wart).
- Not deduplicating movie titles that appear via multiple attendees (pre-existing behavior, out of scope).

## Decisions

### D1: Idempotency enforced in the store, not the page

`assignRollingPool` no-ops when the incoming title set equals the current pool's title set. Rationale: the store owns the pool, so it is the single enforcement point; the page effect can then fire harmlessly on remount and still preserve checks. Comparison is order-independent (sorted, joined) because the pool is shuffled and duplicates are preserved on both sides.

```ts
const titlesKey = (movies: { title: string }[]) =>
  movies.map((m) => m.title).sort().join("\n");

assignRollingPool: (titles) => {
  if (titles.length === 0) return;
  const { rollingPool } = get();
  if (rollingPool.length > 0 && titlesKey(rollingPool) === titlesKey(titles.map((title) => ({ title }))))
    return;
  set({ rollingPool: shuffle(titles.map((title) => ({ title, isChecked: false }))) });
}
```

Alternative considered — guard in the page effect (`if (rollingPool.length === 0)` or title comparison there): works but leaves the invariant out of the store, and a pure `length === 0` guard fails the attendee-change case (stale pool survives). Rejected.

### D2: Gate seeding on `isLoading` in the page effect

`useMembersMovies` already exposes `isLoading` (`some` result still loading). The effect becomes `if (titles.length > 0 && !isLoading) assignRollingPool(titles)`. This prevents seeding from a partial union when one attendee's movies resolve slower than another's. Without the gate, the store no-op (D1) would still converge after the second seed, but the pool would flash partially built and any check made in between would be discarded.

### D3: No changes to reseed or attendee flows

`reseed` is an explicit user action and stays as-is. Attendee change already yields a different title set, so D1's comparison naturally re-seeds. No extra state (e.g., "seeded attendee ids") needed.

## Risks / Trade-offs

- [Store no-op relies on title equality, so two different attendees with identical unwatched title sets are treated as the same pool] → Acceptable: same titles means the pool is visually identical; order and checks carry over, which matches user intent. If attendee-change re-seed must still be exact, add a seeded-attendee-ids check later — spec does not require it.
- [Title comparison is O(n log n) per call] → Pools are small (tens of movies); negligible.
- [A movie newly becoming watched mid-session changes the title set and re-seeds mid-game] → Matches spec ("Changed title set re-seeds"); rare in practice.

## Migration Plan

No database or persisted-state migration (state shape unchanged). Deploy = normal release. Rollback = revert commit; old code re-enables re-seeding but nothing else regresses.

## Open Questions

None — remaining unknowns (dedupe of shared titles, render-phase navigate in VotingPoolPage) are explicitly out of scope, not blockers.
