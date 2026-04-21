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

## Fase 5 - UI/UX-restyle (Stitch-gedreven)

- [x] Slice A - Brand-foundation: magenta/cream-tokens in `app/globals.css`,
      Plus Jakarta Sans via `next/font`, Material Symbols Outlined via `<link>`,
      `next-themes` provider, `<Icon>`-wrapper, `brand` button-variant,
      `docs/design-system.md` + ADR 0005
- [x] Slice B - `/login` split-layout + hero (brand-foundation toegepast,
      magic-link vs. wachtwoord via `?mode=password`-URL-state)
- [x] Slice C - App-shell + sidebar: gedeelde `<AppSidebar>` met mobile drawer,
      `<TenantAppShell>` voor `/[orgSlug]/*` en `<PlatformAppShell>` voor
      `/superadmin/*` (rol-gebaseerde nav, CTA en footer-items inclusief
      role-gated Superadmin-link)
- [x] Slice D (deel 1) - Intern dashboard hero + **Impact Overzicht**-kaart:
      welkom-header, gradient hero met EOD-dagen + CO2-ton + bomen-equivalent +
      sociale acties, en horizontale per-team bars gestapeld op interventie
      met categoriekleur (`components/dashboard/impact-overview-card.tsx`,
      `lib/dashboard.ts#teamBreakdown`, `treesEquivalent` in `lib/impact.ts`).
      Top-5 met inline "Toon alle teams"-expand. Vervangt de oude 4 metric
      cards + "Volgende stap"-kaart bovenaan.
- [ ] Slice D (deel 2) - Bento-grid voor charts + activiteitenfeed stylen
- [ ] Slice E - Registratie-pagina
- [ ] Slice F - Instellingen
- [ ] Slice G - Superadmin-surfaces (content)
- [ ] Slice H - Publieke surfaces (`/p`, `/tv`, `/embed`)

## Openstaand (later)

- [ ] EOD-baseline van LEV opvragen (blijft voorlopig placeholder-waarde)
- [ ] Embed-whitelist aanscherpen: `EMBED_FRAME_ANCESTORS` staat op Vercel
      nu open (`*`) zolang we de definitieve intranet-/partnerdomeinen niet
      kennen. Zodra bekend: terug naar expliciete whitelist conform
      `40-security.mdc`.
- [ ] PWA (manifest + icons + service worker) - pas als we het praktisch nodig hebben
- [ ] Productiebaseline van de nieuwe `0004`-view draaien en daarna types via CLI
      opnieuw genereren tegen live schema
- [ ] **Storage bucket voor org-logo uploads**: bucket + RLS-policies in dezelfde
      pad-structuur als `registrations` (`<org_id>/<user_id>/<uuid>.<ext>`), zodat
      admins in `/instellingen` het logo direct kunnen uploaden in plaats van
      alleen een externe URL op te geven. Vergt SQL-migratie + client-upload-
      helper + update van `orgProfileSchema` + `updateOrgProfile`.
- [ ] **User-invite-flow testen**: magic-link + wachtwoord-flow voor
      `/instellingen -> Medewerkers -> Toevoegen` end-to-end valideren op dev
      (nieuwe e-mail ontvangt link, kan inloggen, ziet juiste org/rol, kan
      registreren). Nu nog niet expliciet getest sinds de settings-rework.
- [ ] **Instellingen-UI/UX verfijnen**: tabs staan er, maar per tab nog polish
      nodig (empty-states, bevestigingen na save, validatie-feedback inline,
      betere copy, mobile layout, preview van logo/beschrijving zoals op het
      publieke dashboard).
- [ ] **Registration-filters implementeren**: `components/dashboard/registrations-filters.tsx`
      bestaat nog niet (werd voorheen leeg ingecheckt, nu verwijderd). Filters
      op team / categorie / periode voor de "Recente registraties"-lijst op
      het interne dashboard.

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

## Sessie 2026-04-21 (refactor: locations merged into teams)

Wat gedaan:
- Schema vereenvoudigd: `locations` tabel verwijderd, `teams` heeft geen
  `location_id` / `is_internal` meer. Teams vervangen conceptueel de oude
  locaties. `0001_init.sql`, `0002_views.sql` en `9000_seed.sql` staan al in
  de nieuwe vorm; `0003_platform_admins.sql` had nog een
  `locations_select_member`-policy — die is verwijderd.
