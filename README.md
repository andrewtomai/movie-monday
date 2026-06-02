# Misc. Movie Monday

A web app that adds 2 sources of randomness and one source of determinism to select a movie.

## How it works

- Who dis?
- roll dem bones
- Vote

## Stack

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [react-router-dom](https://reactrouter.com)
- [Hono](https://hono.dev) — backend API
- [Drizzle ORM](https://orm.drizzle.team) — database management
- [Cloudflare Workers + D1](https://workers.cloudflare.com) — hosting & database

## Dev

```bash
yarn install
yarn dev
```

## Deploy

Deployments run automatically via [GitHub Actions](.github/workflows/deploy.yml) on pushes to `main`:

1. **test** — lint, test, type-check
2. **deploy** — build and publish to Cloudflare Workers using `wrangler-action`

Manual deploy:

```bash
yarn deploy
```

## Database

The app uses a [Cloudflare D1](https://developers.cloudflare.com/d1/) SQLite database, managed with [Drizzle ORM](https://orm.drizzle.team).

- Schema: [`src/api/db/schema.ts`](src/api/db/schema.ts)
- Migrations: [`src/api/db/migrations/`](src/api/db/migrations/)

Create a migration after schema changes:

```bash
yarn db:migration:create
```

Apply pending migrations to production:

```bash
yarn db:migration:apply # add --remote to apply to prod
```

Seed the database with movies and members:

```bash
yarn db:seed # add --remote to apply to prod
```

## Backend

API routes live in [`src/api/app.ts`](src/api/app.ts) using [Hono](https://hono.dev), deployed as a Cloudflare Worker that serves the built frontend as static assets.
