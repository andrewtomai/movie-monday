# Rankings & History Ratings Design

## Summary
Add ratings to watched-movie history entries and create a `/rankings` page to view them sorted by rating.

## Config Change
- `src/config/history.ts`: `watchedMovies` changes from `string[]` to `{ title: string; rating: number }[]`
- Rating is a decimal number on a 1-10 scale (user fills in from outside the app)

## Store Impact
- `eligibleMovies` filter updates from `!watchedMovies.includes(m)` to `!watchedMovies.map(w => w.title).includes(m)`

## New Route
- `/rankings` → `RankingsPage` component
- Displays watched movies sorted by rating descending
- "Back to Home" link to `/`

## Homepage Update
- Add "View Rankings" link/button to `AttendeeSelectPage`

## What Stays the Same
- All 3 wizard steps unchanged
- No new state or localStorage changes
