# OMDb Ratings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show IMDb and Rotten Tomatoes scores from OMDb next to club ratings on the Rankings page and in the rolling pool → voting pool flow.

**Architecture:** Scores are imported once at seed time by a dev-only generator script (`scripts/omdb-seed.mjs`) that prints draft `UPDATE` SQL for human review; the SQL lands in a hand-written D1 migration. The Worker only selects four extra columns from `movies` — it never calls OMDb and holds no API key. The UI renders a chip component; rolling/voting pages join by title through a `useOmdbByTitle()` hook so the zustand store stays untouched.

**Tech Stack:** Drizzle ORM + D1, Hono, React 19, TanStack Query, Vitest, plain-ESM Node script (no new dependencies).

**Design doc:** `docs/plans/2026-10-17-omdb-ratings-design.md` (approved).

---

### Task 1: Schema columns + migration

**Files:**
- Modify: `src/api/db/schema.ts:28-38` (movies table)
- Create: `src/api/db/migrations/0010_*.sql` (generated)

**Step 1: Add columns to the movies table**

In `src/api/db/schema.ts`, extend the `movies` table definition (keep existing columns exactly as they are):

```ts
export const movies = sqliteTable("movies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().unique(),
  nominatedBy: integer("nominated_by")
    .notNull()
    .references(() => members.id),
  watchedAt: text("watched_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  omdbId: text("omdb_id").unique(),
  omdbImdbRating: real("omdb_imdb_rating"),
  omdbRtRating: integer("omdb_rt_rating"),
  omdbYear: text("omdb_year"),
});
```

All four nullable — a movie without OMDb data still works everywhere.

**Step 2: Generate the migration**

Run: `yarn db:migration:create`
Expected: a new file `src/api/db/migrations/0010_<random_name>.sql` plus a `0010_*.json` snapshot in `meta/` and a new journal entry in `meta/_journal.json` (idx 10).

**Step 3: Inspect the generated SQL**

Run: `cat src/api/db/migrations/0010_*.sql`
Expected: `ALTER TABLE \`movies\` ADD \`omdb_id\` text;` and three more `ALTER TABLE ... ADD` lines (`omdb_imdb_rating`, `omdb_rt_rating`, `omdb_year`), plus possibly a `CREATE UNIQUE INDEX` for `omdb_id`. Do not hand-edit generated files.

**Step 4: Apply locally**

Run: `yarn db:migration:apply`
Expected: wrangler applies pending migrations to local D1 and reports success (it defaults to `--local`).

**Step 5: Commit**

```bash
git add src/api/db/schema.ts src/api/db/migrations/
git commit -m "feat: add omdb columns to movies"
```

---

### Task 2: API returns `omdb` on the movies list

**Files:**
- Test: `src/api/routes/movies.test.ts`
- Modify: `src/api/routes/movies.ts:12-52` (GET `/` only — `GET /:id` stays unchanged per design)

**Step 1: Write the failing test**

In `src/api/routes/movies.test.ts`:

1. Add OMDb fields to the third mock row only (rows 1-2 get `omdb: null` in the response):

```ts
{
  id: 3,
  title: "Baby Driver",
  nominatedBy: "Devin",
  watchedAt: "2026-02-09",
  createdAt: "2026-01-01",
  avgRating: 7.92,
  ratingCount: 12,
  omdbId: "tt3884356",
  omdbImdbRating: 7.5,
  omdbRtRating: 92,
  omdbYear: "2017",
},
```

2. The existing test `"GET /api/movies returns all movies with nested rating"` asserts `body[0]` with `toEqual`, so add the new key to that expectation:

```ts
expect(body[0]).toEqual({
  id: 1,
  title: "10 Things I Hate About You",
  nominatedBy: "Alex B",
  watchedAt: null,
  createdAt: "2026-01-01",
  rating: { avg: null, count: 0 },
  omdb: null,
});
```

3. Add a new test:

