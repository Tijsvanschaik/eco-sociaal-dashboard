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
2. `eodDaysGained(savedKg, baselineKg)` — nulmeting = 0 dagen, halve baseline = 182/183 dagen.
3. `registrationSchema` — verplichte velden, min/max quantity.
4. RLS: worker van team A kan geen registratie maken voor team B.
5. RLS: anon kan `public_dashboard_totals` lezen, maar niet `registrations`.
6. Component: registratieformulier — submit disabled tot valid, toont foutmelding bij negatieve hoeveelheid.
7. E2E: login -> registreren -> verschijnt in dashboard (Top Teams update).

## TDD-flow voor elke feature

1. Schrijf een failing test.
2. Implementeer tot de test slaagt.
3. Refactor zonder de test te breken.
4. Commit.

