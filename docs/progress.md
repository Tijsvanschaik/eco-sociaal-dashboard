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
- [x] SQL `9000_seed.sql`: LEV Groep dummy-stam (**zes klant-thema's**, alle interventies + factoren volgens ADR 0007); **destructief** voor slug `lev-groep` vóór re-seed (`0001`-`0008` ongewijzigd in deze sessie)
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
- [x] Slice D (deel 2, gedeeltelijk) - Dashboard charts + recente registraties
      UX: categorie-donut met Eco/Sociaal-tabs, trendgrafiek met
      Eco/Sociaal/Eco-sociaal-selector, impact-rotator met registratiefoto's,
      registratiekaarten (kleuren, copy, notities, foto-placeholders). *(Zie
      **Sessie 2026-05-21 (avond)**.)*
- [x] Slice D (deel 2, rest) - Activiteitenfeed op intern dashboard: filters
      (periode + team via URL-params), bewerk-icoon op kaarten (admin/eigen
      registratie), responsive layout (`md` 2-koloms grid, filters naast elkaar
      vanaf `md`). Bento-grid slide 2 blijft optioneel open.
- [x] Slice E - Registratie-pagina
- [x] Slice F - Instellingen (tabs: inline-edit tables/rijen, modals voor create,
      gedeelde `components/settings/*`, full-width layout; zie **Sessie 2026-05-21 (instellingen)**)
- [x] Slice G - Superadmin-surfaces (content): `DashboardPanel`, metric-tiles,
      org-lijst en tenantdetail visueel aligned met tenant-design system
- [x] Slice H - Publieke surfaces (`/p`, `/tv`, `/embed`): drie gedeelde
      slide-componenten, `KioskSlideshow` voor TV/embed-rotate, `KioskStack`
      voor share/embed-stack. Embed configureerbaar via `?mode=`, `?screens=`,
      `?interval=`. Recente registraties via nieuwe SQL-view
      `public_recent_registrations` + service-role signed URLs voor foto's.
      *(Zie **Sessie 2026-05-21** voor kiosk heroes, tap-navigatie en vh-fill op slides 1–2.)*

## Fase 6 — Todo (geconsolideerd)

**ADR:** [`0009`](decisions/0009-impact-metaphors-terminology-and-content.md)  
**Status:** streams 1–2, 4–5 afgerond; stream 3 + 6 **geparkeerd**; stream 7 deels; zie backlog hieronder.

### Besluiten (afgerond)

| Onderwerp | Besluit |
| --- | --- |
| Terminologie | Categorie · activiteit · registratie |
| LEV carrousel | **Bomen geplant · harten bereikt** (twee slides; water uit MVP) |
| Water & maaltijden (catalogus) | Driver = **CO₂**, niet sociale score |
| Instellingen-tab | **Activiteiten** (categorieën + activiteiten in één tab) |
| Routes | `/activiteit/nieuw`, `/activiteiten`, redirects |
| Nav | Sidebar **Registraties**; CTA **Activiteit registreren** |
| Charts | Gestapeld eco+sociaal, **geen tabs** |
| Missie lang | Hergebruik `organizations.description` |
| Missie kort + disclaimer | Nieuwe kolommen `mission_short`, `impact_disclaimer` |
| Org-profiel UI | Logo-upload + rich-text velden op Instellingen → Algemeen |
| Missie/disclaimer op slides & `/p` | **Uitgesteld** — pas na Illustratie X (stream 3) |

---

### Stream 1 — Taal & navigatie

- [x] UI-copy: categorie / activiteit / registratie (hele app + tests)
- [x] Routes: `/activiteit/nieuw`, `/activiteiten`, `/activiteiten/[id]/bewerken`
- [x] Redirects vanaf `/registratie*` (301/Next redirects)
- [x] Sidebar **Activiteit registreren**; overzicht **Registraties**
- [x] Instellingen-tab **Activiteiten**; labels create-flows (categorie vs. activiteit)

---

### Stream 2 — Activiteit-flow (delight)

- [x] Confetti na succesvol opslaan (`prefers-reduced-motion` safe, geen geluid)

---

### Stream 3 — Illustratie X (impact-metaforen) ⏸️ GEPARKEERD

**LEV live (2026-06-22):** alleen **bomen** (eco) + **harten** (sociaal). Glazen water tijdelijk uit default carrousel.

- [x] `lib/impact-metaphors.ts` + unit tests
- [x] `ImpactMetaphorCarousel` + `TreeScene`, `PeopleScene`
- [x] Stagger spawn + carrousel; SVG; cap zichtbare items
- [x] Dashboard + TV/embed + `/p` (`variant` compact | kiosk)
- [x] Afbouwen `ImpactStoryRotator` + km-slide
- [x] Recharts container-warnings opgelost (`ChartResponsiveContainer`)

**Terugkomen later (stream 3 hervatten):**

- [ ] Derde slide **glazen water** (of andere catalogus-metafoor) opnieuw inschakelen
- [ ] Iconen-getal UX verder finetunen (schaal, dichtheid, animatie)
- [ ] `WaterScene` / overige catalogus (`meals`, `solar`, `park`) + org pick-3
- [ ] `--accent-water` token · `impact_metaphors` jsonb per org

`WaterScene` en catalogus-code blijven in repo; default is `LEV_DEFAULT_METAPHOR_IDS = ["trees", "people"]`.

---

### Stream 4 — Charts vereenvoudigen

- [x] Trend: gestapelde area eco+sociaal; tabs Eco/Sociaal/Eco-sociaal **verwijderen**
- [x] Donut: gestapeld; Eco/Sociaal-tabs **verwijderen**
- [x] TV/kiosk/share: zelfde default (geen tabs)
- [x] Tests bijwerken

---

### Stream 5 — Organisatieprofiel (SQL + Instellingen + logo) ✅

Eén stream: content-velden + logo-upload.

- [x] SQL `0012_org_profile_content.sql`: `mission_short`, `impact_disclaimer` (+ bucket policies indien nodig)
- [x] Storage bucket **org-logos** (SQL + RLS; upload via Instellingen)
- [x] Instellingen → Algemeen: logo upload, missie kort, missie uitgebreid (`description`), disclaimer
- [x] Markdown: textarea + veilige weergave (`SafeMarkdown` / `react-markdown`) voor uitgebreide missie + disclaimer
- [x] Profielvelden: expliciet Opslaan/Annuleren, tekenlimiet + teller (280 / 4000 / 2000)
- [x] Mobile: logo bovenaan, velden eronder
- [x] LEV default-teksten in seed (`impact_disclaimer` + voorbeeld missie)
- [x] Zod + server actions + types (handmatig gesynchroniseerd)

**Later (optioneel):** WYSIWYG rich-text editor i.p.v. Markdown-textarea.

---

### Stream 6 — Missie & disclaimer op surfaces ⏸️ UITGESTELD

Velden bestaan (stream 5). **Presentatie op dashboard/TV/`/p` uitgesteld** tot Illustratie X (stream 3) verder is — eerst visualisatie finetunen.

- [ ] Beslissing + implementatie pas na stream 3-hervatting

---

### Stream 7 — Infra & backlog

- [x] Terminologie app-breed: **categorie · activiteit · registratie** (nav, copy, tests, ADR 0009)
- [x] Instellingen mobile layout: tab-nav 2×2 grid; activiteiten-tab kaarten tot `lg`; knoppen full-width op mobiel
- [x] `docs/lev-categorien-en-interventies.md` → terminologie categorie / activiteit / registratie
- [x] SQL **`0012`** gedraaid op staging (2026-06-22)
- [ ] Embed-whitelist domeinen (wacht op LEV)
- [ ] User-invite E2E (mailprovider: Resend — zie ADR [`0011`](decisions/0011-transactional-email-resend.md))
- [x] Transactionele mail via Resend (login + admin/member invites, rate limit, NL-templates)
- [x] PWA (manifest + service worker) — zie ADR [`0010`](decisions/0010-pwa-scope.md)
- [ ] PWA handmatig end-to-end testen (install op iOS + Android, offline fallback, update-toast op staging)

---

### Omgevingen & SQL

- Dev + staging actief; **productie nog niet**
- SQL `0001`–`0011` + seed op staging (2026-05-26); **`0012_org_profile_content.sql` op staging** (2026-06-22)
- EOD-baseline: geen LEV-blocker; org-instelling blijft

---

### Aanbevolen bouwvolgorde

```
1 → 2 → 3 → 4     (parallel mogelijk: 1+2, daarna 3+4)
5                   (org-profiel; kan deels parallel aan 3)
6                   (na beslissing)
7                   (wanneer LEV/infra ready)
```

## Sessie 2026-06-22 — Fase 6 implementatie (streams 1–4 + deels 5)

- **Stream 1:** routes `/activiteit/nieuw`, `/activiteiten`, `/activiteiten/[id]/bewerken`; redirects vanaf `/registratie*`; UI-copy thema/categorie/activiteit; sidebar + Instellingen-tab **Categorieën**.
- **Stream 2:** confetti na succesvol opslaan (`lib/celebration/confetti.ts`, `prefers-reduced-motion` safe).
- **Stream 3:** `ImpactMetaphorCarousel` (bomen · harten · glazen water); `ImpactStoryRotator` + km-slide verwijderd; dashboard + TV/embed + `/p`.
- **Stream 4:** trend- en donut-charts gestapeld eco+sociaal, tabs verwijderd.
- **Stream 5 (deels):** SQL `0012_org_profile_content.sql`; velden missie kort / disclaimer in Instellingen → Algemeen; logo-upload via `org-logos` bucket; LEV seed-defaults. Rich text uitgesteld.
- **Stream 6:** bewust uitgesteld (presentatie missie/disclaimer op surfaces).
- **CI:** `npm test` 185/185, `npm run lint`, `npm run typecheck` groen.
- **Volgende stap:** `0012` draaien op dev/staging; logo-upload; stream 6 beslissing; catalogus-metaforen (solar/park/meals enter-exit).

## Sessie 2026-05-16 — sociale score

- **Schema / SQL**: nieuw [`supabase/sql/0008_social_score.sql`](supabase/sql/0008_social_score.sql) — `interventions.social_score_factor`, `registrations.social_score_cached`, anon-`grant` uitbreiding, `public_dashboard_*` + `public_dashboard_timeseries` + `public_recent_registrations` herddefiniëren. Standaard interventiefactoren in `9000_seed.sql` worden sinds mei 2026 door ADR 0007 voor LEV gevuld (eerdere korte placeholders uit Fase 1 zijn vervangen).
- **App**: Zod + instellingen-formulier voor factor; registratie-actie berekent cached score; [`lib/dashboard.ts`](lib/dashboard.ts) + [`lib/timeseries.ts`](lib/timeseries.ts) aggregeren parallel aan CO₂; TV/share/intern dezelfde kaarten en grafieken (trend: tweede Y-as wanneer score > 0; donut: CO₂ + sociale score gestapeld).
- **Volgende stap**: draai **`0008`** op elke Supabase-omgeving; `npm run test:integration` opnieuw; eventueel types opnieuw exporteren uit dashboard en met handmatige patch vergelijken.

## Sessie 2026-05-21 (middag) — eco/sociale eenheden split

**Doel:** eco en sociaal onafhankelijk tellen — aparte eenheidslabels op interventie, aparte hoeveelheden op registratie.

- **SQL** [`supabase/sql/0009_eco_social_units.sql`](../supabase/sql/0009_eco_social_units.sql):
  - `interventions`: `eco_unit` + `social_unit` (vrije tekst, max. 40 tekens); kolom `unit` (enum) verwijderd.
  - `registrations`: `social_quantity` naast `quantity` (eco); bestaande rijen: `social_quantity = 0`, `social_score_cached = 0` (bewuste eenmalige breuk).
  - View `public_recent_registrations`: `intervention_eco_unit`, `intervention_social_unit`, `social_quantity` (drop + recreate i.p.v. `CREATE OR REPLACE` vanwege kolomvolgorde).
  - Migratie-volgorde gefixt: view vóór `DROP unit`; `DROP VIEW` vóór nieuwe view-definitie.
- **ADR** [`docs/decisions/0008-eco-social-units-split.md`](decisions/0008-eco-social-units-split.md).
- **App**: registratieformulier (eco + sociale hoeveelheid); instellingen (vrije eco-/sociale eenheid + factoren); `lib/impact.ts`, Zod, server actions, publieke kaarten, demo-scripts (`insert-random-org-registrations`, `seed-demo-registrations`, `seed-fake-data`).
- **Types**: `supabase/types/supabase.ts` handmatig gesynchroniseerd na `0009` (dashboard-regenerate niet nodig voor dev).
- **Seed / dev-data**:
  - [`9000_seed.sql`](../supabase/sql/9000_seed.sql) gebruikt `eco_unit` / `social_unit` (beide uit dezelfde seed-label tot admins ze splitsen).
  - `npx tsx scripts/seed-fake-data.ts` → 180 registraties op `lev-groep` (10 teams, 33 interventies, dev-users `*@levdev.test`).
- **Docs**: [`docs/database.md`](database.md) (schema + ERD), [`docs/medewerkers-registratie-eenheid.md`](medewerkers-registratie-eenheid.md) (twee hoeveelheden), [`docs/architecture.md`](architecture.md) (impactmodel).
- **Tests**: unit-suite groen (`npm test`, `npm run typecheck`).
- [x] **`0009`** gedraaid op dev (2026-05-21).

**Wat volgt:** visualisatie/copy aanpassen aan het nieuwe model (aparte briefing); `0009` op staging/prod; per interventie eco/sociale eenheid finetunen in Instellingen (bijv. `uur` vs. `personen`).

## Sessie 2026-05-21 — LEV-interventiemodel, demo-data, superadmin-reset

**Context:** input van LEV (zes thema's + activiteitennamen); dev-omgeving op dummy na opnieuw gevuld.

- **ADR + documentatie**: [`docs/decisions/0007-lev-intervention-impact-factors.md`](decisions/0007-lev-intervention-impact-factors.md) — methodiek voor CO₂- en sociale-scorefactoren per interventie-eenheid. [`docs/medewerkers-registratie-eenheid.md`](medewerkers-registratie-eenheid.md) — one-pager voor medewerkers (`uur`, `km`, `stuk`, `kg`).
- **`9000_seed.sql`**: LEV-thema's als categorieën, alle interventies uit de klantenlijst + factoren uit ADR 0007. **Destructieve tenant-reset voor slug `lev-groep`** vóór opnieuw vullen (registrations, memberships, team_memberships, interventions, categories, teams); org-rij en overige tenants ongemoeid. Zie koptekst scripts + [`docs/database.md`](database.md).
- **CLI-demo-registraties**: [`scripts/insert-random-org-registrations.ts`](../scripts/insert-random-org-registrations.ts) als gedeelde module; [`scripts/seed-demo-registrations.ts`](../scripts/seed-demo-registrations.ts) (`DEMO_ORG_SLUG`, `DEMO_COUNT`, `DEMO_WORKERS_ONLY`). `seed-fake-data.ts` refactor (strict `workersOnly` + géén impliciete teamkeuze). **Dummy-notities** zijn langere dagverslagen (pool met `null` voor variatie).
- **Superadmin**: `app/superadmin/orgs/[orgId]/actions.ts` (`superadminClearOrgRegistrations`, alleen platform-admin, **service-role** delete). UI: [`components/superadmin-reset-registrations-panel.tsx`](../components/superadmin-reset-registrations-panel.tsx) op tenantdetail (**Gevarenzone**, twee stappen).
- **Tests**: unit-suite (Vitest) op moment van werk groen gelaten bij wijzigingen.

**Later / vrijwillig:**
- Team **team_memberships** in Beheer vullen om demo-seeder zonder fallback (willekeurig lid×team) te kunnen draaien.
- Orphan foto's in bucket `registrations` na bulk delete desgewenst opruimen.
- FACTOR-herschaling LEV na harde databronnen (Milieu Centraal / gemeente).

Intern dashboard (`internal-dashboard.tsx`) en publieke stack blijven slide 2 in **twee kolommen**.


## Sessie 2026-05-21 (avond) — dashboard UX-polish (impact, charts, registraties)

**Doel:** intern dashboard visueel en qua copy consistenter maken rond eco vs.
sociaal (`kg CO₂` / `punten`), en registratiekaarten + impact-hero aantrekkelijker.

### Impact-overzicht (`impact-overview-card.tsx`, `impact-story-rotator.tsx`, `lib/impact-stories.ts`)

- Rotator uitgeknipt naar **`ImpactStoryRotator`**; verhalen via **`buildImpactStories`** (bomen, mensen bereikt, km vermeden).
- Copy/fact-tiles: duidelijkere eco/sociale omschrijvingen; teamlegenda **`Sociaal · punten`**; per-team samenvatting onder balken verwijderd.
- **Registratiefoto's** i.p.v. iconen in de rotator: **`attachStoryImages`** kiest uit recente registraties (eco-slides → hoogste CO₂, hearts → hoogste sociale score; fallback picsum-placeholder).
- Layout-fix foto-thumb: **`absolute inset-0`** + **`max-h-[9.5rem]`** zodat grote picsum-afbeeldingen de hero niet meer opblazen.

### Charts (`category-donut-chart.tsx`, `trend-area-chart.tsx`, `progress-slide.tsx`)

- Categorie-donut: **Eco | Sociaal tabs** (één donut tegelijk), gesorteerde legende, center-label met eenheid eronder; responsive legende onder chart op smalle breedtes.
- Trendgrafiek: **Eco | Sociaal | Eco-sociaal** (default beide lijnen); Y-as headroom; **`fillContainer`** zodat grafiek meegroeit met categoriekaart op dashboard/TV.
- Subtitles aligned: cumulatieve kg CO₂ en sociale punten.

### Recente registraties (`registration-card.tsx`, `registration-placeholder.tsx`, `registration-featured-hero.tsx`)

- Eco/sociaal-kleuren gecorrigeerd (eco = groen/`tertiary`, sociaal = paars/`primary`); **`score` → `punten`**; sociaal-icoon **`favorite`** (consistent met rest van dashboard).
- Impact-badges compacter (`w-fit`); notitieveld: geen clamp/quotes/cursief, meer padding; eenheden sentence case via **`formatRegistrationUnit`**.
- Geen foto: **picsum-placeholder** per registratie-id i.p.v. abstracte SVG-vormen (`registrationPlaceholderPhotoUrl` + unit test).

### Tests & status

- Unit-suite: **111 tests groen** (`npm test`), incl. nieuwe **`impact-stories`**, **`registration-placeholder`**, **`category-donut-chart`** tests.
**Gecommit** in `feat: inline-edit Instellingen tabs and polish dashboard UX` (2026-05-21).

**Wat volgt (volgende sessie):**

- Visueel nalopen impact-rotator thumb op verschillende breakpoints (grootte vs. tekstblok).
- Optioneel: vaste lokale placeholder i.p.v. externe picsum (offline/CSP).
- Slice D rest: bento-layout + **`registrations-filters`** (team/categorie/periode).

## Sessie 2026-05-21 (instellingen) — tabs harmoniseren met inline-edit

**Doel:** Instellingen consistent maken met click-to-edit (zoals Interventies), zonder statuskolom en zonder bulk submit-knoppen.

### Gedeelde infrastructuur (`components/settings/`)

- **`settings-styles.ts`**: gedeelde CSS-class constants.
- **`editable-cells.tsx`**: `EditableTextCell`, `EditableTextareaCell`, `EditableSelectCell`, `EditableNumberCell`.
- **`form-fields.tsx`**: `Field`, `FormSection`, `FormError`, `EmptyState`.
- **`settings-ui.tsx`**: `SettingsSection`, `ConfirmArchiveModal`, `MemberCountBadge`, `getErrorMessage`.
- **`components/ui/modal.tsx`**: gedeelde modal (sticky footer, backdrop blur).

### Per tab

| Tab | Component | Patroon |
| --- | --- | --- |
| Interventies | `interventions-tab.tsx` | Tabel + inline edit + modals create/delete |
| Teams | `teams-tab.tsx` | Tabel + inline naam + modal create + archive |
| Medewerkers | `members-tab.tsx` | Tabel + inline rol/team + modal provision + hard delete |
| Algemeen | `general-tab.tsx` | Instellingen-rijen + inline save on blur + share-toggle |

### Backend (`beheer/actions.ts`, `lib/admin-schema.ts`)

- Teams: `updateTeam`, `archiveTeam` + `teamUpdateSchema`.
- Medewerkers: `updateMembership`, `updateMemberTeam`, `removeMember` + guards (laatste admin).
- Bestaande `updateOrgProfile` / `updateOrgSettings` hergebruikt vanuit client (FormData per veld).

### Settings shell (`settings-page.tsx`)

- Full-width layout; tab-nav zonder per-tab beschrijving.
- Monolithische inline tabs/helpers verwijderd (~900 regels minder).

### Tests

- `interventions-tab`, `teams-tab`, `members-tab`, `general-tab` unit tests — **11 tests groen** op settings-tabs.

**Wat volgt:** user-invite E2E; logo-upload-bucket; mobile layout Instellingen nalopen.

## Laatste sessie

Datum: 2026-06-23  
Wat gedaan: **Resend mailflow** (stream 7) — `admin.generateLink` + Resend API voor login, superadmin org-invite en member-provision; `NEXT_PUBLIC_APP_URL` voor callbacks; rate limit op login; NL-templates; ADR [`0011`](decisions/0011-transactional-email-resend.md).  
Wat volgt: handmatig testen op productie (login + invite); user-invite E2E; embed-whitelist (wacht LEV).  
Dev-login: `anouk.admin@levdev.test` / `LevDev2026!` (wachtwoord-fallback blijft beschikbaar)

## Sessie 2026-06-22 — Fase 6 planning

**Doel:** productwensen structureren vóór bouw; geen code in deze sessie.

### Besluiten

| Onderwerp | Besluit |
| --- | --- |
| Terminologie | Thema · categorie · activiteit |
| LEV carrousel | Bomen geplant · harten bereikt · glazen water (CO₂) |
| Instellingen-tab | Categorieën |
| Missie lang | `organizations.description` |
| Missie kort + disclaimer | Nieuwe kolommen; rich text in Instellingen |
| Charts | Gestapeld, geen tabs |
| Surfaces missie/disclaimer | Open (stream 6) |

### Documentatie

- ADR 0009: terminologie, metafoor-catalogus, animatie, disclaimer, implementatievolgorde
- `progress.md`: Fase 6A–6E checklist (dit bestand)

## Sessie 2026-05-26 (middag) — dashboard feed polish

**Doel:** feed UX finetunen na eerste implementatie Slice D rest.

- Categorie-filter uit activiteitenfeed gehaald (periode + team blijft).
- Bewerk-actie: klein zwevend potlood rechtsonder op kaart (`aria-label="Registratie bewerken"`).
- Kaartgrid: `md:grid-cols-2` i.p.v. `sm` (1 kolom langer op small tablets).
- Filterrij: gestapeld op mobiel; Periode + Team naast elkaar vanaf `md` (label boven control blijft).

## Sessie 2026-05-26 — dashboard feed filters + superadmin polish

**Doel:** Slice D rest (activiteitenfeed) en Slice G (superadmin content) afwerken.

- **Filters** [`lib/registrations/dashboard-filters.ts`](../lib/registrations/dashboard-filters.ts), [`components/dashboard/registrations-filters.tsx`](../components/dashboard/registrations-filters.tsx): periode (30d/90d/dit jaar) en team. Dashboard route leest `?period=&team=`.
- **Feed-sectie** [`components/dashboard/internal-recent-registrations-section.tsx`](../components/dashboard/internal-recent-registrations-section.tsx): vervangt naakte `RecentRegistrationsSlide` op intern dashboard; link naar `/registraties`.
- **Bewerken** [`components/dashboard/registration-card.tsx`](../components/dashboard/registration-card.tsx): optionele `editHref` wanneer `canEdit` (admin of eigen registratie).
- **Data** [`lib/tenant-dashboard-data.ts`](../lib/tenant-dashboard-data.ts): recente query filtert server-side; `RecentRegistration` uitgebreid met `userId`, `teamId`, `categoryId`, `canEdit`.
- **Superadmin** [`components/superadmin/*`](../components/superadmin/), pages onder `app/superadmin/`: metric-grid, org-lijst-panel, page-header layout; danger zone via `DashboardPanel`.
- **Tests**: `dashboard-filters`, `registrations-filters`, `registration-card` edit-link.

## Sessie 2026-05-26 — info-hints + registratie-invoer fix

**Doel:** medewerkers en beheerders korte uitleg geven bij eco/sociaal metingen, zonder de UI te verzwaren.

- **Component** [`components/ui/info-hint.tsx`](../components/ui/info-hint.tsx): Radix Popover op ⓘ (tap/klik + toetsenbord; mobile-first i.p.v. hover-only). `MetricsHelpBody` ondersteunt optionele secties + footer.
- **Copy** [`lib/copy/eco-social-metrics-help.ts`](../lib/copy/eco-social-metrics-help.ts): gedeelde teksten voor interventies-tab, registratievelden (context per eco-eenheid) en modal; `QUANTITIES_PANEL_HELP` opgesplitst in **Eco** / **Sociaal** + afsluitzin eco-sociale score.
- **Registratie** [`components/registration/quantity-fields.tsx`](../components/registration/quantity-fields.tsx): hints op panel + velden; **bugfix** controlled input (`value > 0` maskeerde tussentijdse invoer zoals `0,5`).
- **Instellingen** [`components/settings/interventions-tab.tsx`](../components/settings/interventions-tab.tsx): hints op titel, tabelkoppen en create-modal.
- **Form** [`components/settings/form-fields.tsx`](../components/settings/form-fields.tsx): `Field` + `FormSection` accepteren optionele `hint` / `hintLabel`.
- **Tests**: `info-hint`, `eco-social-metrics-help`, `quantity-fields`, aanpassingen `registration-form` + `vitest.setup` (`ResizeObserver`-mock).

**Optioneel later:** hints op ingeklapte mobiele interventie-cards; copy in `medewerkers-registratie-eenheid.md` alignen met nieuwe sociale uitleg (uren óf personen).

## Sessie 2026-05-26 — registraties-overzicht + bewerken/verwijderen

**Doel:** registraties beheren via dedicated pagina; sidebar-dubbeling opgelost.

- **Routes** [`app/(app)/[orgSlug]/registraties/`](../app/(app)/[orgSlug]/registraties/): lijst + `[id]/bewerken`; create blijft op `/registratie`.
- **Data** [`lib/tenant-registrations-list-data.ts`](../lib/tenant-registrations-list-data.ts), [`lib/tenant-registration-edit-data.ts`](../lib/tenant-registration-edit-data.ts), [`lib/registrations/list-filters.ts`](../lib/registrations/list-filters.ts).
- **Actions** [`app/(app)/[orgSlug]/registraties/actions.ts`](../app/(app)/[orgSlug]/registraties/actions.ts): update + delete met impact-recalc en storage cleanup; [`cleanupStoragePhoto`](../lib/registrations/photo-upload.ts) gedeeld.
- **UI** [`components/registrations/registrations-list.tsx`](../components/registrations/registrations-list.tsx) — instellingen-styling (`SettingsSection`, tabel, `RowIconButton`, `ConfirmArchiveModal`).
- **Form** [`components/registration/registration-form.tsx`](../components/registration/registration-form.tsx): `mode="edit"` met foto replace/remove.
- **Nav** [`components/app-shell/tenant-app-shell.tsx`](../components/app-shell/tenant-app-shell.tsx): sidebar → `/registraties`.
- **Tests**: unit voor list-filters, list component, update schema.

## Sessie 2026-05-22 (avond) — mobile UX-polish

**Doel:** tenant-pagina's compacter en consistenter op mobiel, zonder desktop-layout te breken.

- **Gedeelde layout** [`components/app-shell/tenant-page-layout.ts`](../components/app-shell/tenant-page-layout.ts): `tenantPageMainClassName` (`px-4` → `sm:px-6` → `md:px-10`); toegepast op dashboard, team-detail, registratie en instellingen.
- **Dashboard** [`components/internal-dashboard.tsx`](../components/internal-dashboard.tsx): subtitle onder welkomst-header verwijderd.
- **Impact-rotator** [`components/dashboard/impact-story-rotator.tsx`](../components/dashboard/impact-story-rotator.tsx): gestapelde layout op mobiel; foto full-width (16:10); grid-stacking i.p.v. absolute positioning zodat rotatie-dots niet over tekst vallen.
- **Impact-overzicht** [`components/dashboard/impact-overview-card.tsx`](../components/dashboard/impact-overview-card.tsx): eco/sociaal-score kaarten `grid-cols-1` op mobiel; compactere linked team-bars (minder padding/gap).
- **Registratie** [`app/(app)/[orgSlug]/registratie/page.tsx`](../app/(app)/[orgSlug]/registratie/page.tsx): pagina-header (org + titel + subtekst) verwijderd — form start direct met “Kies je activiteit”.
- **Activiteitenpicker** [`components/registration/intervention-card.tsx`](../components/registration/intervention-card.tsx), [`intervention-picker.tsx`](../components/registration/intervention-picker.tsx): horizontale compacte kaarten op mobiel (icoon links, titel rechts; categorielabel verborgen; kleinere gap/padding).

**Geen backend- of testwijzigingen** — visuele/layout-only.

## Sessie 2026-05-22 — registratiepagina Slice E

**Doel:** mobile-first scroll-flow voor registratie, visueel aligned met dashboard/instellingen.

- **Filter-helper** [`lib/registration/intervention-filters.ts`](../lib/registration/intervention-filters.ts): categorie + zoekfilter, `alwaysIncludeId` voor geselecteerde activiteit.
- **Component-split** `components/registration/*`: picker, quantity-fields, details, photo, impact-preview, orchestratie in `registration-form.tsx`. Re-export via `components/registration-form.tsx`.
- **Intervention picker**: categorie-tabs, zoekveld, responsive kaartengrid (~33 interventies LEV).
- **Live impact-preview**: kg CO₂, sociale punten, bomen-equivalent; sticky sidebar desktop, inline mobiel.
- **Page layout** [`app/(app)/[orgSlug]/registratie/page.tsx`](../app/(app)/[orgSlug]/registratie/page.tsx): padding aligned met dashboard, card-styling, sticky submit mobiel, uitgebreide success-banner (dashboard-link + nog een registratie).
- **Design polish (zelfde dag):** genummerde stappen vervangen door [`DashboardPanel`](../components/dashboard/dashboard-panel.tsx)-secties; header met org-eyebrow (instellingen-patroon); categorie-filters als gekleurde icon-knoppen (interventies-tab); hoeveelheden + impact als witte inset-kaarten / FactTiles (impact-overview); floating brand-submit op mobiel (dashboard FAB); geen `max-w-7xl`-wrapper.
- **Tests**: `intervention-filters`, `impact-preview`, uitgebreide `registration-form` (filter, preview, success).

**Geen backend-wijzigingen** — server action + Zod-schema ongewijzigd.

## Sessie 2026-05-22 — team-detailpagina

**Doel:** per team activiteiten en impact tonen, bereikbaar via drill-down op het interne dashboard.

- **Data** [`lib/tenant-team-data.ts`](../lib/tenant-team-data.ts): `getTenantTeamDetailData`, `filterRegistrationsByTeamId`; hergebruikt `buildDashboardSnapshot` + timeseries-helpers op team-gefilterde registraties (kalenderjaar). Geen SQL-migratie.
- **Route** [`app/(app)/[orgSlug]/teams/[teamId]/page.tsx`](../app/(app)/[orgSlug]/teams/[teamId]/page.tsx): auth via org-context; 404 bij onbekend/gearchiveerd team.
- **UI** [`components/team/`](../components/team/): `TeamDetailDashboard`, `TeamImpactHero` (KPI's), `TeamActivityBreakdown` (eco/sociaal-tabs op interventies).
- **Drill-down** [`components/dashboard/impact-overview-card.tsx`](../components/dashboard/impact-overview-card.tsx): optionele `teamLinkBase`; alleen intern dashboard (`InternalDashboard`), niet op TV/embed.
- **Tests**: unit (`tenant-team-data`, `team-activity-breakdown`), component (team-link in impact card), E2E [`tests/e2e/team-detail.spec.ts`](../tests/e2e/team-detail.spec.ts) (env: `PLAYWRIGHT_ORG_SLUG`, `PLAYWRIGHT_LOGIN_EMAIL`, `PLAYWRIGHT_LOGIN_PASSWORD`).

**Wat volgt (fase B):** team-ledenrooster, vergelijking met org-gemiddelde, registratiefilters op dashboard.

## Sessie 2026-05-21 (instellingen)

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
- `0005_registration_photos_storage.sql` en `0006_org_profile.sql` staan op
  dev (2026-04-21). Nog uitrollen naar staging + prod en daarna Supabase
  types regenereren tegen het live schema.
- `photo_path` blijft voorlopig alleen een string in de DB; er is nog geen
  UI om een bestaande registratie-foto te bekijken of te vervangen.
- Foto-cleanup bij mislukte inserts is best-effort; echte cleanup (vb. cron
  die weesobjecten verwijdert) is nog niet ingericht.

Wat volgt:
- `npm run test:integration` opnieuw groen krijgen tegen dev (0005 + 0006
  staan nu live) en types regenereren via CLI.
- Slice D deel 2 (bento-grid charts + activiteitenfeed) oppakken, daarna
  Slice E (registratie-pagina redesign) en F (instellingen-redesign, deels
  al gedaan door de tabs-rework).

## Sessie 2026-04-29 (TV + embed slideshow)

Wat gedaan:
- **Slice H gestart**: nieuwe SQL-view `public_recent_registrations` (0007),
  bewust met `security_invoker = false` zodat anon `note` + `photo_path` mag
  zien op publieke surfaces, gefilterd op `o.public_share_enabled = true`.
  Toegevoegd aan `supabase/types/supabase.ts` (handmatig).
- **Loader gerefactord**: `lib/public-dashboard.ts` levert nu een
  `PublicDashboardData` met `totals`, `snapshot` (identieke shape als intern),
  `timeseries` (camelCase WeeklyTimeseriesRow) en `recentRegistrations`. Foto's
  via `createServiceRoleClient().storage.createSignedUrls` met TTL 1 uur.
- **Slide-componenten gedeeld**: `components/public/total-impact-slide.tsx`,
  `progress-slide.tsx` en `recent-registrations-slide.tsx`. Intern dashboard
  refactored om dezelfde drie slides te gebruiken (geen visuele wijziging).
- **Kiosk-shells**: `KioskSlideshow` (client, fade-rotatie, default 8s) en
  `KioskStack` (responsive verticale stack). `PublicSurface` mapt mode op
  shell met automatische `< lg`-fallback naar stack zodat mobiel scrollt.
- **Embed-querystring**: `lib/embed/query-schema.ts` (Zod). `mode=stack|rotate`,
  `screens=1,2,3`, `interval=3-60` met veilige defaults.
- **Pages**: `/tv`, `/embed`, `/p` gebruiken nu allemaal `<PublicSurface>`. De
  oude `components/public-dashboard-view.tsx` is verwijderd.
- **Tests**: 11 nieuwe unit-/component-tests (`embed-query-schema`,
  `kiosk-slideshow`, `recent-registrations-slide`); RLS-suite uitgebreid voor
  de nieuwe view; Playwright e2e gespecialiseerd op slideshow + querystring.
  Alle 85 unit-tests groen, lint + typecheck + build groen.

Openstaand / bewuste tech-debt:
- `0007_public_recent_registrations.sql` nog draaien op dev/staging/prod.
- Daarna `npm run test:integration` opnieuw groen krijgen tegen dev.
- Embed-whitelist `EMBED_FRAME_ANCESTORS` blijft open totdat LEV de
  definitieve intranet-/partnerdomeinen aanlevert.
- Geen donker thema voor TV nog (rule zegt "beschikbaar"; vereist eigen
  Stitch-mock).
- Recente registraties zijn altijd publiek zodra de share-slug aanstaat
  (zie ADR 0006); per-registratie of org-level publish-toggle is niet
  geïmplementeerd.

Wat volgt: `0007` op dev draaien, integratie-tests bevestigen, daarna LEV
laten kijken naar slideshow-look op een echt TV-scherm + embed-querystring
in het LEV-intranet uitproberen.


## Sessie 2026-05-21 (TV/kiosk — hero-registraties, navigatie, vh-fill slides)

Samenvatting om later aan te sluiten:

### Recente registraties (`/tv`, `/embed?mode=rotate`)

- **`PublicSurface`** split logische slide `3` naar **max. drie kiosk-slides** (top 3 registraties), elk **één featured hero**: 50/50 foto | tekst (`registration-featured-hero.tsx`, `recent-registration-featured-panel.tsx`).
- Geen carousel-in-carousel: hoofdslideshow bevat gewoon meer slides na slide 2.
- **`screens=` in querystring**: id `3` betekent op TV/rotate de **groep** van deze drie registratie-slides (`lib/embed/query-schema.ts`).
- **`/p` en `/embed` (stack)** houden het **kaartenraster** (`RecentRegistrationsSlide`).

### Kioskslideshow — interactie

- **`kiosk-slideshow.tsx`**: onzichtbare **tap-zones** (links/rechts ~42%), **ArrowLeft/ArrowRight**, handmatig stappen **herstelt autoplay**. Prop **`interactive`**.

### TV whitespaces / recent-hero polish

- Geen **`max-w-[1500px]`** op TV-slides; **TV-padding** schaalt mee (`xl` / `2xl`).
- Badge **Recente registraties** **linksboven op de foto**, zelfde opbouw als **`DashboardPanel`** (icoon + titel + ondertitel).
- Tekstkolom kiosk: **gecentreerd**, strakke gaps; op grote schermen **grotere typo/padding** via `clamp` en extra breakpoints.

### Slides 1 & 2 (alleen `expandRecent` = TV of embed-rotate)

- Slide 1: **`fitToContainer`** op **`ImpactOverviewCard`** + **`TotalImpactSlide`**-wrapper; **Top teams** scrollbaar bij lange lijsten (`TeamBreakdownPanel` + **`fitToContainer`**).
- Slide 2: **`ProgressSlide`** met **`isKioskFullscreen`** — alleen trendgrafiek, **geen** categorie-donuts. **`TrendAreaChartBody`** met **`fillContainer`** voor **flex-hoogte**.

### Kernbestanden

`components/public/public-surface.tsx`, `kiosk-slideshow.tsx`, `progress-slide.tsx`, `total-impact-slide.tsx`, `registration-featured-hero.tsx`, `recent-registration-featured-panel.tsx`, `recent-registrations-slide.tsx`, `impact-overview-card.tsx`, `charts/trend-area-chart.tsx`, `lib/embed/query-schema.ts`, tests o.a. `kiosk-slideshow`, E2E public share.

Intern dashboard (`internal-dashboard.tsx`) en publieke stack blijven slide 2 in **twee kolommen**.


## Originele scope vs. stand (mei 2026)

Bron: `README.md`, `.cursor/rules/00-project.mdc`, Fase 0–5 in dit bestand.

### Oorspronkelijk MVP — afgerond
| Onderdeel | Status |
| --- | --- |
| Multi-tenant registratie + CO₂/sociale score | ✅ |
| Intern dashboard | ✅ |
| TV `/tv/[slug]` | ✅ |
| Embed `/embed/[slug]` | ✅ |
| Publieke share `/p/[slug]` | ✅ |
| Magic-link auth + RLS | ✅ (+ wachtwoord-fallback) |
| Org-beheer (teams, interventies, medewerkers) | ✅ |
| Superadmin (org aanmaken, tenantdetail) | ✅ |
| Charts / tijdreeks | ✅ |
| UI-restyle Stitch (Fase 5) | ✅ |

### Fase 6 — gepland (ADR 0009)
| Onderdeel | Stream | Status |
| --- | --- | --- |
| Terminologie + routes | 1 | 📋 |
| Confetti | 2 | 📋 |
| Illustratie X (bomen/harten/water) | 3 | 📋 |
| Charts gestapeld | 4 | 📋 |
| Org-profiel + logo + rich text | 5 | 📋 |
| Missie/disclaimer op surfaces | 6 | ⚠️ knoop open |
| Infra-backlog | 7 | 📋 |

### Uitgesteld in oorspronkelijke scope — stream 7
| Onderdeel | Oorspronkelijk | Nu |
| --- | --- | --- |
| **PWA** | Fase 0 (ADR 0002) | Stream 7 |
| **Embed-whitelist** | Expliciete domeinen | Stream 7, wacht LEV |
| **Transactionele mail** | Supabase magic-link | ✅ Resend (ADR 0011) |

### Buiten oorspronkelijke MVP gebouwd (scope-creep, wel gewenst)
- Registraties-overzicht + bewerken/verwijderen (`/registraties`)
- Team-detailpagina + drill-down
- Eco/sociale eenheden split + sociale score (0008/0009/0011)
- Info-hints eco/sociaal
- Dashboard activiteitenfeed-filters + bewerk-icoon
- Superadmin visual polish (Slice G)

### EOD
- Oorspronkelijk: centrale impactvertaling (Earth Overshoot Day).
- **Besluit mei 2026:** geen LEV-input meer voor EOD-baseline; metric blijft in
  app via org-instelling/placeholder.

## Tijdelijke auth-opmerking

- [x] Tijdelijke wachtwoord-login toegevoegd op `/login` als fallback voor admins
      en testgebruikers zolang Supabase magic-link e-mails gelimiteerd zijn

## SQL-runs per omgeving

| SQL-bestand | Dev | Staging | Productie |
| --- | --- | --- | --- |
| `0001_init.sql` | 2026-04-17 | ✅ 2026-05-26 | n.v.t. |
| `0002_views.sql` | 2026-04-17 | ✅ 2026-05-26 | n.v.t. |
| `0003_platform_admins.sql` | — | ✅ 2026-05-26 | n.v.t. |
| `0004_public_dashboard_timeseries.sql` | — | ✅ 2026-05-26 | n.v.t. |
| `0005_registration_photos_storage.sql` | 2026-04-21 | ✅ 2026-05-26 | n.v.t. |
| `0006_org_profile.sql` | 2026-04-21 | ✅ 2026-05-26 | n.v.t. |
| `0007_public_recent_registrations.sql` | — | ✅ 2026-05-26 | n.v.t. |
| `0008_social_score.sql` | — | ✅ 2026-05-26 | n.v.t. |
| `0009_eco_social_units.sql` | 2026-05-21 | ✅ 2026-05-26 | n.v.t. |
| `0010_fix_intervention_social_units.sql` | 2026-05-26 | ✅ 2026-05-26 | n.v.t. |
| `0011_lev_social_metrics.sql` | 2026-05-26 | ✅ 2026-05-26 | n.v.t. |
| `9000_seed.sql` | 2026-05-21 | ✅ 2026-05-26 | n.v.t. |

**Productie** bestaat nog niet. Staging is de referentie-omgeving voor UAT/LEV.
