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

## Fase 2 - MVP-oppervlak

- [x] Registratieflow op `/(app)/[orgSlug]/dashboard` met server-side CO2-berekening
- [x] "Mijn recente registraties" + KPI-kaarten + team/categorie-breakdown
- [x] `/(app)/[orgSlug]/beheer` voor org-instellingen, locaties, teams,
      categorieen, interventies en user-provisioning
- [x] Publieke dashboardpagina op `/p/[slug]`
- [x] TV- en embedvarianten op `/tv/[slug]` en `/embed/[slug]`
- [x] Unit tests voor impactlogica en registratieschema
- [x] Component test voor registratieformulier
- [x] Playwright smoke voor public share-surfaces

## Openstaand (later)

- [ ] EOD-baseline van LEV opvragen
- [ ] PWA (manifest + icons + service worker) - pas als we het praktisch nodig hebben
- [ ] Tremor toevoegen wanneer dashboard charts krijgt

## Laatste sessie

Datum: 2026-04-21
Wat gedaan: MVP-oppervlak gebouwd. Intern dashboard vervangt placeholder met
registratieformulier, recente registraties en KPI/breakdown-kaarten. Nieuwe
beheerpagina voor org-instellingen, locaties, teams, categorieen,
interventies en gebruikers. Publieke share-link, TV en embed renderen nu live
uit de public views. Unit/component tests toegevoegd; lint, typecheck en unit
tests groen. CI draait nu ook Playwright smoke.
Wat volgt: echte Supabase `.env.local` koppelen, `npm run test:integration`
tegen dev draaien, Vercel deploy afronden en daarna een productie-check op
share slug + embed whitelist doen.
Blockers: nog geen echte `.env.local` / Vercel-config in deze repo-sessie, dus
integratie-tests en live deploy zijn nog handmatige vervolgstappen.

## SQL-runs per omgeving

| SQL-bestand | Gedraaid op dev | Gedraaid op staging | Gedraaid op productie |
| --- | --- | --- | --- |
| `0001_init.sql` | 2026-04-17 |  |  |
| `0002_views.sql` | 2026-04-17 |  |  |
| `9000_seed.sql` | 2026-04-17 |  |  |