- `supabase/types/supabase.ts` handmatig bijgewerkt (Tables.locations weg,
  `location_id` uit `teams`, `location_name` uit `public_team_breakdown`).
- Zod `locationSchema` verwijderd, `teamSchema` versimpeld naar alleen `name`.
  `createLocation`-server-action weg, `createTeam` zonder `location_id`.
- `/beheer` + `/instellingen` hebben nu één kaart "Teams" met één
  add-formulier (geen locatie-dropdown, geen `is_internal`-toggle).
- Data-layer: `lib/dashboard.ts` rond `teamBreakdown` herbouwd (segments +
  eodDays per team), `locationBreakdown` is verdwenen. `lib/tenant-dashboard-data.ts`
  haalt geen `locations` meer op, geeft geen `locationLabel` / `locationName` meer
  mee aan UI. `lib/public-dashboard.ts` gebruikt de view zonder `location_name`.
- Dashboards + cards: `ImpactOverviewCard` toont nu bars per team, copy
  geüpdatet ("Top teams", "CO2-besparing per team"). `InternalDashboard`,
  `TeamRankingBar`, `PublicDashboardView`, `RegistrationCard` en
  `RegistrationForm` gebruiken geen locatie-velden meer.
- Superadmin-detailpagina gebruikt `teamBreakdown` zonder secundaire
  locatieregel.
- Tests: RLS-fixture maakt teams direct aan (geen `locations`-fase), de
  "superadmin kan niet schrijven"-test valideert nu een `teams`-insert.
  `dashboard-snapshot.test.ts` en `impact-overview-card.test.tsx` zijn
  rondom `teamBreakdown` herschreven. `registration-form.test.tsx` mist
  `locationName` in de fixture.
- Docs: `database.md` reflecteert het nieuwe schema (geen `locations`).

Openstaand / bewuste tech-debt:
- **Pre-productie hard reset nodig**: draai in Supabase SQL Editor
  `drop schema public cascade; create schema public;` en plak daarna
  `0001_init.sql` -> `0002_views.sql` -> `0003_platform_admins.sql` ->
  `0004_public_dashboard_timeseries.sql` -> `9000_seed.sql` opnieuw. Na de
  reset moet er minimaal één superadmin worden gebootstrapt en moeten
  bestaande `auth.users` opnieuw via `/beheer` of het Supabase-dashboard
  aan memberships / team_memberships worden gekoppeld.
- Daarna `npm run test:integration` opnieuw tegen dev draaien.

Wat volgt: hard reset uitvoeren, integratie-tests groen krijgen, daarna
smoke test van admin-flow (team aanmaken + worker provisionen + worker
registreert + public dashboard rendert).

## Sessie 2026-04-21 (avond: foto-uploads, org-profiel, superadmin-UX)

Wat gedaan:
- **Foto-uploads bij registraties**:
  - Nieuwe SQL `0005_registration_photos_storage.sql`: idempotente herbevestiging
    van de `registrations`-bucket + RLS-policies (select/insert/update/delete)
    met superadmin-bypass via `app_is_superadmin()`. File-size-limit en
    mime-whitelist op de bucket staan uit; client-side validatie is leidend.
  - `lib/registrations/photo-upload.ts` met `validatePhotoFile`,
    `uploadRegistrationPhoto` (pad `{orgId}/{userId}/{uuid}.{ext}` zodat het
    eerste path-segment RLS-tenant-isolatie kan handhaven) en
    `deleteRegistrationPhoto`.
  - `lib/registrations/schema.ts` krijgt `photoPath` (strikt regex-gevalideerd
    op `{org-uuid}/...`) + `PHOTO_UPLOAD_ACCEPT` / `_MAX_BYTES` / `_ACCEPTED_MIMES`.
  - `components/registration-form.tsx` uitgebreid met optionele foto-upload
    (preview, client-validatie, bucket-upload voor submit, orphan-cleanup bij
    geannuleerde flow).
  - `app/(app)/[orgSlug]/registratie/actions.ts` verifieert dat `photoPath`
    met `{orgId}/` begint, schrijft `photo_path` in de insert, en laat bij
    RLS-falen een best-effort `cleanupOrphanPhoto` draaien. Debug-log bij
    insert-fouten toont nu membership/role/team-membership om RLS-issues
    snel te diagnosticeren.