```ts
it("GET /api/movies includes omdb data when present", async () => {
  const res = await app.request("/api/movies", {}, { DB: {} as D1Database });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body[0].omdb).toBeNull();
  expect(body[2].omdb).toEqual({ imdb: 7.5, rt: 92, year: "2017" });
});
```

**Step 2: Run tests to verify failure**

Run: `yarn test -- src/api/routes/movies.test.ts`
Expected: FAIL — `expected {…} to deeply equal {…}` (missing `omdb` key) and `expected undefined to deep equal {…}`.

**Step 3: Implement**

In `src/api/routes/movies.ts`, add the four columns to the `db.select({...})` in the GET `/` route:

```ts
omdbId: movies.omdbId,
omdbImdbRating: movies.omdbImdbRating,
omdbRtRating: movies.omdbRtRating,
omdbYear: movies.omdbYear,
```

Add a module-level helper above the route definitions:

```ts
function toOmdb(r: {
  omdbId: string | null;
  omdbImdbRating: number | null;
  omdbRtRating: number | null;
  omdbYear: string | null;
}) {
  return r.omdbId
    ? { imdb: r.omdbImdbRating, rt: r.omdbRtRating, year: r.omdbYear }
    : null;
}
```

And in the `result.map(...)` return of GET `/`, add:

```ts
omdb: toOmdb(r),
```

Leave `GET /:id`, `GET /:id/ratings`, `POST`, `PATCH` untouched.

**Step 4: Run tests to verify pass**

Run: `yarn test -- src/api/routes/movies.test.ts`
Expected: PASS (all tests in file).

**Step 5: Commit**

```bash
git add src/api/routes/movies.ts src/api/routes/movies.test.ts
git commit -m "feat: include omdb ratings in movies list response"
```

---

### Task 3: `OmdbData` type + `OmdbRatings` chip component

**Files:**
- Modify: `src/ui/api/movies.ts:6-13`
- Create: `src/ui/components/OmdbRatings.tsx`
- Test: `src/ui/components/OmdbRatings.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/ui/components/OmdbRatings.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OmdbRatings } from "./OmdbRatings";

describe("OmdbRatings", () => {
  it("renders both IMDb and RT scores", () => {
    render(<OmdbRatings omdb={{ imdb: 7.5, rt: 92, year: "2017" }} />);
    expect(screen.getByText("IMDb 7.5")).toBeInTheDocument();
    expect(screen.getByText("RT 92%")).toBeInTheDocument();
  });

  it("renders nothing when omdb is null", () => {
    const { container } = render(<OmdbRatings omdb={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when omdb is undefined", () => {
    const { container } = render(<OmdbRatings />);
    expect(container).toBeEmptyDOMElement();
  });

  it("omits RT when rt is null", () => {
    render(<OmdbRatings omdb={{ imdb: 8.1, rt: null, year: "2019" }} />);
    expect(screen.getByText("IMDb 8.1")).toBeInTheDocument();
    expect(screen.queryByText(/RT/)).not.toBeInTheDocument();
  });

  it("omits IMDb when imdb is null", () => {
    render(<OmdbRatings omdb={{ imdb: null, rt: 96, year: "2020" }} />);
    expect(screen.getByText("RT 96%")).toBeInTheDocument();
    expect(screen.queryByText(/IMDb/)).not.toBeInTheDocument();
  });

  it("renders nothing when both scores are null", () => {
    const { container } = render(
      <OmdbRatings omdb={{ imdb: null, rt: null, year: "2021" }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
```

**Step 2: Run test to verify failure**

Run: `yarn test -- src/ui/components/OmdbRatings.test.tsx`
Expected: FAIL — module `./OmdbRatings` not found (import error).

**Step 3: Implement**

First the type in `src/ui/api/movies.ts`, above `MovieData`:

```ts
export interface OmdbData {
  imdb: number | null;
  rt: number | null;
  year: string | null;
}
```

Then add the optional field to `MovieData` (optional because `GET /api/movies/:id` does not return it — see design doc, list endpoint only):

