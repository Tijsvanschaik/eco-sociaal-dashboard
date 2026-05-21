# Teststrategie (MVP)

## Tooling

| Laag | Tool | Wat |
| --- | --- | --- |
| Unit | Vitest | Pure functies, Zod-schema's |
| Component | Vitest + Testing Library | Forms, kritieke UI |
| Integration (DB/RLS) | Vitest + Supabase local | Policies valideren per rol |
| E2E | Playwright | Login -> registreren -> dashboard |
| Type | `tsc --noEmit` | Elke commit |
| Lint/format | Biome | Elke commit |

## Minimum-set tests voor MVP

1. `calculateCo2(quantity, factor)` — boundary cases (0, negatief, decimaal).
2. `calculateSocialScore(quantity, factor)` — idem rounding-gedrag als CO₂-helper.
3. `eodDaysGained(savedKg, baselineKg)` — nulmeting = 0 dagen, halve baseline = 182/183 dagen.
4. `registrationSchema` — verplichte velden, min/max quantity.
5. RLS: worker van team A kan geen registratie maken voor team B.
6. RLS: anon kan `public_dashboard_totals` lezen, maar niet `registrations`.
7. Component: registratieformulier — submit disabled tot valid, toont foutmelding bij negatieve hoeveelheid.
8. E2E: login -> registreren -> verschijnt in dashboard (Top Teams update).

## TDD-flow voor elke feature

1. Schrijf een failing test.
2. Implementeer tot de test slaagt.
3. Refactor zonder de test te breken.
4. Commit.

## Praktische MVP-gates

- `npm run lint`, `npm run typecheck` en `npm test` draaien bij elke CI-run.
- `npm run test:e2e` draait smoke-tests voor de app-shell; publieke share-smokes
  draaien mee zodra `PLAYWRIGHT_SHARE_SLUG` is gezet.
- `npm run test:integration` blijft een handmatige pre-release gate zolang de
  repo nog niet aan een dedicated test-Supabase omgeving in CI hangt.