- **Org-profiel in Instellingen**:
  - Nieuwe SQL `0006_org_profile.sql`: `organizations.description` +
    `organizations.logo_url` (idempotent, geen nieuwe policies nodig omdat
    bestaande `organizations`-RLS kolommen automatisch afdekt).
  - `lib/admin-schema.ts` krijgt `orgProfileSchema` (naam + optionele
    description/logoUrl).
  - `lib/organizations.ts` selecteert `description` + `logo_url` en geeft die
    mee in `OrgContext`.
  - `beheer/actions.ts` krijgt `updateOrgProfile`; `instellingen/actions.ts`
    herexporteert het.
  - `beheer/settings-page.tsx` stevig herbouwd naar tabs (Algemeen /
    Medewerkers / Teams / Interventies) met org-profielformulier op
    Algemeen. Gebruikt `lib/category-icons.ts` voor visuele iconen per
    categorie.
- **Superadmin-UX**:
  - `getOrgContextBySlug` resolvet nu ook een UUID-segment (superadmin-link
    vanuit `/superadmin/orgs/{id}` blijft werken als de user die URL in de
    tenant-context plakt) en laat superadmins zonder membership toegang tot
    elke tenant zien met `role='worker'` zodat read-only UI rendert.
  - `requireAdmin` in `beheer/actions.ts` geeft superadmins een
    service-role-client terug (`writer`) zodat zij via `/instellingen` in
    elke org kunnen schrijven ook zonder admin-membership; org-admins
    blijven via RLS schrijven als extra verdedigingslinie.
- **App-shell polish**:
  - Nieuwe bare-tenant-route `app/(app)/[orgSlug]/page.tsx` redirect naar
    `/{orgSlug}/dashboard` (voorkomt een 404 bij /lev-groep zonder suffix).
  - Tenant-layout gebruikt nu alleen nog `<TenantAppShell>` (de oude
    inline-topbar is weg).
- **Dev-productiviteit**:
  - `scripts/seed-fake-data.ts` (npx tsx) voegt 1 admin + 9 workers en ~180
    registraties toe aan LEV Groep voor dashboard-demos; idempotent op
    e-mail en hergebruikt bestaande users zodat herhaaldelijk draaien
    veilig is.
  - Brand-asset `public/brand/cftf-logo.svg` toegevoegd (hoort bij Slice A).
- **Tests uitgebreid**: `tests/unit/app-sidebar.test.tsx`,
  `tenant-app-shell.test.tsx`, `impact-overview-card.test.tsx` en
  `dashboard-snapshot.test.ts` toegevoegd; bestaande RLS/unit-tests aangepast
  aan nieuwe schemas/signatures.

Openstaand / bewuste tech-debt:
- `0005_registration_photos_storage.sql` en `0006_org_profile.sql` nog
  handmatig draaien in Supabase SQL Editor (dev -> staging -> prod), daarna
  Supabase types regenereren tegen het live schema.
- `components/dashboard/registrations-filters.tsx` staat leeg — ofwel
  implementatie afronden ofwel bestand verwijderen voor commit.
- `photo_path` blijft voorlopig alleen een string in de DB; er is nog geen
  UI om een bestaande registratie-foto te bekijken of te vervangen.
- Foto-cleanup bij mislukte inserts is best-effort; echte cleanup (vb. cron
  die weesobjecten verwijdert) is nog niet ingericht.

Wat volgt:
- SQL 0005 + 0006 op dev draaien, `npm run test:integration` opnieuw groen
  krijgen, types regenereren.
- Slice D deel 2 (bento-grid charts + activiteitenfeed) oppakken, daarna
  Slice E (registratie-pagina redesign) en F (instellingen-redesign, deels
  al gedaan door de tabs-rework).

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
| `0005_registration_photos_storage.sql` |  |  |  |
| `0006_org_profile.sql` |  |  |  |
| `9000_seed.sql` | 2026-04-17 |  |  |
