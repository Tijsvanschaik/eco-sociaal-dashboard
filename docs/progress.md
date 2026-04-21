# Progress log

## Fase 0 - Setup

- [x] Next.js scaffold (App Router, TS strict, Tailwind v4, shadcn base, route groups)
- [x] Biome (lint + format)
- [x] Vitest (unit/component) + Playwright (E2E) geconfigureerd
- [x] Supabase clients (`@supabase/ssr` server + browser + middleware) + Zod env
- [x] Security headers (X-Frame-Options op (app), frame-ancestors whitelist op /embed/*)
- [x] CI workflow (install, lint, typecheck, unit tests, build)
- [x] Vercel deploy
- [x] Supabase project aan `.env.local` koppelen (door gebruiker)

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

- [x] Registratieflow met server-side CO2-berekening
- [x] "Mijn recente registraties" + KPI-kaarten + team/categorie-breakdown
- [x] `/(app)/[orgSlug]/beheer` voor org-instellingen, locaties, teams,
      categorieen, interventies en user-provisioning
- [x] Publieke dashboardpagina op `/p/[slug]`
- [x] TV- en embedvarianten op `/tv/[slug]` en `/embed/[slug]`
- [x] Unit tests voor impactlogica en registratieschema
- [x] Component test voor registratieformulier
- [x] Playwright smoke voor public share-surfaces

## Fase 3 - Herstructurering + superadmin

- [x] SQL `0003_platform_admins.sql`: platform_admins-tabel + `app_is_superadmin()`
      + SELECT-only cross-tenant RLS voor superadmin
- [x] `/(app)/[orgSlug]/dashboard` omgezet naar read-only overzicht
- [x] `/(app)/[orgSlug]/registratie` toegevoegd als aparte registratiepagina
- [x] `/(app)/[orgSlug]/instellingen` toegevoegd; oude `/beheer` redirect nu naar
      `/instellingen`
- [x] Dispatcher op `/` opgeschoond: uitgelogd -> `/login`, authed -> eerste org
      of `/superadmin`
- [x] `/superadmin` toegevoegd voor org-overzicht, nieuwe org aanmaken en read-only
      tenantdetail
- [x] Unit/component/integration/e2e tests toegevoegd voor schema, form, RLS en
      auth-gate

## Fase 4 - Charts en polish

- [x] SQL `0004_public_dashboard_timeseries.sql`: publieke week-tijdreeks voor
      share, TV en embed
- [x] `recharts` + gedeelde chart-primitives toegevoegd
- [x] `/(app)/[orgSlug]/dashboard` uitgebreid met periodefilter, trendchart,
      categorie-donut, teamranking en weekly stack
- [x] `/p/[slug]`, `/tv/[slug]` en `/embed/[slug]` uitgebreid met trendchart en
      rijkere breakdowns
- [x] Unit/component/integration/e2e dekking uitgebreid voor tijdreeks,
      periodefilter en publieke trend-surface

## Openstaand (later)

- [ ] EOD-baseline van LEV opvragen (blijft voorlopig placeholder-waarde)
- [ ] Embed-whitelist aanscherpen: `EMBED_FRAME_ANCESTORS` staat op Vercel
      nu open (`*`) zolang we de definitieve intranet-/partnerdomeinen niet
      kennen. Zodra bekend: terug naar expliciete whitelist conform
      `40-security.mdc`.
- [ ] PWA (manifest + icons + service worker) - pas als we het praktisch nodig hebben
- [ ] Productiebaseline van de nieuwe `0004`-view draaien en daarna types via CLI
      opnieuw genereren tegen live schema

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

## Sessie 2026-04-21 (ochtend)

Wat gedaan:
- `fix(login)`: unieke `key`-props op magic-link- en wachtwoord-`Form` zodat
  RHF-state niet blijft hangen bij modeswitch; bijhorende unit test bijgewerkt
  zodat typen in wachtwoord-mode daadwerkelijk wordt gevalideerd.
- Supabase dev-project gekoppeld aan `.env.local`; `npm run test:integration`
  tegen dev gedraaid en bevestigd groen (RLS-suite voor worker/admin/anon).
- Vercel deploy live. Env-vars voor Supabase en `EMBED_FRAME_ANCESTORS`
  staan daar ingesteld.
- Productie-check: share-slug `/p/[slug]` rendert correct op prod.

Openstaand / bewuste tech-debt:
- Embed-whitelist staat bewust open (`*`) op Vercel tot de definitieve
  intranet-/partnerdomeinen bekend zijn. Daarna: terug naar expliciete
  whitelist per `40-security.mdc`.
- EOD-baseline blijft voorlopig placeholder.

Wat volgt: wachten op LEV voor (a) EOD-baseline en (b) embed-whitelist
domeinen. Verder mogelijk starten met volgende fase zodra prioriteit
gezet is (PWA of nieuwe product-features).

## Sessie 2026-04-21 (fase 3)

Wat gedaan:
- Tenant-oppervlak opgesplitst: `/(app)/[orgSlug]/dashboard` is nu read-only,
  `/(app)/[orgSlug]/registratie` is de aparte invoerflow en
  `/(app)/[orgSlug]/instellingen` vervangt `/beheer`.
- Nieuwe platformlaag toegevoegd met `public.platform_admins`,
  `app_is_superadmin()` en read-only cross-tenant SELECT-policies voor
  superadmins.
- Nieuwe `/superadmin`-surface toegevoegd: org-overzicht, nieuwe organisatie
  aanmaken + eerste admin uitnodigen via magic-link, en read-only tenantdetail.
- Dispatchlogica op `/` en `/auth/callback` opgeschoond zodat gebruikers naar hun
  eerste org-dashboard of `/superadmin` gaan.
- Tests uitgebreid voor superadmin-RLS, het nieuwe org-schema, de superadmin-form
  en unauth toegang tot `/superadmin`.

Openstaand / bewuste tech-debt:
- `0003_platform_admins.sql` nog handmatig draaien in Supabase SQL Editor.
- Daarna Supabase types opnieuw genereren en `supabase/types/supabase.ts`
  verifiëren tegen de gegenereerde output.
- Eerste superadmin nog eenmalig bootstrappen via SQL.
- Embed-whitelist blijft voorlopig open (`*`) tot definitieve domeinen bekend zijn.
- EOD-baseline blijft voorlopig placeholder.

Wat volgt: SQL runnen, types regenereren, jezelf als eerste superadmin promoten,
`npm run test:integration` opnieuw tegen dev draaien en daarna de nieuwe
superadmin-flow op Vercel nalopen.

## Sessie 2026-04-21 (fase 4)

Wat gedaan:
- Nieuwe SQL-view `public_dashboard_timeseries` toegevoegd voor publieke
  weektrends op `/p`, `/tv` en `/embed`.
- Interne dashboardroute ondersteunt nu `?period=30d|90d|all`, met server-side
  filtering van KPI's en chart-data.
- Dashboard-UI opgefrist met trend-area chart, categorie-donut, teamranking en
  stacked bar per week.
- Publieke surfaces tonen nu naast KPI's ook een trend-overzicht en rijkere
  verdeling per team/categorie.
- Tests uitgebreid voor tijdreekshelper, period-toggle, trendchart en publieke
  RLS/e2e checks.

Openstaand / bewuste tech-debt:
- `0004_public_dashboard_timeseries.sql` nog handmatig draaien in Supabase SQL
  Editor.
- Daarna Supabase types nog een keer via CLI genereren tegen het live schema om
  de lokale handmatige type-aanvulling te verifiëren.
- Embed-whitelist blijft voorlopig open (`*`) tot definitieve domeinen bekend
  zijn.
- EOD-baseline blijft voorlopig placeholder.

Wat volgt: `0004` draaien, `npm run test:integration` opnieuw tegen dev
bevestigen en daarna Vercel/prod nalopen op de nieuwe publieke trend-surface.

## Tijdelijke auth-opmerking

- [x] Tijdelijke wachtwoord-login toegevoegd op `/login` als fallback voor admins
      en testgebruikers zolang Supabase magic-link e-mails gelimiteerd zijn

## SQL-runs per omgeving

| SQL-bestand | Gedraaid op dev | Gedraaid op staging | Gedraaid op productie |
| --- | --- | --- | --- |
| `0001_init.sql` | 2026-04-17 |  |  |
| `0002_views.sql` | 2026-04-17 |  |  |
| `0003_platform_admins.sql` |  |  |  |
| `0004_public_dashboard_timeseries.sql` |  |  |  |
| `9000_seed.sql` | 2026-04-17 |  |  |