```ts
export interface MovieData {
  id: number;
  title: string;
  nominatedBy: string;
  watchedAt: string | null;
  createdAt: string;
  rating: { avg: number | null; count: number };
  /** null = no OMDb data; undefined = endpoint does not return it. */
  omdb?: OmdbData | null;
}
```

The component:

```tsx
// src/ui/components/OmdbRatings.tsx
import type { OmdbData } from "../api/movies";

interface OmdbRatingsProps {
  omdb?: OmdbData | null;
}

export function OmdbRatings({ omdb }: OmdbRatingsProps) {
  if (!omdb || (omdb.imdb == null && omdb.rt == null)) return null;

  return (
    <div className="flex items-center gap-1.5">
      {omdb.imdb != null && (
        <span className="rounded-md bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          IMDb {omdb.imdb.toFixed(1)}
        </span>
      )}
      {omdb.rt != null && (
        <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400">
          RT {omdb.rt}%
        </span>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify pass**

Run: `yarn test -- src/ui/components/OmdbRatings.test.tsx`
Expected: PASS (6 tests).

**Step 5: Commit**

```bash
git add src/ui/api/movies.ts src/ui/components/OmdbRatings.tsx src/ui/components/OmdbRatings.test.tsx
git commit -m "feat: add OMDb ratings chip component"
```

---

### Task 4: Chip on the Rankings page

**Files:**
- Modify: `src/ui/pages/RankingsPage.tsx:91-121` (the watched-movies `MovieCard` loop)
- Test: `src/ui/pages/RankingsPage.test.tsx`

**Step 1: Write the failing test**

1. Add OMDb data to the first entry of `mockMoviesData` in `RankingsPage.test.tsx` (the "Baby Driver" row) and leave the rest without an `omdb` key:

```ts
{
  id: 1,
  title: "Baby Driver",
  nominatedBy: "Devin",
  watchedAt: "2026-02-09",
  createdAt: "2026-01-01",
  rating: { avg: 7.92, count: 12 },
  omdb: { imdb: 7.5, rt: 92, year: "2017" },
},
```

2. Add a test (inside the existing `describe`, after an existing render test):

```tsx
it("shows OMDb scores next to the club rating", () => {
  vi.mocked(useMovies).mockReturnValue({
    data: mockMoviesData,
    isLoading: false,
  } as ReturnType<typeof useMovies>);

  render(<RankingsPage />, { wrapper: createWrapper() });

  expect(screen.getByText("IMDb 7.5")).toBeInTheDocument();
  expect(screen.getByText("RT 92%")).toBeInTheDocument();
});

it("hides OMDb scores when a movie has no omdb data", () => {
  vi.mocked(useMovies).mockReturnValue({
    data: mockMoviesData,
    isLoading: false,
  } as ReturnType<typeof useMovies>);

  render(<RankingsPage />, { wrapper: createWrapper() });

  // "The Witch" row has no omdb data — only one IMDb chip on screen
  expect(screen.getAllByText(/^IMDb/)).toHaveLength(1);
});
```

Note: check how existing tests in this file set `useMovies` return values (some set it in `beforeEach`) and match that style — the point is `useMovies` must return `mockMoviesData` for these two assertions.

**Step 2: Run test to verify failure**

Run: `yarn test -- src/ui/pages/RankingsPage.test.tsx`
Expected: FAIL — `Unable to find an element with the text: IMDb 7.5`.

**Step 3: Implement**

In `src/ui/pages/RankingsPage.tsx` add the import:

```tsx
import { OmdbRatings } from "../components/OmdbRatings";
```

Inside the watched-movies `MovieCard`, insert the chip into `rightContent` between the club-score span and the trash button:

```tsx
rightContent={
  <div className="flex items-center gap-2">
    <OmdbRatings omdb={movie.omdb} />
    <span className="flex items-center gap-2">
      …existing club score markup…
    </span>
    …existing trash button…
  </div>
}
```

**Step 4: Run tests to verify pass**

Run: `yarn test -- src/ui/pages/RankingsPage.test.tsx`
Expected: PASS (existing + 2 new tests).

**Step 5: Commit**

```bash
git add src/ui/pages/RankingsPage.tsx src/ui/pages/RankingsPage.test.tsx
git commit -m "feat: show OMDb scores on rankings page"
```

---

### Task 5: `useOmdbByTitle` hook

**Files:**
- Create: `src/ui/hooks/useOmdbByTitle.ts`
- Test: `src/ui/hooks/useOmdbByTitle.test.ts`

**Step 1: Write the failing test**

```ts
// src/ui/hooks/useOmdbByTitle.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOmdbByTitle } from "./useOmdbByTitle";
import { useMovies } from "./useMovies";

