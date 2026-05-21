# ADR 0008: Aparte eco- en sociale eenheden + hoeveelheden

**Datum:** 2026-05-21  
**Status:** geïmplementeerd (app + `0009_eco_social_units.sql`)

## Context

Eén `quantity` en één `unit` per interventie forceerden dezelfde telwijze voor CO₂ en sociale score. LEV wil eco (bijv. uren, km) en sociaal (bijv. personen betrokken) onafhankelijk registreren.

## Beslissing

- **Interventie (admin):** vrije tekst `eco_unit`, `social_unit` (max. 40 tekens); `co2_factor_kg` per eco-eenheid; `social_score_factor` per sociale eenheid.
- **Registratie (worker/admin):** `quantity` (eco) en `social_quantity` (sociaal), beide > 0 bij nieuwe invoer.
- **Berekening:** `co2_kg_cached = quantity × co2_factor_kg`; `social_score_cached = social_quantity × social_score_factor`.
- **Migratie:** bestaande registraties: `social_quantity = 0`, `social_score_cached = 0` (bewuste eenmalige breuk; reseed later).

### Sociale score = gewogen bereik (dashboard-copy)

`social_quantity` is in de praktijk het aantal personen/deelnemers. `social_score_factor` weegt de **sociale intensiteit** per interventie (bijv. 3× voor diep contact, 0,5× voor lichte betrokkenheid). De som `social_score_cached` tonen we in de UI als **harten bereikt** — geen unieke personen-telling, wel een consistente interne proxy. Zie [`docs/architecture.md`](../architecture.md#sociale-score-als-gewogen-bereik).

## Gevolgen

- Enum `intervention_unit` blijft in de DB maar wordt niet meer gebruikt op `interventions` (kan later worden opgeruimd).
- Publieke view `public_recent_registrations` exposeert `intervention_eco_unit` en `intervention_social_unit` i.p.v. `intervention_unit`.
- Visualisatie/copy kan per eenheid worden verfijnd in een vervolgfase.
