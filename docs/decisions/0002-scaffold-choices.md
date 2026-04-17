---
Status: accepted
Datum: 2026-04-17
---

# ADR 0002: Keuzes bij Fase 0 scaffold

## Context

Bij het opzetten van de Next.js scaffold waren er een paar concrete keuzes
die niet in ADR 0001 stonden.

## Beslissingen

- **Package manager**: `npm`. De dev werkt er al mee en Vercel ondersteunt het
  native. Geen pnpm om friction te vermijden.
- **Linter/formatter**: **Biome** i.p.v. ESLint + Prettier. E-n tool, veel
  sneller, en staat ook expliciet in `docs/testing.md`.
- **Tailwind**: v4 met `@tailwindcss/postcss`. Config via `@theme inline` in
  `app/globals.css`, geen aparte `tailwind.config.ts`.
- **URL-structuur**:
  - `(app)/[orgSlug]/...` - authenticated tenant scope
  - `(public)/p/[slug]/...` - publieke share-link
  - `(kiosk)/tv/[slug]` en `(kiosk)/embed/[slug]` - TV + intranet-embed
- **Security headers**: in `next.config.ts`. `X-Frame-Options: DENY` op alles
  behalve `/embed/*`; daar alleen `Content-Security-Policy: frame-ancestors`
  met whitelist uit env var `EMBED_FRAME_ANCESTORS`.
- **Env-validatie**: Zod in `lib/env.ts`. `publicEnv` wordt eager geparsed
  (ook in Client Components), `getServerEnv()` lazy zodat de service-role key
  nooit in client bundles terechtkomt.
- **PWA**: niet in Fase 0. Komt pas terug als we het praktisch nodig hebben.
- **Tremor**: niet in Fase 0. Toegevoegd wanneer het dashboard charts nodig
  heeft, om scope-creep te vermijden.

## Gevolgen

+ Duidelijke, kleine stack met minimale tooling-overlap.
+ `npm ci` + `biome check` + `tsc --noEmit` + `vitest run` + `next build`
  dekken de CI-gate volledig.
- Tailwind v4 is relatief jong; we accepteren beperkt risico op upstream
  changes en kunnen snel terug naar v3 als het tegenzit.
