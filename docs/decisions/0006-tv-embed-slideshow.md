---
Status: accepted
Datum: 2026-04-29
---

# ADR 0006: TV en embed via gedeelde slideshow-shell

## Context

`/tv/[slug]` en `/embed/[slug]` waren tekstueel-rijke schermen op basis van de
publieke aggregate-views (totals, team, categorie, weektijdreeks). De UX was
één lange pagina, niet "1 scherm geen scroll" zoals `50-ui.mdc` voor TV
voorschrijft, en de layout dreef inhoudelijk weg van het interne dashboard
omdat het een aparte `<PublicDashboardView>` was.

Het LEV-team wilde:

- **TV**: drie schermen die periodiek roteren, fullscreen, geen scroll.
- **Embed**: dezelfde panelen, maar responsive en bruikbaar in een intranet-
  iframe (waar scrollen acceptabeler is).
- **Onderhoud**: één set componenten die zowel intern als publiek werkt zodat
  een design-update overal direct landt.

## Beslissing

### Drie publieke slides, gedeeld met intern

We extraheren drie slide-componenten in `components/public/` die zowel de
publieke surfaces als het interne dashboard voeden:

1. `TotalImpactSlide` — `<ImpactOverviewCard>` (Earth Overshoot Day +
   bomen-equivalent + sociale acties + top teams).
2. `ProgressSlide` — `TrendAreaChartBody` (cumulatief) + `CategoryDonutChartBody`.
3. `RecentRegistrationsSlide` — `<RegistrationCard>`-grid.

Het interne dashboard rendert deze slides eenvoudig stacked. Publieke surfaces
voegen er een shell omheen.

### Twee shells: KioskSlideshow + KioskStack

- `KioskSlideshow` (`"use client"`) rouleert client-side tussen slides met een
  fade-overgang. Default-interval 8s; configureerbaar via querystring tot 60s.
- `KioskStack` rendert dezelfde slides verticaal achter elkaar.
- TV gebruikt op `lg+` de slideshow en valt op smaller scherm via CSS-only
  classes (`hidden lg:block` / `lg:hidden`) terug op de stack — mobiel scrolt
  dus gewoon zoals verwacht.

### Embed-querystring-contract

`/embed/[slug]` accepteert drie querystring-parameters, gevalideerd via
`embedQuerySchema`:

- `mode=stack|rotate` (default `stack`).
- `screens=1,2,3` (volgorde + subset; default = alle).
- `interval=8` (seconden, 3-60; default 8).

Onbekende of buiten-bereik-waarden vallen netjes terug op defaults. Geen 4xx,
zodat één URL-foutje een intranet-pagina nooit breekt.

### Refresh-strategie

We laten Next.js de pagina elke 60s revalideren (`export const revalidate =
60`) en plakken voor TV een `<meta http-equiv="refresh" content="60">` in als
fallback voor lang-lopende kiosk-tabs. De client-rotatie roteert alleen UI,
nooit data.

### Recente registraties zijn altijd publiek (per share-slug)

We voegen een nieuwe SQL-view `public.public_recent_registrations` toe (zie
`supabase/sql/0007_public_recent_registrations.sql`). De view exposeert
`note` en `photo_path` voor anon, hoewel die kolommen op de `registrations`-
tabel zelf bewust **niet** beschikbaar zijn voor anon (column-level revoke in
`0001_init.sql`).

We doen dit gericht door de view met `security_invoker = false` te draaien en
expliciet te filteren op `o.public_share_enabled = true`. Daardoor blijft de
`registrations`-tabel zelf afgeschermd (defense-in-depth) en is de view de
enige, expliciete uitzondering.

#### Foto's

De `registrations`-bucket blijft niet-publiek. Voor anon-surfaces genereert
de loader (`lib/public-dashboard.ts`) **service-role signed URLs** met TTL
1 uur. Anon krijgt dus tijdelijke URLs; geen permanente publieke
leesrechten op de bucket.

### Privacy-trade-off

We accepteren bewust dat zodra een org `public_share_enabled = true` zet,
foto's en notities die bij registraties horen meedraaien op `/tv` en
`/embed`. Per-registratie opt-in en een org-toggle voor recente registraties
specifiek zijn nu **niet** geïmplementeerd. Een latere ADR kan dat
heroverwegen als LEV signaleert dat content-moderatie of gebruikers-
zichtbaarheid in de praktijk een probleem wordt.

## Gevolgen

+ TV vult fullscreen, rouleert tussen drie identieke slides en is non-interactief.
+ Embed werkt out-of-the-box als responsive scrollende stack, maar admins kunnen
  via querystring een rotatie- of subset-modus kiezen voor specifieke
  intranet-schermen.
+ Eén set slide-componenten voor intern + publiek; design wijzigt op één plek.
+ Mobiel werkt netjes (stack-fallback, geen kapotte slideshow).
- Extra SQL-bestand (`0007`) plus type-update bij uitrol.
- Recente registraties op publieke surfaces tonen `note` + `photo_path`
  zonder per-registratie controle.
- `KioskSlideshow` is een client-component; we accepteren de extra JS-load
  op TV/embed voor de rotation-state.

## Niet-doelen (parkeerlijst)

- Donker thema voor TV (rule zegt "beschikbaar"; vereist eigen Stitch-mock).
- Carrousel-progress-bar / pause-knop / klik-navigatie.
- PWA / offline support.
- Per-registratie publish-toggle.
