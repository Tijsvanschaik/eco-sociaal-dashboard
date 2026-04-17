---
name: new-sql
description: Creates a new numbered SQL file for manual Supabase SQL Editor runs (idempotent schema + RLS), adds an integration test validating policies for worker/admin/anon, and prints a post-run checklist. Use when the user says @new-sql or asks for new Supabase SQL changes.
---

# Skill: New SQL

Wanneer de gebruiker zegt `@new-sql <naam>`, volg dit.

## Workflow

1. **Bepaal het volgende nummer**
   - Zoek het hoogste bestaande nummer in `supabase/sql/`.
   - Maak `supabase/sql/<NNNN>_<naam>.sql` met `<NNNN> = hoogste + 1` (4 digits).

2. **Header (verplicht)**
   Plaats bovenaan een kop-comment met:
   - doel
   - datum (YYYY-MM-DD)
   - afhankelijkheden (bijv. vereist `0001_init.sql`)
   - instructie: “Plak dit volledig in Supabase -> SQL Editor -> Run.”

3. **Schrijf SQL (schema + RLS in --n bestand)**
   - Schrijf zowel `create/alter` statements als RLS-policies in hetzelfde bestand.
   - Maak alles idempotent waar mogelijk:
     - `create table if not exists ...`
     - `drop policy if exists ...; create policy ...`
     - `insert ... on conflict do nothing` (seed)

4. **Splits in blokken**
   Gebruik comments als sectieheaders:
   - `-- 1. Tabellen`
   - `-- 2. Policies`
   - `-- 3. Indexen`
   - `-- 4. Grants`

5. **Integration test (RLS)**
   Voeg een Vitest integration test toe die de policy valideert voor:
   - worker
   - admin (als van toepassing)
   - anon

6. **Eind-checklist printen**
   Eindig je output met een checklist voor de gebruiker:
   - [ ] Run SQL in Supabase SQL Editor
   - [ ] Regenereer types (Supabase dashboard -> API -> Generate Types)
   - [ ] Plak types in `supabase/types/supabase.ts`
   - [ ] Commit

7. **Commit**
   Commit (alleen op expliciet verzoek van de gebruiker) met: `feat(db): <naam>`.

