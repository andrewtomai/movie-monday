# Rating summary modes — Design

## Context

See proposal.md — Why. The rating summary page currently renders score, histogram, and QR together with a manual "Refresh Ratings" button. The ratings endpoint (`GET /api/movies/:id/ratings`) returns an aggregated distribution (`[{rating, count}]`) which cannot answer "who voted" — the new chips requirement — because member names are not in the payload. The frontend (`src/ui/api/movies.ts`) and `App.test.tsx` mock this shape today.

## Goals / Non-Goals

**Goals**
- Two client-side modes (results default, voting toggled) with a single toggle control, persisted across reloads.
- Live count + who-voted chips in both modes; score + histogram only in results mode.
- Live score updates in results mode (post-reveal consent).
- Minimal backend surface: no new endpoint, one shape change to the existing ratings endpoint.

**Non-Goals**
- Server-side enforcement of score hiding (no auth in the app; the mode toggle is a room-experience mechanism, not a security boundary).
- Tracking "who has NOT voted" against an attendee roster — there is no reliable per-movie denominator; guests are created as members on first vote.
- Per-voter score display in chips (names only, per decision).

## Decisions

### 1. Two-mode UI with localStorage persistence
`RatingSummaryPage` holds a `mode` state (`"results" | "voting"`), initialized from `localStorage` (default `"results"`), written back on toggle. The control reads "Start Voting" in results mode and "Show Results" in voting mode.

- **Rationale**: Results-first default (user decision) plus persistence means a refresh while voting does not flip the projector back to a live score mid-event — the exact footgun that motivated this change.
- **Alternative considered**: no persistence — simpler, but a host refresh during voting would expose the score live on screen. Rejected.

### 2. Reuse existing endpoints; hide score client-side
Poll both `useMovie(id, { refetchInterval: 5_000 })` and `useMovieRatings(id, { refetchInterval: 5_000 })` in both modes. In voting mode the avg (inside the `movie` payload) and individual ratings (inside the raters list) are fetched and cached but never rendered.

- **Rationale**: Explicit user decision ("client side is fine"). No new endpoint. Poll interval matches the pre-existing behavior that predates the manual refresh button.
- **Alternative considered**: dedicated `GET /api/movies/:id/ratings/count` endpoint returning only `{count}` so score data never leaves the server pre-reveal. Rejected by the user as unnecessary.

### 3. Ratings endpoint returns per-rater rows
Change `GET /api/movies/:id/ratings` to join `ratings` → `members` and return `[{ memberId, name, rating }]` ordered by `name`. This is a **BREAKING** shape change.

- **Rationale**: the who-voted chips need member names, which the aggregated distribution cannot provide. A single polled list feeds all three derived views:
  - count → `movie.rating.count` (already polled via `useMovie`; equals list length)
  - chips → the list itself (names only)
  - histogram → client-side `reduce` grouping by `rating`
- **Alternative considered**: keep the distribution endpoint and add a separate `/voters` endpoint — two calls and redundant payloads. Rejected.
- Note: `ratings.memberId` is nullable in the schema but the POST handler requires it, so a left join is used defensively.

### 4. Derived histogram
Replace the server-side grouped distribution with a `useMemo` that reduces the raters list into `{rating, count}` bins, then reuses the existing max-count normalization for bar widths.

- **Rationale**: the histogram is now a pure function of the raters list; no second shape to keep in sync.

### 5. Chips UI and removal of refresh button
Render name-only wrapping chips (shadcn `Badge`) from the raters list in both modes. Remove the "Refresh Ratings" button and its toast entirely — the toggle replaces it.

- **Rationale**: guests created on first vote appear as chips immediately, giving the live "who has voted" effect the club asked for.
- Anonymous raters (seeded votes predating the member system) have `member_id` null. The endpoint returns `{ memberId: null, name: null }` for them and the UI collapses all such raters into a single "N anonymous" aggregate chip rather than rendering empty badges. The count and histogram still include anonymous votes.

## Risks / Trade-offs

- **Score present in the network payload during voting mode** (avg in `movie`, individual ratings in raters list) → Accepted by explicit user choice. Mitigation: rendering is strictly gated on mode; no score UI code path executes in voting mode.
- **Results-as-default leaks the live score to any fresh page load mid-voting** → Accepted as the user's chosen default. Mitigated for the host by localStorage persistence; a brand-new tab intentionally shows results.
- **Breaking API shape** → Only consumer is the SPA served by the same Worker, deployed atomically; `movies.test.ts` and the `App.test.tsx` mock updated in the same change.
- **Null member join edge case** → Seeded ratings predate the member system and have `member_id` null. The route returns `{ memberId: null, name: null }` (no name coercion) and the UI shows a single "N anonymous" chip; count/histogram still include these votes.

## Migration Plan

No DB migration or new dependency. Backend route and frontend ship together in one Worker deploy (single build), so the shape change is atomic. Rollback = redeploy the previous commit.

## Open Questions

None — remaining details (poll interval of 5s, alphabetical chip ordering, badge styling) are minor assumptions recorded here and safe to adjust without touching specs.