vi.mock("./useMovies", () => ({
  useMovies: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOmdbByTitle", () => {
  it("maps titles to omdb data, skipping movies without data", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: [
        { id: 1, title: "Tenet", omdb: { imdb: 7.4, rt: 70, year: "2020" } },
        { id: 2, title: "Dunkirk", omdb: null },
        { id: 3, title: "Inception" },
      ],
    } as unknown as ReturnType<typeof useMovies>);

    const { result } = renderHook(() => useOmdbByTitle());

    expect(result.current.get("Tenet")).toEqual({
      imdb: 7.4,
      rt: 70,
      year: "2020",
    });
    expect(result.current.has("Dunkirk")).toBe(false);
    expect(result.current.has("Inception")).toBe(false);
  });

  it("returns an empty map while movies load", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMovies>);

    const { result } = renderHook(() => useOmdbByTitle());

    expect(result.current.size).toBe(0);
  });
});
```

**Step 2: Run test to verify failure**

Run: `yarn test -- src/ui/hooks/useOmdbByTitle.test.ts`
Expected: FAIL — cannot resolve `./useOmdbByTitle`.

**Step 3: Implement**

```ts
// src/ui/hooks/useOmdbByTitle.ts
import { useMemo } from "react";
import { useMovies } from "./useMovies";
import type { OmdbData } from "../api/movies";

export function useOmdbByTitle(): Map<string, OmdbData> {
  const { data } = useMovies();

  return useMemo(() => {
    const map = new Map<string, OmdbData>();
    for (const movie of data ?? []) {
      if (movie.omdb) map.set(movie.title, movie.omdb);
    }
    return map;
  }, [data]);
}
```

Uses the same `useMovies()` query (no status) already cached 5 min — rolling/voting pages reuse it instead of changing the zustand persisted shape.

**Step 4: Run test to verify pass**

Run: `yarn test -- src/ui/hooks/useOmdbByTitle.test.ts`
Expected: PASS (2 tests).

**Step 5: Commit**

```bash
git add src/ui/hooks/useOmdbByTitle.ts src/ui/hooks/useOmdbByTitle.test.ts
git commit -m "feat: add useOmdbByTitle hook"
```

---

### Task 6: Chip on Rolling Pool page

**Files:**
- Modify: `src/ui/pages/RollingPoolPage.tsx:68-78`
- Test: `src/ui/pages/RollingPoolPage.test.tsx`

**Step 1: Write the failing test**

1. Near the top of the test file, alongside the existing `vi.mock("../hooks/useMemberMovies", ...)`:

```ts
vi.mock("../hooks/useOmdbByTitle", () => ({
  useOmdbByTitle: vi.fn(),
}));

