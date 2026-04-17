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

## Fase 1 - Database + auth

- [x] SQL `0001_init.sql`: orgs, memberships, locations, teams, categories,
      interventies, registraties + RLS-policies + storage bucket
- [x] SQL `0002_views.sql`: `public_dashboard_totals`, `public_team_breakdown`,
      `public_category_breakdown` (security_invoker, grant anon)
- [x] SQL `9000_seed.sql`: LEV Groep, 9 locaties, 4 teams Helmond,
      6 categorieen, 10 interventies (CO2-factoren nog placeholder)
- [x] Types gegenereerd en in `supabase/types/supabase.ts`
- [x] Magic-link login (`/login`) + `/auth/callback` + `/auth/signout`
- [x] `middleware.ts`: session refresh + auth-gate op tenant-routes +
      `X-Frame-Options: DENY` overal, `frame-ancestors` whitelist op `/embed/*`
- [x] `(app)/[orgSlug]/layout.tsx`: membership-check via RLS + header met
      org-switcher + uitloggen
- [x] Home dispatcher: authed users worden doorgestuurd naar hun eerste org
- [x] RLS integration tests (`npm run test:integration`; vereist `.env.local` + geüpdatete `0002_views.sql` in Supabase voor anon + `active_user_count`)

## Openstaand (later)

- [ ] EOD-baseline van LEV opvragen
- [ ] PWA (manifest + icons + service worker) - pas als we het praktisch nodig hebben
- [ ] Tremor toevoegen wanneer dashboard charts krijgt

## Laatste sessie

Datum: 2026-04-17
Wat gedaan: Fase 1. Drie SQL-bestanden (init, views, seed) gerund op dev
Supabase. Types gegenereerd. Magic-link login met RHF + Zod + Server Action.
Callback- en signout-routes. Middleware uitgebreid met tenant-auth-gate en
CSP/X-Frame-Options. Org-switcher in navbar. Shadcn form/input/label/card
toegevoegd. Encoding-sweep-script omdat Cursor's Write-tool op Windows
soms UTF-16 uitspuugt.
Wat volgt: **Fase 2 — beheer** (`/[orgSlug]/beheer`, instellingen, server actions, commits per resource). Zeg `go Fase 2` om te starten.
Blockers: geen. `0002_views.sql` (incl. `app_public_org_active_user_count`) op dev gerund; `npm run test:integration` groen (12/12).

## SQL-runs per omgeving

| SQL-bestand | Gedraaid op dev | Gedraaid op staging | Gedraaid op productie |
| --- | --- | --- | --- |
| `0001_init.sql` | 2026-04-17 |  |  |
| `0002_views.sql` | 2026-04-17 |  |  |
| `9000_seed.sql` | 2026-04-17 |  |  |
