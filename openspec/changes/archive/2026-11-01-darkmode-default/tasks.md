# Tasks

## 1. Theme module

- [x] 1.1 Create `src/ui/lib/theme.ts` with the `Theme` type (`dark | light | system`), `DEFAULT_THEME = "dark"`, the `localStorage` key, `getStoredTheme`, `resolveTheme` (system → `matchMedia("(prefers-color-scheme: dark)")`), and `applyTheme` (toggles `.dark` on `document.documentElement`, sets `colorScheme`, updates `<meta name="theme-color">` with a static fallback map). Verify with unit tests in `src/ui/lib/theme.test.ts` covering default-when-empty, invalid stored value, system resolution, and class/attribute application.
- [x] 1.2 Add `setTheme`/`subscribeTheme` to the module so the module is an external store: persists the selection, applies it, and notifies listeners; `subscribeTheme` also listens to `matchMedia` change and window `storage` events. Verify with unit tests that selection persists under the theme key and that a `storage` event re-applies the new value.

## 2. Pre-paint default in index.html

- [x] 2.1 Add an inline `<head>` script to `index.html` that reads the theme key, resolves `system` via `matchMedia`, defaults to dark when absent/unreadable, and adds `.dark` to `document.documentElement` before paint. Verify by inspecting the built `dist/index.html` (`yarn build` then grep) that the snippet is present in `<head>` ahead of the module script.

## 3. Toggle UI

- [x] 3.1 Create `src/ui/hooks/useTheme.ts` using `useSyncExternalStore` over the theme module, returning the selected theme, resolved theme, and setter. Verify with a React test that renders the hook and asserts the returned default is dark.
- [x] 3.2 Create `src/ui/components/ThemeToggle.tsx`: a ghost `Button` with a lucide `Moon`/`Sun` icon, `aria-label` naming the next theme, cycling dark → light → system. Verify with `src/ui/components/ThemeToggle.test.tsx` that clicking cycles the label/state and that the document root gains/loses `.dark`.
- [x] 3.3 Render `ThemeToggle` from `PageLayout` so every page has it. Verify in `src/ui/components/PageLayout.test.tsx` (or extend an existing page test) that a rendered page exposes the control by its accessible name.

## 4. Dark-theme audit

- [x] 4.1 Audit remaining hardcoded colors (`grep` for `text-(white|black|slate|gray|zinc|neutral)-`, `bg-white`, `bg-black`, hex values in `src/ui`) and fix any that are unreadable in dark mode using semantic tokens or `dark:` variants. Verify `yarn lint` passes and the grep returns no unfixed light-only color that affects contrast.
- [x] 4.2 Confirm the toaster and dialog/popover surfaces use theme tokens in dark mode (sonner `Toaster` in `main.tsx`, `ui/dialog.tsx`), adjusting `theme`/surface classes if they do not. Verify by rendering the components in tests and checking applied class names.

## 5. Integration verification

- [x] 5.1 Update `src/ui/test/setup.ts` if needed so tests reset the theme key between cases, then run `yarn test` and confirm the full suite passes.
- [x] 5.2 Run `yarn lint`, `yarn tsc -b`, and `yarn build` and confirm all pass with the theme work included.
- [x] 5.3 Run `openspec validate darkmode-default --strict` and confirm the change validates.

## Workflow follow-up

- Archive the change with `openspec archive darkmode-default` once the tasks above are complete.
