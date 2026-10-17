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
