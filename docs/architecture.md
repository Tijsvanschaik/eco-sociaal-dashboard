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
- `/(app)/[orgSlug]/dashboard` — read-only tenantoverzicht; KPI's en charts gefilterd op **huidig kalenderjaar** (`happened_on`).
- `/(app)/[orgSlug]/teams/[teamId]` — team-detailpagina (drill-down vanaf dashboard); activiteiten per interventie, trend, recente registraties gefilterd op team.
- `/(app)/[orgSlug]/registraties` — overzicht van registraties (workers: eigen; admins: alle org-registraties met bewerken/verwijderen).
- `/(app)/[orgSlug]/registraties/[id]/bewerken` — bestaande registratie bewerken (hergebruikt registratieformulier).
- `/(app)/[orgSlug]/registratie` — nieuwe registratie aanmaken (sidebar-CTA).
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

## Impactmodel (eco + sociaal)

Per **interventie** (admin in Instellingen):

| Veld | Betekenis |
| --- | --- |
| `eco_unit` | Vrij tekstlabel voor eco-telling (bijv. `uur`, `km`) |
| `co2_factor_kg` | kg CO₂ per eco-eenheid |
| `social_unit` | Vrij tekstlabel voor sociale telling (bijv. `personen`) |
| `social_score_factor` | Relatieve score per sociale eenheid |

Per **registratie** (worker/admin):

| Veld | Berekening |
| --- | --- |
| `quantity` | Eco-hoeveelheid → `co2_kg_cached = quantity × co2_factor_kg` |
| `social_quantity` | Sociale hoeveelheid → `social_score_cached = social_quantity × social_score_factor` |

Aggregaten (dashboard, TV, `/p`) sommeren de **cached** kolommen. Zie ADR [`docs/decisions/0008-eco-social-units-split.md`](decisions/0008-eco-social-units-split.md).

### Sociale score als gewogen bereik

In de praktijk telt `social_quantity` vrijwel altijd **personen of deelnemers**. De `social_score_factor` per interventie weegt **hoe sociaal intensief** die contacten zijn:

- Diep / intens contact (bijv. taalbegeleiding 1-op-1) → hogere factor (bijv. **3**).
- Veel mensen, lichtere betrokkenheid → lagere factor (bijv. **0,5**).

Berekening per registratie: `social_score_cached = social_quantity × social_score_factor`.

**Dashboard-copy:** de som van `social_score_cached` presenteren we als **“harten bereikt”** — een gewogen proxy voor bereik, geen letterlijke unieke personen-telling. Vergelijk ADR [`docs/decisions/0007-lev-intervention-impact-factors.md`](decisions/0007-lev-intervention-impact-factors.md) (schaalsysteem sociale score).

### Impact-hero (rotatie)

Het interne dashboard roteert linksboven tussen drie vertalingen (jaar-filter):

1. **Bomen geplant** — `treesEquivalent(totalCo2Kg)` (~22 kg CO₂-opname per boom/jaar).
2. **Harten bereikt** — `totalSocialScore` (afgerond).
3. **Km autorijden vermeden** — `totalCo2Kg / 0,17` (indicatieve mobiliteits-proxy).

Implementatie: `lib/impact-stories.ts`, `components/dashboard/impact-story-rotator.tsx`.

## Chart-architectuur
- Intern dashboard: weekreeksen en stacked category-series worden server-side opgebouwd uit `registrations` via `lib/timeseries.ts`.
- Publieke surfaces (`/p`, `/tv`, `/embed`) lezen via `lib/public-dashboard.ts` één gedeelde data-loader die totals (`public_dashboard_totals`), aggregaat-kolommen op `registrations`, `public_recent_registrations` en optioneel `public_dashboard_timeseries` combineert tot een `DashboardSnapshot` met dezelfde shape als het interne dashboard.
- De UI gebruikt `recharts` met kleine gedeelde wrappers in `components/ui/chart.tsx` en `components/charts/*`.
- De drie hoofdsecties (`TotalImpactSlide`, `ProgressSlide`, `RecentRegistrationsSlide`) leven in `components/public/` en worden zowel intern als op publieke surfaces hergebruikt.

## Publieke surface-shells (kiosk)
- `<KioskSlideshow>` (`"use client"`) rouleert client-side tussen slides met fade-overgang. TV-default = 8s; configureerbaar via embed-querystring tot 60s.
- `<KioskStack>` rendert dezelfde slides verticaal achter elkaar voor stacked layouts (default voor `/p` en `/embed`).
- `<PublicSurface>` is de centrale renderer die mode (`tv | embed-rotate | embed-stack | share`) op shell mapt en op `< lg`-viewports altijd terugvalt op stack-modus zodat mobiel scrollbaar blijft.

## Embed-querystring (`/embed/[slug]`)
- `mode=stack|rotate` (default `stack`).
- `screens=1,2,3` — comma-separated subset/volgorde van slides (1 = totale impact, 2 = voortgang + categorie, 3 = recente registraties). Default = alle.
- `interval=8` — secondes tussen slides in `mode=rotate` (3-60). Default 8.
- Onbekende waarden vallen netjes terug op defaults via `embedQuerySchema` (Zod). Geen 4xx.

## Handmatige SQL-workflow (Supabase)
- We beheren schema/policies in genummerde SQL-bestanden onder `supabase/sql/`.
- De gebruiker draait elk bestand handmatig in Supabase -> SQL Editor -> Run.
- Na elke SQL-run worden Supabase types opnieuw gegenereerd in het dashboard en geplakt in `supabase/types/supabase.ts`.

## Nieuwe Supabase-omgeving uitrollen
1. Draai alle SQL-bestanden in `supabase/sql/` in numerieke volgorde (laag -> hoog) in de nieuwe omgeving.
2. Regenereer types in Supabase dashboard en plak ze in `supabase/types/supabase.ts`.

## Open vragen
- [ ] Deploy-URL en embed-whitelist definitief zetten (staging; productie volgt later).
