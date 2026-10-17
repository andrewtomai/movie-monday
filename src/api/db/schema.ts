import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const members = sqliteTable(
  "members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    role: text("role").notNull().default("member"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    // Case-insensitive duplicate protection; SQLite's UNIQUE is case-sensitive
    nameNocaseUnique: uniqueIndex("members_name_nocase_unique").on(
      sql`lower(${t.name})`,
    ),
  }),
);

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

export const ratings = sqliteTable(
  "ratings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    rating: real("rating").notNull(),
    memberId: integer("member_id").references(() => members.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("ratings_member_movie_active").on(
      table.memberId,
      table.movieId,
    ),
  ],
);
