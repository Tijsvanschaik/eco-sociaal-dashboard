# eco-sociaal-dashboard

Multi-tenant webapp voor welzijnsorganisaties om eco-sociale activiteiten te registreren, de CO2-impact te berekenen en de resultaten te tonen op een intern dashboard, TV-scherm, intranet-embed en publieke share-link.

Projectbron: LEV Groep. Zie `docs/` voor architectuur, databasemodel en conventies.

## Stack

- Next.js 15 (App Router, React 19, Server Components) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui (Tremor komt later)
- Supabase (Postgres, Auth, Storage) met RLS
- Biome (lint + format), Vitest (unit/component/integration), Playwright (E2E)
- Deploy: Vercel (app) + Supabase (DB/auth/storage)

## Aan de slag

```bash
# 1. Afhankelijkheden installeren
npm install

# 2. Env kopieren en invullen (zie .env.example voor veldbeschrijvingen)
# Windows PowerShell:
Copy-Item .env.example .env.local

# macOS / Linux:
cp .env.example .env.local

# 3. Dev-server
npm run dev
```

Openen op <http://localhost:3000>.

## Scripts

| Script | Wat |
| --- | --- |
| `npm run dev` | Next.js dev-server |
| `npm run build` | Productionbuild |
| `npm run start` | Start productionbuild |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Biome (lint + format check) |
| `npm run lint:fix` | Biome auto-fix |
| `npm test` | Vitest unit + component tests |
| `npm run test:integration` | Vitest RLS-tests tegen een gekoppeld Supabase project |
| `npm run test:e2e` | Playwright E2E (start zelf de app) |

## Route-groepen

- `app/(app)/[orgSlug]/...` - auth-required intern dashboard
- `app/(app)/[orgSlug]/beheer` - admin-only beheer voor settings, teams, activiteiten en users
- `app/(public)/p/[slug]/...` - publieke share-links (read-only, views)
- `app/(kiosk)/tv/[slug]` en `app/(kiosk)/embed/[slug]` - TV en intranet-embed

## Supabase-workflow

Schema-wijzigingen staan als genummerde SQL-bestanden in `supabase/sql/` en worden handmatig gedraaid in Supabase -> SQL Editor -> Run. Na elke run regenereer je types in het Supabase-dashboard en plak je ze in `supabase/types/supabase.ts`. Zie `docs/conventions.md`.

## Documentatie

- `docs/architecture.md` - systeemoverzicht
- `docs/database.md` - schema + RLS samenvatting
- `docs/conventions.md` - werkafspraken
- `docs/testing.md` - teststrategie
- `docs/progress.md` - progress log per sessie
- `docs/decisions/` - ADR's
