# Architectuur

## Overzicht
Frontend: Next.js app (server components + client forms waar nodig).
Backend: Next.js Server Actions / Route Handlers (input-validatie + autorisatie).
Database: Supabase Postgres met RLS voor multi-tenancy (handmatige SQL-workflow via Supabase SQL Editor).
Hosting: Vercel (app) + Supabase (DB/auth/storage).

## Route groups
- `(app)` — auth-required, tenant-scoped via `/[orgSlug]`.
- `(public)` — auth-entry en read-only share-links via `/login` en `/p/[slug]`.
- `(kiosk)` — TV/embed, no-chrome, no-auth.

## Route-structuur
- `/` — dispatcher. Uitgelogd -> `/login`; ingelogd -> eerste org-dashboard of `/superadmin`.
- `/login` — inlogpagina (magic-link + tijdelijke wachtwoordfallback).
- `/(app)/[orgSlug]/dashboard` — read-only tenantoverzicht met KPI's, recente registraties en breakdowns.
- `/(app)/[orgSlug]/dashboard?period=30d|90d|all` — zelfde dashboard met server-side periodefilter voor charts en KPI's.
- `/(app)/[orgSlug]/registratie` — aparte registratieflow.
- `/(app)/[orgSlug]/instellingen` — admin-only orgbeheer (voorheen `/beheer`).
- `/superadmin` — platform-overzicht, read-only over alle tenants heen.
- `/superadmin/orgs/new` — nieuwe organisatie aanmaken + eerste admin uitnodigen.
- `/superadmin/orgs/[orgId]` — read-only tenantdetail voor support.
- `/p/[slug]`, `/tv/[slug]`, `/embed/[slug]` — publieke/share-surfaces.

## Autorisatie
- `worker` en `admin` blijven org-scoped via `public.memberships`.
- `superadmin` is platform-scoped via `public.platform_admins`.
- Superadmin krijgt alleen cross-tenant leesrechten; tenant-write blijft bij org-admins.

## Data flow
User -> Server Action -> Zod -> Supabase (RLS) -> Postgres.

## Chart-architectuur
- Intern dashboard: weekreeksen en stacked category-series worden server-side opgebouwd uit `registrations` via `lib/timeseries.ts`.
- Publieke surfaces (`/p`, `/tv`, `/embed`) lezen aggregates uit `public_dashboard_totals`, `public_team_breakdown`, `public_category_breakdown` en `public_dashboard_timeseries`.
- De UI gebruikt `recharts` met kleine gedeelde wrappers in `components/ui/chart.tsx` en `components/charts/*`.
- Hierdoor blijft anon-toegang beperkt tot aggregates en hoeft geen public surface direct uit `registrations` te lezen.

## Handmatige SQL-workflow (Supabase)
- We beheren schema/policies in genummerde SQL-bestanden onder `supabase/sql/`.
- De gebruiker draait elk bestand handmatig in Supabase -> SQL Editor -> Run.
- Na elke SQL-run worden Supabase types opnieuw gegenereerd in het dashboard en geplakt in `supabase/types/supabase.ts`.

## Nieuwe Supabase-omgeving uitrollen
1. Draai alle SQL-bestanden in `supabase/sql/` in numerieke volgorde (laag -> hoog) in de nieuwe omgeving.
2. Regenereer types in Supabase dashboard en plak ze in `supabase/types/supabase.ts`.

## Open vragen
- [ ] Deploy-URL en embed-whitelist definitief zetten voor productie.
