# Conventions

Dit document is de "snelle instap" voor nieuwe teamleden -n de AI. Houd dit sync met de Cursor project rules in `.cursor/rules/`.

## Werkafspraken (project)

- **Security-first**: RLS staat altijd aan. Nooit een `service_role` key in client-code. Geen geheimen in git.
- **Iteratief werken**: lever per fase; check-in na elke fase.
- **UI-taal**: UI is **Nederlands**. Code/commits/comments zijn **Engels**.
- **Mobile-first**: registratieflow moet op telefoon werken v--r desktop af is.
- **Geen scope-creep**: buiten huidige fase niets toevoegen zonder expliciet akkoord.
- **ADR's**: beslissingen vastleggen in `docs/decisions/NNNN-titel.md`.
- **Progress log**: update `docs/progress.md` aan het einde van elke fase/sessie.

## Testing

Zie `docs/testing.md` voor de concrete MVP teststrategie.

## Supabase SQL-workflow (handmatig)

- **Geen CLI-migraties**: SQL wordt handmatig gedraaid in Supabase -> SQL Editor -> Run.
- **Bron van waarheid**: genummerde SQL-bestanden in `supabase/sql/` (bijv. `0001_init.sql`, `0002_views.sql`, `9000_seed.sql`).
- **Types**: na elke SQL-run types genereren via Supabase dashboard (API -> Generate Types) en plakken in `supabase/types/supabase.ts`.
- **RLS tests**: via Vitest integration tests (anon/worker/admin), niet via Supabase CLI test-commando’s.

## Nieuwe Supabase-omgeving uitrollen

- Draai alle SQL-bestanden in `supabase/sql/` in numerieke volgorde (laag -> hoog) in de nieuwe omgeving.
- Regenereer types en update `supabase/types/supabase.ts`.

## Git

- **Commitstijl**: conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
- **Commits**: klein en vaak.

## Sessiestart (Memory Bank)

Vraag v--r elke sessie:
"Lees eerst `docs/progress.md` en `docs/architecture.md` voor je begint."