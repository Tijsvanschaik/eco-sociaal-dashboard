# Database

Update dit document bij **elke migratie**.

## Schema (export)

- Voeg hier een compacte export van het schema toe (tabellen + kolommen + relaties).
- Houd het leesbaar: per tabel een blok, met PK/FK/indexes waar relevant.

## ERD (Mermaid)

Plaats hier een ERD in Mermaid zodat het in GitHub rendert.

```mermaid
erDiagram
  %% TODO: update ERD after first real migration
```

## RLS / Policies (samenvatting)

Vat per tabel samen:
- Welke rollen bestaan (bijv. `anon`, `authenticated`, “worker/admin” conceptueel).
- Welke acties mogen ze (select/insert/update/delete) en op welke rows.
- Welke belangrijke `using` / `with check` condities gelden.

## Migrations

- Alle schema changes in `supabase/migrations/`.
- Elke migration bevat **schema** + **RLS policies** samen (zelfde `.sql` file).
