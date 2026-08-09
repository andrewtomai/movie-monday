## Context

See proposal.md — Why.

Current state (in `src/ui/pages/RatingSummaryPage.tsx`):
- Page renders inside `PageLayout` (responsive widths: `max-w-lg md:max-w-4xl lg:max-w-6xl xl:max-w-7xl`) but an inner `div` forces `mx-auto max-w-lg` (512px) on all screens.
- The QR is `<QRCodeSVG value={rateUrl} size={160} />` (qrcode.react v4.2.0) at the bottom of the page, below the rating bars.
- `rateUrl = ${window.location.origin}/movie/${movieId}/rate`.
- Default QR props: `marginSize` 0 (no quiet zone), `level` "L" (~7% ECC).

## Goals / Non-Goals

**Goals:**
- QR large enough to scan from across a living room when the page is screenshared to a TV.
- QR above the fold on typical laptop viewports, and the first content users need during voting.
- A typeable URL fallback visible alongside the QR.
- Scanning remains reliable on cheap/busy video feeds (quiet zone + higher ECC).

**Non-Goals:**
- No new routing/URL scheme (a short alias like `/m/:id` is explicitly deferred).
- No copy-to-clipboard affordance.
- No behavior change on the `/movie/:id/rate` voting page itself.
- No styling overhaul beyond what's needed to enlarge/reposition the QR.

## Decisions

**1. Make the QR responsive via CSS, not a fixed pixel size.**
Wrap the QR in a container `w-full max-w-[min(70vw,50vh)]` and render the SVG with `size={512}` plus `h-auto w-full` so CSS scales it down/up. Rationale: SVG scaling is lossless, `min(70vw,50vh)` targets "as large as fits the screen" — on a 1280×800 laptop it lands ~400px, on a 1920×1080 share ~540px — and it needs no resize listener. Alternative rejected: a `useWindowSize` hook computing a number — more code, no benefit over CSS. The `size` attr is just a render buffer; any value ≥ the max CSS size is fine.

**2. Widen the page column from `max-w-lg` to `max-w-2xl`.**
The inner `mx-auto max-w-lg` (512px) would otherwise cap the QR at 512px even on a big TV. `max-w-2xl` (672px) lets the QR reach ~540px on a 1080p share while keeping a centered, readable layout. Alternative rejected: removing the inner cap entirely to inherit PageLayout's `max-w-4xl/6xl` — too wide for the reading layout. Alternative considered: breaking the QR out of the column entirely — unnecessary once the column is wide enough.

**3. Keep the QR below the rating bars: title → rating → bars → QR.**
The live score stays the primary visible element; the enlarged, responsive QR below it is large enough to scan from across the room, and the typeable URL text below the QR is the fallback if it's ever out of view or fails to scan. (An earlier draft moved the QR to the top for "above the fold" visibility; after review, the maintainer prefers the score-first layout.)

**4. Typeable URL fallback under the QR.**
Render the exact `rateUrl` string (monospace, `break-all`, muted) so it matches what's encoded and people can type it when scanning fails. Kept as plain text so the host can also click-select/copy it.

**5. Improve scan reliability: `marginSize={4}` and `level="M"`.**
The QR spec requires a 4-module quiet zone; the default is 0 and the current 12px border padding sits against a dark border. `M` (~15%) ECC tolerates more blur, which matters when the signal goes through HDMI + video compression. Alternative rejected: `Q`/`H` — more modules for the same data, slightly finer detail at a given size; `M` is the common sweet spot.

## Risks / Trade-offs

- [`min(70vw,50vh)` could make the QR small on very tall/narrow portrait screens] → `min()` picks the smaller; worst case it's still the full column width, and the URL text remains a fallback.
- [QR stays below the rating bars, so on short laptops it can sit below the fold] → accepted: the rating is the primary element, the QR is a large but secondary action, and the typeable URL text remains a fallback if it's out of view.
- [Text under a large QR adds visual clutter when projected] → keep it small and muted (sm, `text-muted-foreground`).
- [Changing `marginSize`/`level` alters the encoded pattern] → no functional impact; QR still encodes the same URL, just more robustly.
