## Why

During movie club, attendees wanted to watch the live count of ratings submitted but NOT see the live score — the score should stay hidden until the host chooses to reveal it. The current rating summary page always renders the score, histogram, and QR together (with only a manual "Refresh Ratings" button), so there is no way to project the voting screen without exposing the score.

## What Changes

- Split the rating summary page into two togglable modes, defaulting to **results**:
  - **Results mode** (default): shows the average score, rating count, a chip for each person who voted, and the histogram. No QR. Offers a "Start Voting" button.
  - **Voting mode**: shows the live rating count, live chips of who has voted, and the QR code + typeable URL. Hides the average and histogram. Offers a "Show Results" button.
- Both modes poll the movie and its ratings every ~5 seconds so the count and the who-voted chips update live. Score data is fetched but never rendered in voting mode (client-side hiding only).
- The "Refresh Ratings" button and its toast are removed; the mode toggle replaces it.
- **BREAKING**: `GET /api/movies/:id/ratings` changes from an aggregated distribution (`[{rating, count}]`) to one row per rater (`[{memberId, name, rating}]`). The client derives the count and histogram from this list.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rating-summary`: The rating summary page gains two modes. The QR (and typeable URL) renders only in voting mode, alongside a live rating count and live who-voted chips; the average score and histogram render only in results mode. The page polls to keep the count and voter list live in both modes.

## Impact

- `src/api/routes/movies.ts` — `GET /:id/ratings` response shape (join members, drop aggregation).
- `src/api/routes/movies.test.ts` — update the `GET /:id/ratings` test for the new shape.
- `src/ui/api/movies.ts` — `RatingDistribution` type and `fetchMovieRatings` return type.
- `src/ui/pages/RatingSummaryPage.tsx` — mode state, conditional rendering, chips, derived histogram, polling, toggle button.
- `src/ui/App.test.tsx` — update the `useMovieRatings` mock to the new shape.
