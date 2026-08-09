## Why

At movie club, the host opens the rating summary page on a laptop and screenshares to the TV so attendees can scan the QR code and vote. The QR is currently a fixed 160px, tucked at the bottom of a 512px column, so on the TV it's too small to scan from the couch.

## What Changes

- Keep the QR below the rating bars (title → rating → bars → QR), but make it responsive: scale with the viewport (`w-full max-w-[min(70vw,50vh)]` + CSS-scaled SVG) so it grows to fill a good fraction of the screen when projected, while staying reasonable on phones/laptops.
- Widen the page content column from `max-w-lg` (512px) to `max-w-2xl` (672px) so the container no longer caps the QR on wide screens.
- Show the exact rate URL as typeable text under the QR, so people can enter it if scanning fails.
- Set `marginSize={4}` (spec-required quiet zone, currently 0) and `level="M"` (up from default `L`) for more reliable scanning at distance.

## Capabilities

### New Capabilities
- `rating-summary`: The rating summary page's on-screen presentation — a responsive, scannable QR for voting plus a typeable URL fallback, shown below the live ratings.

### Modified Capabilities
<!-- none — no existing specs in openspec/specs/ -->

## Impact

- `src/ui/pages/RatingSummaryPage.tsx` — layout reordering, responsive QR sizing, URL text, QR props.
- `qrcode.react` (already a dependency, v4.2.0) — no new deps.
- No API, routing, or database changes.
