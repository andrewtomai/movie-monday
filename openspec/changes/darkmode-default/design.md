# Design

See `proposal.md` for motivation and `specs/color-theme/spec.md` for the behavior contract.

## Context

- Tailwind v4 with shadcn/ui "radix-nova" style. All colors come from CSS variables (`--background`, `--foreground`, `--card`, …) defined twice in `src/ui/index.css`: `:root` (light) and `.dark`. The `@custom-variant dark (&:is(.dark *))` at the top of that file means every `dark:` utility keys off an ancestor carrying the `.dark` class.
- Nothing currently applies `.dark`, so the dark palette is unreachable.
- No theme state exists in the app. Zustand (`src/ui/store.ts`, `persist` middleware, key `movie-monday-state`) holds session state; TanStack Query holds server state.
- `index.html` has no root class and no `theme-color` meta. React mounts from `src/ui/main.tsx`.
- The app is a small SPA with no SSR, so any theme decision made in the browser is safe (no hydration mismatch concern).

## Goals / Non-Goals

**Goals:**
- Dark is what a first-time visitor sees, with zero flash of the light theme.
- A single theme module owns reading, applying, and persisting the preference; components consume it through one small hook.
- Theme state stays out of the existing app store, keeping session state and appearance preference independent.
- Tests can drive the theme in jsdom without a real browser.

**Non-Goals:**
- Per-page or per-component theme overrides.
- Server-rendered theme or cookie-based theme propagation.
- Reworking the design tokens themselves; the existing `.dark` palette is used as-is apart from contrast fixes.

## Decisions

### 1. Apply the theme via a class on `<html>`, not `data-theme`

Keep `.dark` on `document.documentElement`, matching the existing `@custom-variant dark` and shadcn convention. Switching to `data-theme` would require rewriting the variant and every `dark:` utility in the vendored shadcn components.

### 2. Default dark, with an inline pre-paint script in `index.html`

`index.html` gets a small inline script in `<head>` that reads the persisted preference, resolves `system` via `matchMedia`, and adds/removes `.dark` on `document.documentElement` before the body paints. React later re-applies the same value on mount, so the two never disagree. Chosen over "set it in `main.tsx`" because the module graph still allows a light first frame; chosen over a `<script type="module">` because that defers until after parsing.

Fallback when the script cannot read storage (private mode, storage disabled): dark. That keeps the default-theme requirement true.

### 3. Theme preference lives in `localStorage` under its own key, not the Zustand store

`localStorage` is readable by the inline `index.html` script, which cannot import the Zustand store or its persist wrapper. A dedicated key (e.g. `movie-monday-theme`) keeps the pre-paint read trivial and lets the theme module be the only writer. Alternative considered: extend the existing `movie-monday-state` persisted store — rejected because the pre-paint script would then have to parse and understand Zustand's persisted JSON envelope, coupling `index.html` to store internals.

### 4. Theme module + hook, external store shape

`src/ui/lib/theme.ts` holds the three-state model (`"dark" | "light" | "system"`), reads/writes the key, resolves system preference, and applies class + `color-scheme` + `theme-color`. `src/ui/hooks/useTheme.ts` exposes the current resolved + selected theme and a setter, subscribing to `matchMedia` changes and `storage` events so multiple tabs stay in sync. Using `useSyncExternalStore` avoids adding a new context provider to `main.tsx` and keeps the API tiny.

### 5. Toggle is a single cycling button in `PageLayout`

Every page already renders through `PageLayout`, so placing the control there gives reachability from every page without touching each page component. A shadcn `Button` with `variant="ghost"` and a lucide icon (`Moon` / `Sun`) cycles dark → light → system, with `aria-label` naming the next state. Alternative considered: a three-option `SegmentedControl` — more discoverable but visually heavy in a page header and duplicates state on every page. The cycling button is one control with one label.

### 6. `color-scheme` and `theme-color` follow the resolved theme

The theme module sets `document.documentElement.style.colorScheme` from the resolved theme and updates (creating if absent) `<meta name="theme-color">` to the resolved background. Background values are read from the CSS custom properties with `getComputedStyle` so the two palettes stay defined in exactly one place (`index.css`). In jsdom, `getComputedStyle` returns empty custom properties, so the module falls back to the known token hex values rather than throwing.

### 7. Reuse the `.dark` tokens; fix only hardcoded light-only colors

Audited hardcoded colors: `OmdbRatings` already pairs `text-amber-600 dark:text-amber-400` and `text-red-600 dark:text-red-400`, so it is correct in both themes. `MovieCard`/page components use semantic tokens. No token rewrite needed; the task list includes a final visual audit instead of speculative edits.

## Risks / Trade-offs

- **Flash of light theme if the inline script is blocked (strict CSP)** → Worker CSP, if any, must allow the inline snippet; the snippet is tiny and has a `dark` fallback so a blocked script still lands on dark, only React's re-apply is delayed.
- **Duplicated theme logic between `index.html` and `lib/theme.ts`** → Keep the inline script to a minimal read + class toggle and treat `lib/theme.ts` as authoritative afterwards; both use the same storage key, which is asserted in tests.
- **`getComputedStyle` for `theme-color` is jsdom-unfriendly** → Provide a static fallback map and test the fallback path explicitly.
- **Two tabs disagree after a change** → `storage` event listener re-syncs. Non-critical if it fails; the next load resolves correctly.
- **Cycling button hides the current state** → Icon and `aria-label` describe the current and next state; the tooltip/title mirrors it.
- **Tailwind class-based `dark:` variants only apply to descendants of `.dark`** → `.dark` must go on `<html>`, never on `<body>` only. Task verifies `documentElement`.

## Migration Plan

No data or API migration. Deploy is a normal Worker/static-asset release. Rollback is `git revert` of the change; users' `localStorage` key becomes unused but harmless. Existing users with no key land on dark automatically, which is the intended new default.

## Open Questions

None blocking.
