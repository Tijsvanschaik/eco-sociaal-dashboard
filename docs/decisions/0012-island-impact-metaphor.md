# ADR 0012 — Isometrisch eiland als impact-metaphor

**Status:** accepted  
**Date:** 2026-06-23

## Context

De scatter-SVG hero (losse bomen/harten) werd vervangen door een isometrisch eiland
met grastegels, bomen en personen. Finetune in `/dev/impact-landscape`; productie
gebruikt bevroren defaults.

## Beslissing

1. **Eco + sociaal** roteren via `IslandMetaphorCarousel`: spawn → hold → float → despawn.
2. **Water-slide** uit carrousel (LEV default: alleen `trees` + `people`).
3. **Assets** onder `/assets/island/` (niet `/dev/`).
4. **Tuning** in `DEFAULT_ISLAND_TUNING` (`lib/impact-metaphors/island-tuning.ts`).
5. **Headline** via carrousel-overlay in productie; eiland zelf zonder dubbele titel.
6. **Timing** via `island-slide-timing.ts` (langzamer dan scatter; hold + float alleen carrousel).

## Consequenties

- Scatter-scenes (`TreeScene`, `PeopleScene`, `WaterScene`) verwijderd uit hero.
- `MealsScene` + scatter-layer blijven voor toekomstige catalogus-metaphors.
- Sandbox blijft op `/dev/impact-landscape` voor finetune; dev-assets kunnen blijven voor A/B.

## Defaults (finetune 2026-06-23)

`islandScale: 1.1`, oval shape, tile 54×34, tree/person offsets zoals in
`DEFAULT_ISLAND_TUNING`.
