---
Status: accepted
Datum: 2026-04-21
---

# ADR 0004: Charts en publieke tijdreeks

## Context

Na fase 3 hadden we duidelijke dashboardsurfaces, maar de presentatie was nog
voornamelijk tekstueel:

- het interne dashboard toonde KPI-kaarten en lijstjes, maar geen trend
- `/p/[slug]`, `/tv/[slug]` en `/embed/[slug]` hadden geen visuele tijdlijn
- anon kan niet rechtstreeks op `registrations` leunen voor een chart, omdat die
  surface alleen aggregate-data mag tonen

We wilden charts toevoegen zonder nieuwe productmodellen of client-side fetches.

## Beslissing

- We gebruiken `recharts` als chart-library.
- We voegen een kleine shadcn-achtige chartlaag toe in `components/ui/chart.tsx`
  voor gedeelde tooltip/container-logica.
- Het interne dashboard bouwt weekreeksen server-side op uit bestaande
  `registrations` via pure helpers in `lib/timeseries.ts`.
- Voor publieke surfaces voegen we een aparte aggregate-view toe:
  `public.public_dashboard_timeseries`.
- De interne periodekeuze gebruikt `?period=30d|90d|all` zodat filtering past
  bij App Router en Server Components.

## Waarom geen Tremor

- De app gebruikt al shadcn/ui als componentbasis; `recharts` sluit daar direct
  op aan zonder extra dashboard-DSL.
- We hebben maar een kleine set charts nodig (area, donut, bar, stacked bar).
- Een dunne eigen wrapper houdt de markup en styling voorspelbaar voor public,
  TV, embed en intern.

## Waarom een aparte publieke view

- `anon` mag geen tenantdata of gevoelige kolommen uit `registrations` zien.
- Een aggregate-view met `security_invoker = true` houdt de publieke contracten
  expliciet en klein.
- Daardoor blijven `/p`, `/tv` en `/embed` read-only en database-efficiënt.

## Gevolgen

+ Meer visuele context op alle dashboards.
+ Interne periodefilter zonder extra client-fetchlaag.
+ Publieke trendcharts blijven compatibel met RLS en anon-toegang.
- Extra SQL-bestand en type-update nodig bij uitrol.
- Integratie-tests hangen af van het handmatig draaien van `0004`.
