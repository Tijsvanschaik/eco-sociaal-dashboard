# ADR 0009: Terminologie, impact-metaforen (Illustratie X) en org-content

**Datum:** 2026-06-22 (bijgewerkt 2026-06-22)  
**Status:** gepland (nog niet geïmplementeerd)

## Context

Na afronding van Fase 0–5 (MVP + UI-restyle) wil LEV:

1. Positievere, consistentere **NL-terminologie** in de UI.
2. De **totale eco-sociale impact** visueler maken — herbruikbaar voor andere tenants.
3. **Toelichting** tonen (missie/doelen) — velden in org-profiel; presentatie op surfaces **later beslissen**.
4. Charts vereenvoudigen (gestapeld eco-sociaal, geen tabs).
5. Registratie-flow **feestelijker** maken; disclaimer-tekst in org-profiel (tonen op surfaces **later beslissen**).

---

## 1. Terminologie (UI + docs; DB ongewijzigd)

| Technisch (DB/code) | NL (UI) | Voorbeeld LEV |
| --- | --- | --- |
| `categories` | **Categorie** | Energie & Besparing |
| `interventions` | **Activiteit** | Energiecoach |
| `registrations` | **Registratie** | 2 uur energiecoach op 12 juni |

### Routes (met redirects vanaf oude URLs)

| Huidig | Nieuw |
| --- | --- |
| `/[orgSlug]/registratie` | `/[orgSlug]/activiteit/nieuw` |
| `/[orgSlug]/registraties` | `/[orgSlug]/activiteiten` |
| `/[orgSlug]/registraties/[id]/bewerken` | `/[orgSlug]/activiteiten/[id]/bewerken` |

Instellingen-tab → **Activiteiten** (beheert categorieën + activiteiten in één tab).

Sidebar-nav: **Registraties** (lijst). Sidebar-CTA: **Activiteit registreren**.

**Niet hernoemen:** Postgres-tabellen (`interventions`, `registrations`, `categories`).

---

## 2. Illustratie X — impact-metaforen

### Doel

Vervangt `ImpactStoryRotator` (incl. km autorijden) door SVG-scenes met groeiende **X** (cumulatief kalenderjaar), carrousel + enter/exit-animaties.

FactTiles (kg CO₂ + sociale punten) blijven.

### LEV default (drie slides)

| ID | Driver | UI-titel | Copy (concept) |
| --- | --- | --- | --- |
| `trees` | eco (`totalCo2Kg`) | **bomen geplant** | Zoveel bomen nemen ongeveer dezelfde hoeveelheid CO₂ op in één jaar. |
| `people` | sociaal (`totalSocialScore`) | **harten bereikt** | Zoveel keer maakte jullie inzet verschil voor inwoners, buren of vrijwilligers. |
| `water` | **eco** (`totalCo2Kg`) | **glazen schoon water** | Indicatieve vertaling van jullie CO₂-besparing — geen wetenschappelijke meting. |

Km autorijden vervalt. Registratiefoto's niet meer in impact-hero.

### Volledige catalogus (6)

Elke org kiest later **exact drie**; LEV gebruikt bomen + harten + water.

| ID | Driver | Scene |
| --- | --- | --- |
| `trees` | eco | Bosje |
| `people` | sociaal | Poppetjes |
| `water` | eco | Glazen, vloeistof stijgt |
| `meals` | eco | Borden op tafel |
| `solar` | eco | Zonnepanelen |
| `park` | combo | Park-compositie |

### Conversiefactoren (indicatief + disclaimer)

| ID | Formule | Constante (start) |
| --- | --- | --- |
| `trees` | `round(co2Kg / KG_PER_TREE)` | `22` kg/ boom/jaar (`lib/impact.ts`) |
| `people` | `round(totalSocialScore)` | 1:1 “harten bereikt” |
| `water` | `round(co2Kg / KG_CO2_PER_GLASS)` | `0,5` kg CO₂ per glas *(tuning bij implementatie)* |
| `meals` | `round(co2Kg / KG_CO2_PER_MEAL)` | `2` kg CO₂ per maaltijd *(catalogus)* |
| `solar` | `round(co2Kg / KG_PER_PANEL)` | `50` *(catalogus)* |
| `park` | `fillLevel = f(co2, score)` | 0–100% *(catalogus)* |

