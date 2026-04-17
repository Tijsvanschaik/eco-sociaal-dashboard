# Architectuur

## Overzicht
Frontend: Next.js app (server components + client forms waar nodig).
Backend: Next.js Server Actions / Route Handlers (input-validatie + autorisatie).
Database: Supabase Postgres met RLS voor multi-tenancy (handmatige SQL-workflow via Supabase SQL Editor).
Hosting: Vercel (app) + Supabase (DB/auth/storage).

## Route groups
- `(app)` — auth-required, tenant-scoped via `/[org]`.
- `(public)` — read-only share-links via `/p/[slug]`.
- `(kiosk)` — TV/embed, no-chrome, no-auth.

## Data flow
User -> Server Action -> Zod -> Supabase (RLS) -> Postgres.

## Handmatige SQL-workflow (Supabase)
- We beheren schema/policies in genummerde SQL-bestanden onder `supabase/sql/`.
- De gebruiker draait elk bestand handmatig in Supabase -> SQL Editor -> Run.
- Na elke SQL-run worden Supabase types opnieuw gegenereerd in het dashboard en geplakt in `supabase/types/supabase.ts`.

## Nieuwe Supabase-omgeving uitrollen
1. Draai alle SQL-bestanden in `supabase/sql/` in numerieke volgorde (laag -> hoog) in de nieuwe omgeving.
2. Regenereer types in Supabase dashboard en plak ze in `supabase/types/supabase.ts`.

## Open vragen
- [ ] ...