import { useOmdbByTitle } from "../hooks/useOmdbByTitle";
```

2. In `beforeEach`, after the existing `vi.clearAllMocks()`, add:

```ts
vi.mocked(useOmdbByTitle).mockReturnValue(new Map());
```

(`clearAllMocks` does not clear return values, so set the default every test.)

3. Add a test:

```tsx
it("shows OMDb scores for pool movies", () => {
  useStore.setState({
    selectedAttendees: [{ name: "Alice", id: 1 }],
    rollingPool: [
      { title: "Tenet", isChecked: false },
      { title: "Dunkirk", isChecked: false },
    ],
  });
  vi.mocked(useOmdbByTitle).mockReturnValue(
    new Map([
      ["Tenet", { imdb: 7.4, rt: 70, year: "2020" }],
    ]),
  );

  render(<RollingPoolPage />, { wrapper: createWrapper() });

  expect(screen.getByText("IMDb 7.4")).toBeInTheDocument();
  expect(screen.getByText("RT 70%")).toBeInTheDocument();
});
```

**Step 2: Run test to verify failure**

Run: `yarn test -- src/ui/pages/RollingPoolPage.test.tsx`
Expected: new test FAILS (`Unable to find an element with the text: IMDb 7.4`); existing tests keep passing (hook mocked).

**Step 3: Implement**

In `src/ui/pages/RollingPoolPage.tsx`:

```tsx
import { OmdbRatings } from "../components/OmdbRatings";
import { useOmdbByTitle } from "../hooks/useOmdbByTitle";
```

Call the hook with the other hooks (before the empty-pool early return):

```tsx
const omdbByTitle = useOmdbByTitle();
```

Add `rightContent` to the pool `MovieCard`:

```tsx
<MovieCard
  key={m.title}
  title={m.title}
  assignedNumber={i + 1}
  checked={m.isChecked}
  onClick={() => toggleChecked(m.title)}
  rightContent={<OmdbRatings omdb={omdbByTitle.get(m.title)} />}
