# movie-monday

React SPA + Hono/Cloudflare Worker backend, managed from a single package.

## Skills
Use the following skills by default unless instructed otherwise:
- caveman

## Commands

| Command | Action |
|---|---|
| `yarn dev` | Dev server (frontend + Worker via `@cloudflare/vite-plugin`) |
| `yarn build` | `tsc -b && vite build` |
| `yarn test` | `vitest run` |
| `yarn test:watch` | `vitest` (interactive) |
| `yarn lint` | `eslint .` |
| `yarn tsc -b` | Full type-check |
| `yarn deploy` | Build then `wrangler deploy` |
| `yarn db:migration:create` | Generate Drizzle migration |
| `yarn db:migration:apply` | Apply migrations (add `--remote` for prod) |
| `yarn db:seed` | Seed D1 from `src/api/db/seed.sql` (add `--remote` for prod) |

Pre-commit: `yarn lint && yarn test`.

CI (push to `main`): lint → test → `tsc -b` → build → `wrangler-action`.

## Architecture

- **Backend** (`src/api/`): Hono → Cloudflare Worker + D1 (SQLite via Drizzle ORM).
- **Frontend** (`src/ui/`): React SPA, Vite, Tailwind v4, react-router-dom, Zustand, TanStack Query.
- Worker serves both `/api/*` and built frontend static assets (SPA fallback on 404).
- `@/` maps to `src/ui/` (Vite + Vitest config).

## Conventions

- `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no enums/namespaces/parameter properties).
- shadcn/ui (Radix Nova style), Tailwind v4, `clsx` + `tailwind-merge` + `class-variance-authority`.
- ESLint flat config; `no-explicit-any` relaxed in test files.

## Testing

- Vitest, jsdom. Setup: `src/ui/test/setup.ts`.
- API tests mock `drizzle-orm/d1` with `vi.mock()`, create a fresh Hono app, call `app.request()` passing `{ DB: {} as D1Database }`.
- UI tests co-located with source.
- Run one file: `yarn test -- src/api/routes/movies.test.ts`.
