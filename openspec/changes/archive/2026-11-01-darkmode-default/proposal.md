# Proposal

## Why

The app already ships a full dark palette in `src/ui/index.css`, but nothing ever applies the `.dark` class, so every user sees the light theme and the dark tokens are dead CSS. Movie club sessions happen in dim rooms with the page projected on a TV, where the light theme is glaring and washes out the content. A dark theme should be the default, with an opt-in light theme for anyone who wants it.

## What Changes

- Dark is the default color theme on first visit: the document root gets the `dark` class before first paint, so there is no light flash on load.
- Add a user-facing theme toggle (dark / light / system) in the app chrome, persisted across reloads.
- Respect the persisted choice on subsequent visits; `system` follows `prefers-color-scheme`.
- Update the document `color-scheme` metadata and `<meta name="theme-color">` so native form controls, scrollbars, and mobile browser chrome match the active theme.
- Dark-palette audit: make sure components that hardcode light-only colors (e.g. OMDb rating badges) stay legible in the default dark theme.

## Capabilities

### New Capabilities

- `color-theme`: Theming behavior for the app: which theme is active by default, how the user changes it, how the choice is persisted, and how the theme is applied to the document.

### Modified Capabilities

None. No existing capability's requirements change.

## Impact

- `src/ui/index.css`: theme tokens, `color-scheme`, default-theme wiring.
- `index.html`: root element class / color-scheme metadata to avoid a flash before React mounts.
- New `src/ui/components/ThemeToggle.tsx` (or similar) plus a small theme state module, with tests.
- `src/ui/components/PageLayout.tsx` / page chrome: where the toggle appears.
- Existing UI tests: a shared setup change may be needed if tests assert on document classes (none do today).
- No API, database, or Worker changes.
