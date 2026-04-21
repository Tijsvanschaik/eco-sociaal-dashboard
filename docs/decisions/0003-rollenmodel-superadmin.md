---
Status: accepted
Datum: 2026-04-21
---

# ADR 0003: Platform-brede superadminrol

## Context

Fase 2 werkte goed voor een enkele tenant met alleen org-scoped rollen
(`admin` en `worker` via `memberships`). Voor onboarding van nieuwe
organisaties ontbrak nog een platformlaag:

- geen centrale plek om nieuwe orgs aan te maken
- geen rol om over organisaties heen read-only te kunnen meekijken
- geen gecontroleerde flow om de eerste org-admin uit te nodigen

We wilden dit toevoegen zonder het bestaande tenantmodel onnodig te verbreden.

## Beslissing

- We voegen **geen** `superadmin`-waarde toe aan `public.user_role`.
- In plaats daarvan introduceren we een aparte tabel
  `public.platform_admins(user_id)`.
- Autorisatie gebeurt via helper-functie `public.app_is_superadmin()`.
- Superadmins krijgen **cross-tenant SELECT** op tenanttabellen en storage,
  maar **geen** extra tenant-write rechten.
- Nieuwe organisaties worden aangemaakt vanuit een aparte `/superadmin`-surface.
- De eerste admin van een nieuwe organisatie krijgt een magic-link uitnodiging.
- De allereerste superadmin wordt eenmalig handmatig gebootstrapped via SQL.

## Waarom niet via `memberships.role = superadmin`

- `memberships` is org-scoped; `superadmin` is platform-scoped.
- Een losse tabel houdt RLS-logica expliciet: tenantrollen blijven tenantrollen.
- We vermijden impliciete write-escalatie in bestaande `app_is_admin(org_id)` checks.

## Gevolgen

+ Heldere scheiding tussen tenantbeheer en platformbeheer.
+ Superadmin kan support en onboarding doen zonder lidmaatschap per org.
+ Bestaande `admin`/`worker` flows blijven grotendeels intact.
- Extra SQL-bestand en extra RLS-testcases nodig.
- Eerste bootstrap van superadmin blijft handwerk.

## Bootstrap-procedure

Na het draaien van `supabase/sql/0003_platform_admins.sql`:

```sql
insert into public.platform_admins (user_id)
values ((select id from auth.users where email = 'jij@example.com'))
on conflict (user_id) do nothing;
```

Daarna kan die gebruiker `/superadmin` gebruiken om nieuwe organisaties aan te
maken en de eerste admin uit te nodigen.
