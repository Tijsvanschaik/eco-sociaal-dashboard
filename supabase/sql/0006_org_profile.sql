-- =============================================================================
-- 0006_org_profile.sql
-- Doel: organisatieprofiel uitbreiden zodat admins in Instellingen een korte
--       beschrijving en logo-URL kunnen opslaan, zichtbaar in de sidebar en het
--       publieke dashboard.
-- Datum: 2026-04-21
-- Afhankelijkheden: vereist 0001_init.sql.
-- Instructie: Plak dit volledig in Supabase -> SQL Editor -> Run. Idempotent.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Kolommen
-- -----------------------------------------------------------------------------
alter table public.organizations
  add column if not exists description text,
  add column if not exists logo_url    text;


-- -----------------------------------------------------------------------------
-- 2. Policies
-- -----------------------------------------------------------------------------
-- Geen nieuwe policies nodig: bestaande `organizations`-RLS uit 0001/0003 dekt
-- deze kolommen al (select door members/superadmins, update door tenant-admins,
-- service-role bypasst RLS voor superadmin-writes vanuit actions.ts).
--
-- Voor de volledigheid loggen we dat we de kolommen vrijgeven voor anon-reads
-- zodat de publieke /p/{slug} pagina's ze kunnen weergeven -- dit gebeurt al
-- via `public_share_enabled`-policies op rij-niveau; kolom-grants zijn niet
-- nodig omdat de policy op tabelniveau werkt.


-- -----------------------------------------------------------------------------
-- 3. Indexen
-- -----------------------------------------------------------------------------
-- Niet nodig: description en logo_url worden niet gezocht/gejoind.
