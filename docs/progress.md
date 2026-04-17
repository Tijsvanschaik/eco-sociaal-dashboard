# Progress log

## Fase 0 - Setup

- [x] Next.js scaffold (App Router, TS strict, Tailwind v4, shadcn base, route groups)
- [x] Biome (lint + format)
- [x] Vitest (unit/component) + Playwright (E2E) geconfigureerd
- [x] Supabase clients (`@supabase/ssr` server + browser + middleware) + Zod env
- [x] Security headers (X-Frame-Options op (app), frame-ancestors whitelist op /embed/*)
- [x] CI workflow (install, lint, typecheck, unit tests, build)
- [ ] Vercel deploy
- [ ] Supabase project aan `.env.local` koppelen (door gebruiker)

## Fase 1 - Auth + orgs (volgende)

- [ ] SQL `0001_init.sql`: orgs, memberships, RLS
- [ ] Magic-link login flow
- [ ] `/[orgSlug]` tenant-guard met membership check

## Openstaand (later)

- [ ] EOD-baseline van LEF opvragen
- [ ] PWA (manifest + icons + service worker) - pas als we het praktisch nodig hebben
- [ ] Tremor toevoegen wanneer dashboard charts krijgt

## Laatste sessie

Datum: 2026-04-17
Wat gedaan: Fase 0 scaffold. Next.js 15 + TS strict + Tailwind v4 + shadcn
base, Biome, Vitest, Playwright, `@supabase/ssr` clients, Zod env validation,
security headers, CI workflow, ADR 0002, README.
Wat volgt: Vercel deploy + Supabase project koppelen, dan Fase 1 (auth + orgs + eerste SQL).
Blockers: `.env.local` waarden moeten gezet worden voor de app lokaal start.

## SQL-runs per omgeving

| SQL-bestand | Gedraaid op dev | Gedraaid op staging | Gedraaid op productie |
| --- | --- | --- | --- |
| (nog geen) |  |  |  |