Water en maaltijden: **beide eco-gedreven** (CO₂), niet sociale score.

### Techniek & animatie

- `lib/impact-metaphors.ts` + unit tests
- `components/impact-metaphors/` — carousel, SVG scenes, Framer Motion
- Cap zichtbare items (`MAX_VISIBLE`); echt getal altijd in HTML
- Rotatie ~8 s; `prefers-reduced-motion` → statisch grid

---

## 3. Charts — gestapeld eco-sociaal, geen tabs

- **Trend:** gestapelde area (eco + sociaal); **geen** Eco | Sociaal | Eco-sociaal tabs.
- **Donut:** gestapeld eco + sociaal; **geen** tabs.
- Team-bars ongewijzigd (breakdown).

---

## 4. Org-profiel — missie & disclaimer

### Datamodel (`0012_org_profile_content.sql`)

| Veld | Bron | Gebruik |
| --- | --- | --- |
| `description` | **bestaand** | = **missie lang** (lange toelichting / doelen) |
| `mission_short` | **nieuw** `text` | 1–2 zinnen pitch |
| `impact_disclaimer` | **nieuw** `text` | Indicatieve cijfers + breder initiatief |
| `logo_url` | bestaand | + **logo-upload bucket** (was alleen externe URL) |

Geen aparte `mission_long`-kolom — UI-label “Missie (uitgebreid)” mapped op `description`.

### Instellingen (wel bouwen)

Samenvoegen in **Organisatieprofiel** op tab Algemeen:

- Logo upload (storage bucket) + preview
- Missie kort (`mission_short`)
- Missie uitgebreid (`description`) — **rich text** (Markdown of lichte editor; keuze bij implementatie)
- Disclaimer (`impact_disclaimer`) — rich text
- Default LEV-teksten in seed waar leeg

### Surfaces (nog **niet** bouwen — knoop volgt)

**Open TODO:** waar en hoe tonen op intern dashboard, TV/embed slides en `/p` (paneel, footer, slide 0, modal, …).  
Velden en beheer in Instellingen wel meeleveren in dezelfde stream als logo.

### Disclaimer — conceptcopy (seed-default)

> De getoonde cijfers zijn indicatief en bedoeld voor zichtbaarheid en bewustwording. Ze zijn geen wetenschappelijke metingen. Dit dashboard maakt deel uit van het bredere eco-sociale initiatief van [organisatie] — het staat niet op zichzelf.

---

## 5. Activiteit toevoegen — confetti

- Na succesvolle submit: korte confetti (1–2 s); `prefers-reduced-motion` → uit
- Geen geluid; niet op TV/embed-routes

---

## 6. Implementatiestreams (geconsolideerd)

Zie `docs/progress.md` § Fase 6 — volgorde:

1. **Taal & routes** — terminologie + redirects + tab Categorieën  
2. **Delight** — confetti  
3. **Illustratie X MVP** — bomen, harten, water + carousel  
4. **Charts** — gestapeld zonder tabs  
5. **Org-profiel** — SQL + logo bucket + rich-text velden Instellingen  
6. **Catalogus uitbreiden** — meals, solar, park + org picker (later)  
7. **Surfaces missie/disclaimer** — **beslissing + bouw (open)**  
8. **Infra-backlog** — embed, mail, PWA, team-detail B, …

---

## Gevolgen

- `lib/impact-stories.ts` / `ImpactStoryRotator` → vervangen
- Dependency: waarschijnlijk `framer-motion`
- Rich-text editor: extra dependency (bijv. Tiptap) of Markdown + safe render — bij implementatie kiezen

## Gerelateerd

- ADR 0007, 0008 · `docs/design-system.md`
