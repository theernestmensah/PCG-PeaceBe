# PCG Peace Be Congregation Website

Public website for the Presbyterian Church of Ghana, Peace Be Congregation. See `CLAUDE.md` for scope, stack and rules.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values.
3. `npm run dev` and open http://localhost:3000

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Next.js production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run preview` | Build for Cloudflare and run locally in the Workers runtime |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run cf-typegen` | Generate types for Cloudflare bindings |

## Deploying to Cloudflare

Before the first deploy, create the page cache bucket:

```bash
npx wrangler r2 bucket create pcg-peace-be-opennext-cache
```

`NEXT_PUBLIC_*` variables must be present at build time. Set server secrets with `npx wrangler secret put NAME`. For `npm run preview`, put them in `.dev.vars`.
