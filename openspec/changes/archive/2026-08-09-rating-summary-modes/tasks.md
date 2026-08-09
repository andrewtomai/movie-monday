# Tasks

## 1. Backend — ratings endpoint shape

- [x] 1.1 Change `GET /api/movies/:id/ratings` in `src/api/routes/movies.ts` to join `ratings` → `members` and return one row per rater as `{ memberId, name, rating }`, ordered by member name (left join; drop the aggregate/groupBy).
- [x] 1.2 Update the `GET /api/movies/:id/ratings` test in `src/api/routes/movies.test.ts` to assert the new per-rater shape (member names included, no `count` aggregation).

## 2. Frontend API client

- [x] 2.1 In `src/ui/api/movies.ts`, replace `RatingDistribution` with a `MovieRater { memberId: number; name: string; rating: number }` type and update `fetchMovieRatings` to return `MovieRater[]`.
- [x] 2.2 Update the `useMovieRatings` mock in `src/ui/App.test.tsx` to return `MovieRater[]`.

## 3. Rating summary page — modes

- [x] 3.1 Add a `mode` state (`"results" | "voting"`, default `"results"`) to `RatingSummaryPage`, initialized from `localStorage` and persisted on toggle.
- [x] 3.2 Add a single toggle control: "Start Voting" in results mode, "Show Results" in voting mode.
- [x] 3.3 Render results mode: average score, rating count, who-voted chips, and histogram; no QR, no rate URL text.
- [x] 3.4 Render voting mode: rating count, who-voted chips, and the QR + typeable URL; no average score, no histogram.
- [x] 3.5 Add a who-voted chips row (name-only badges) from the raters list, shown in both modes.
- [x] 3.6 Derive the histogram client-side from the raters list with `useMemo` (group by `rating`, reuse the existing max-count bar normalization).
- [x] 3.7 Pass `{ refetchInterval: 5_000 }` to both `useMovie` and `useMovieRatings` so count, chips, and (in results mode) score update live.
- [x] 3.8 Remove the "Refresh Ratings" button and its toast (and the now-unused `sonner` import).
- [x] 3.9 Handle anonymous raters: return `{ memberId: null, name: null }` from the ratings endpoint and collapse them into a single "N anonymous" chip in both modes (with tests).

## 4. Page tests

- [x] 4.1 Add `src/ui/pages/RatingSummaryPage.test.tsx` mocking `useMovie`/`useMovieRatings`, covering: default results mode shows score and no QR; toggling to voting mode shows QR and hides the score; mode is restored from `localStorage` on load.

## 5. Verification

- [x] 5.1 Run `yarn lint`, `yarn tsc -b`, and `yarn test` and confirm all pass.
