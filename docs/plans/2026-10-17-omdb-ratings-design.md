# OMDb Ratings — Design

Date: 2026-10-17
Status: approved, awaiting implementation plan

## Goal

Show external ratings (IMDb + Rotten Tomatoes) from the OMDb API alongside club
ratings in two places:

1. Rankings page — next to the club average.
2. Rolling pool → voting pool flow — to help pick what to watch.

## Decision: seed-time import, no runtime OMDb calls

Movies enter the database only through hand-written seed migrations (there is no
create-movie endpoint), so OMDb data is fetched once by a dev-only generator
script and committed into the same seed migration.

Rejected alternatives:

- **One-time import, re-run by hand** — same idea, but no generator; 50 rows of
  hand-typed ids and scores. Generator script removes the typing.
- **Lazy cached fetch in the Worker** — auto-backfills new seeds, but needs a
  D1 cache schema, background `waitUntil` fetch, retry/negative-cache logic, and
  an API key as a Worker secret. Runtime code the app does not otherwise need.
- **Live fetch per request** — latency, rate-limit burn (1000 req/day free
  tier), OMDb downtime breaks the page.

Movie identity for OMDb is the stored `omdb_id` (`tt0081505`), never a runtime
title search. Title ambiguity (`Hamlet`, `The Thing`) is resolved once, by a
human reviewing generated values at seed time — the matched year makes a wrong
pick obvious.

## Schema (new migration `0010`)

Columns on `movies`:

| column | type | notes |
|---|---|---|
| `omdb_id` | `text`, unique, nullable | IMDb id; null = no chip, never fetched |
| `omdb_imdb_rating` | `real` | `7.8` |
| `omdb_rt_rating` | `integer` | `92`, displayed as `92%` |
| `omdb_year` | `text` | matched release year, eyeball check |

Nullable ratings mean "no data" — a movie added later without OMDb data still
works everywhere.

## Seed workflow

1. `scripts/omdb-seed.mjs` (plain ESM, no new dependencies) reads
   `OMDB_API_KEY` from `.env`, gets movie titles from D1 via
   `wrangler d1 execute … --json`, looks each up on OMDb, and prints draft
   `UPDATE movies SET omdb_id=…, omdb_imdb_rating=…, omdb_rt_rating=…, omdb_year=… WHERE id=…;`
   statements.
2. Human reviews the draft — especially returned `Title`/`Year` against ours.
3. Reviewed SQL becomes migration `0010` (or a later `UPDATE` migration for
   refreshes), applied with the normal migration flow.

The API key never leaves `.env`. `.env.example` (already un-ignored by
`.gitignore`) documents `OMDB_API_KEY=`.

Refreshing stale scores later = re-run the script scoped to all movies, review,
commit another `UPDATE` migration.

## Runtime

`GET /api/movies` selects four additional columns and includes:

```json
"omdb": { "imdb": 7.8, "rt": 92, "year": "1982" }
```

`"omdb": null` when `omdb_id` is absent. No other endpoint changes:
`GET /api/members/:id/movies` stays title-based, and the Worker never talks to
OMDb.

## UI

- `MovieCard` gains nothing structurally — the chip is passed through its
  existing (currently unused in these pages) `rightContent` prop.
- New presentational chip component rendering `IMDb 7.8` and `RT 92%`; renders
  nothing when `omdb` is null.
- Rankings page: chip beside the club average badge.
- Rolling pool + voting pool: both read movie data from the zustand store, which
  holds only `{title, isChecked}`. Rather than change that persisted shape, a new
  `useOmdbByTitle()` hook builds a `title → omdb` Map from one `useMovies()`
  query (`staleTime` already 5 min) and pages join by title.
- Zustand store untouched — no persisted-state migration, no `reseed` changes.

## Testing

- API: extend `src/api/routes/movies.test.ts` — response includes `omdb` object
  for a row with data, `null` for a row without. No `fetch` mocking.
- UI: chip renders both scores, hides on null; Rankings / RollingPool /
  VotingPool render it.

## Non-goals

- OMDb search UI for picking movies (future work — same `omdb_id` column and a
  proxy search endpoint keyed by the same secret).
- Posters, plot, genre, runtime.
- Sorting or filtering by external score.
- Any Worker secret or runtime network dependency.
