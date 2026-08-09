## 1. QR placement and sizing

- [x] 1.1 In `src/ui/pages/RatingSummaryPage.tsx`, widen the page content container from `max-w-lg` to `max-w-2xl`
- [x] 1.2 Keep the QR below the rating bars: order the page content as movie title → rating summary (average, count, refresh) → per-star breakdown → QR block
- [x] 1.3 Render the QR in a container sized `w-full max-w-[min(70vw,50vh)]` and give the SVG `h-auto w-full` so it scales with the viewport
- [x] 1.4 Add a typeable fallback: render `rateUrl` as monospace, muted text (with `break-all`) beneath the QR, matching the encoded value

## 2. Scan reliability

- [x] 2.1 Add `marginSize={4}` to the QR for the spec-required quiet zone
- [x] 2.2 Raise the QR error-correction level to `M` via the `level` prop

## 3. Verification

- [x] 3.1 Confirm the rating summary (average, count, refresh) is the primary element at the top, with the QR below the per-star breakdown
- [x] 3.2 Confirm the QR scales up when the viewport is widened and down on narrow screens
- [x] 3.3 Run `yarn lint` and `yarn test`
