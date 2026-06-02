# API Worker Design

## Summary

Add a Cloudflare Workers-based API using Hono, mounted under `/api/*`, with automatic fallback to the existing Vite SPA static assets via the Workers + Assets model.

## Architecture

```
Request
  ├─ /api/*  →  Worker (Hono) handles it
  └─ other   →  Cloudflare serves static assets (dist/), SPA fallback for unknown paths
```

No custom routing logic needed — Cloudflare's Workers + Assets model handles the split automatically.

## Worker Entry: `src/worker.ts`

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/ping', (c) => c.json({ status: 'ok' }))

export default app
```

## Config Changes

### `wrangler.jsonc`

Add `"main": "src/worker.ts"` and restructure `assets` to object format:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "movie-monday",
  "main": "src/worker.ts",
  "compatibility_date": "2026-05-12",
  "observability": { "enabled": true },
  "assets": {
    "directory": "dist",
    "not_found_handling": "single-page-application"
  },
  "compatibility_flags": ["nodejs_compat"]
}
```

### `vite.config.ts`

No changes. `@cloudflare/vite-plugin` reads wrangler.jsonc and auto-detects the worker entry.

### `tsconfig.worker.json`

New file extending `tsconfig.node.json` with `@cloudflare/workers-types`:

```jsonc
{
  "extends": "./tsconfig.node.json",
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/worker.ts"]
}
```

## Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `hono` | runtime | Lightweight router for the Worker |
| `@cloudflare/workers-types` | dev | TypeScript types for Workers runtime |

## Scripts

All existing scripts remain unchanged:
- `dev` → `vite` (plugin runs worker locally via miniflare)
- `build` → `tsc -b && vite build` (builds frontend to dist/)
- `preview` → `build && wrangler dev` (wrangler reads worker from jsonc)
- `deploy` → `build && wrangler deploy` (wrangler bundles worker + deploys assets)

## Files Created
- `src/worker.ts` — Hono worker entry
- `tsconfig.worker.json` — Worker TypeScript config

## Files Modified
- `wrangler.jsonc` — Add `main` + restructure `assets`
- `package.json` — Add `hono` and `@cloudflare/workers-types` deps