/>
```

**Step 4: Run test to verify pass**

Run: `yarn test -- src/ui/pages/RollingPoolPage.test.tsx`
Expected: PASS (all).

**Step 5: Commit**

```bash
git add src/ui/pages/RollingPoolPage.tsx src/ui/pages/RollingPoolPage.test.tsx
git commit -m "feat: show OMDb scores in rolling pool"
```

---

### Task 7: Chip on Voting Pool page

**Files:**
- Modify: `src/ui/pages/VotingPoolPage.tsx:46-55`
- Test: `src/ui/pages/VotingPoolPage.test.tsx`

**Step 1: Write the failing test**

Same mock pattern as Task 6 (add `vi.mock("../hooks/useOmdbByTitle", ...)`, import, `beforeEach` default `new Map()`), then:

```tsx
it("shows OMDb scores for voted movies", () => {
  useStore.setState({
    rollingPool: [
      { title: "Tenet", isChecked: true },
      { title: "Dunkirk", isChecked: true },
    ],
  });
  vi.mocked(useOmdbByTitle).mockReturnValue(
    new Map([["Dunkirk", { imdb: 7.8, rt: 76, year: "2017" }]]),
  );

  render(<VotingPoolPage />, { wrapper: createWrapper() });

  expect(screen.getByText("IMDb 7.8")).toBeInTheDocument();
  expect(screen.getByText("RT 76%")).toBeInTheDocument();
});
```

**Step 2: Run test to verify failure**

Run: `yarn test -- src/ui/pages/VotingPoolPage.test.tsx`
Expected: new test FAILS; existing pass.

**Step 3: Implement**

In `src/ui/pages/VotingPoolPage.tsx` — call the hook at the top with the other hooks, **before** the `if (votingMovies.length === 0)` early return (rules of hooks):

```tsx
const omdbByTitle = useOmdbByTitle();
```

Add to the `MovieCard`:

```tsx
rightContent={<OmdbRatings omdb={omdbByTitle.get(title)} />}
```

Plus the two imports (`OmdbRatings`, `useOmdbByTitle`).

**Step 4: Run test to verify pass**

Run: `yarn test -- src/ui/pages/VotingPoolPage.test.tsx`
Expected: PASS (all).

**Step 5: Commit**

```bash
git add src/ui/pages/VotingPoolPage.tsx src/ui/pages/VotingPoolPage.test.tsx
git commit -m "feat: show OMDb scores in voting pool"
```

---

### Task 8: Seed generator script + `.env.example`

**Files:**
- Create: `scripts/omdb-seed.mjs`
- Create: `.env.example` (`.gitignore` already un-ignores it)

**Step 1: Write the script**

```js
// scripts/omdb-seed.mjs
// Prints draft UPDATE SQL for movies missing OMDb data.
// Review every line (especially matched Title/Year) before committing as a migration.
// Usage: node scripts/omdb-seed.mjs [--refresh]
//   --refresh  regenerate for movies that already have omdb_id
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Load .env without adding a dependency
try {
  const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of envFile.split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {
  /* no .env file */
}

const KEY = process.env.OMDB_API_KEY;
if (!KEY) {
  console.error("OMDB_API_KEY not set. Add it to .env (see .env.example).");
  process.exit(1);
}

const REFRESH = process.argv.includes("--refresh");

const rows = JSON.parse(
  execFileSync(
    "yarn",
    [
      "wrangler",
      "d1",
      "execute",
      "misc-movie-club-prod",
      "--local",
      "--json",
      "--command",
      "SELECT id, title, omdb_id FROM movies ORDER BY id",
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  ),
)[0].results;

const wanted = rows.filter((r) => REFRESH || !r.omdb_id);
const num = (v) => (v && v !== "N/A" ? v : null);
const pct = (v) => (v && v !== "N/A" ? Number.parseInt(v, 10) : null);
const q = (s) => (s == null ? "NULL" : `'${String(s).replaceAll("'", "''")}'`);

for (const row of wanted) {
  const params = new URLSearchParams({ apikey: KEY, t: row.title });
  const res = await fetch(`https://www.omdbapi.com/?${params}`);
  if (!res.ok) {
    console.error(`-- ${row.title}: HTTP ${res.status}, skipped`);
    continue;
  }
  const data = await res.json();
  if (data.Response === "False") {
    console.error(`-- NOT FOUND: ${row.title}`);
    continue;
  }
  const rt = (data.Ratings ?? []).find((r) => r.Source === "Rotten Tomatoes");
  console.log(
    `-- ours: ${row.title}\n` +
      `-- matched: ${data.Title} (${data.Year}) imdb=${data.imdbRating} rt=${rt ? rt.Value : "n/a"}\n` +
      `UPDATE movies SET omdb_id = ${q(data.imdbID)}, omdb_imdb_rating = ${num(data.imdbRating)}, ` +
      `omdb_rt_rating = ${pct(rt?.Value)}, omdb_year = ${q(data.Year)} WHERE id = ${row.id};\n`,
  );
}
console.error(`-- ${wanted.length} movies queried`);
```

**Step 2: `.env.example`**

```
# Get a key at https://www.omdbapi.com/apikey.aspx
OMDB_API_KEY=
```

**Step 3: Verify script fails cleanly without a key**

Run: `node scripts/omdb-seed.mjs`
Expected: prints `OMDB_API_KEY not set. Add it to .env (see .env.example).` and exits 1. (If `.env` already exists with your key, temporarily rename it for this check.)

**Step 4: Lint check**

Run: `yarn lint`
Expected: exit 0. (`eslint` flat config only applies rules to `**/*.{ts,tsx}`, so `.mjs` is skipped.) If it errors anyway, add `'scripts'` to the `globalIgnores` list in `eslint.config.js` and re-run.

**Step 5: Commit**

```bash
git add scripts/omdb-seed.mjs .env.example
git commit -m "feat: add OMDb seed generator script"
```

*(Real run with your key happens in Task 9 — requires your `OMDB_API_KEY` in `.env`.)*

---

### Task 9: Generate seed values and write migration `0011`

**Files:**
- Create: `src/api/db/migrations/0011_seed-omdb-ratings.sql`
- Modify: `src/api/db/migrations/meta/_journal.json` (append entry)

**This task needs the user: the API key lives in `.env` and the output must be human-reviewed.**

**Step 1: Make sure local D1 is current**

Run: `yarn db:migration:apply`
Expected: `0010` applied locally (or "No pending migrations").

**Step 2: Run the generator**

Run: `node scripts/omdb-seed.mjs`
Expected: one commented `UPDATE movies SET omdb_id = 'tt…', omdb_imdb_rating = …, omdb_rt_rating = …, omdb_year = '…' WHERE id = …;` block per movie, with `-- ours:` / `-- matched:` comment lines. Plus a stderr summary.

**Step 3: REVIEW GATE — user checks every `-- matched:` line**

Wrong match = wrong score forever. For each row compare `ours:` vs `matched:`. If a title matched the wrong film, fix it by hand before proceeding:
- search https://www.omdbapi.com/?t=Correct+Title&apikey=KEY for the right entry, or
- append `&y=YEAR` to the query URL to pin a year, then use that result's `imdbID`.

**Step 4: Write the migration**

Create `src/api/db/migrations/0011_seed-omdb-ratings.sql`:

```sql
-- OMDb data for existing movies. Generated by scripts/omdb-seed.mjs, hand-reviewed.
UPDATE movies SET omdb_id = 'tt3884356', omdb_imdb_rating = 7.5, omdb_rt_rating = 92, omdb_year = '2017' WHERE id = 1;
-- …one statement per movie, exactly as reviewed…
```

Add the journal entry — append to the `entries` array in `src/api/db/migrations/meta/_journal.json` after the `0009` entry (comma-correct):

```json
{
  "idx": 11,
  "version": "6",
  "when": 1792265342182,
  "tag": "0011_seed-omdb-ratings",
  "breakpoints": true
}
```

Use the current epoch-ms for `"when"`. (`0010` gets idx 10 from `drizzle-kit generate` — if you hand-write `0011` *before* running Task 1's generate, fix the idx numbers so they stay sequential.)

No `--> statement-breakpoint` lines needed (precedent: `0003_seed-movies-members.sql` has none).

**Step 5: Apply locally and verify**

Run: `yarn db:migration:apply`
Expected: applies `0010` + `0011` (or just `0011` if `0010` already applied).

Run: `yarn wrangler d1 execute misc-movie-club-prod --local --json --command "SELECT id, title, omdb_id, omdb_imdb_rating, omdb_rt_rating FROM movies ORDER BY id"`
Expected: every movie has a `tt…` id and numeric scores; count matches the movies table.

**Step 6: Commit**

```bash
git add src/api/db/migrations/0011_seed-omdb-ratings.sql src/api/db/migrations/meta/_journal.json
git commit -m "feat: seed OMDb ids and ratings for existing movies"
```

---

### Task 10: Full verification + production migration

**Step 1: Full local check**

Run: `yarn lint`
Expected: exit 0.

Run: `yarn test`
Expected: all test files pass (146 existing + ~15 new tests).

Run: `yarn tsc -b`
Expected: no type errors.

Run: `yarn build`
Expected: `tsc -b && vite build` completes.

**Step 2: Manual smoke test**

Run: `yarn dev`, open http://localhost:5173
Expected: Rankings page shows chips next to watched movies' club scores; Rolling Pool and Voting Pool show chips on the right of each row; a movie without `omdb_id` shows no chip; nothing errors in the console.

**Step 3: Apply migrations to production — BEFORE pushing**

> **Warning:** CI (`.github/workflows/deploy.yml`) deploys on push to `main` but never runs D1 migrations. The deployed code selects the new columns, so production `/api/movies` returns 500 until the migration is applied. Applying first is safe: the columns are nullable and the currently-deployed code ignores them.

Run: `yarn db:migration:apply --remote`
Expected: `0010` + `0011` applied to `misc-movie-club-prod`.

Verify: `yarn wrangler d1 execute misc-movie-club-prod --remote --json --command "SELECT COUNT(*) AS n FROM movies WHERE omdb_id IS NOT NULL"` — `n` equals the movie count.

Only after this succeeds: push the branch / merge to `main`.
