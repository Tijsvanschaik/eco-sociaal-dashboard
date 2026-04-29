-- =============================================================================
-- 0007_public_recent_registrations.sql
-- Eco-sociaal Dashboard - public recent-registrations view for TV/embed.
--
-- Datum:          2026-04-29
-- Afhankelijkheden: 0001_init.sql, 0002_views.sql
-- Doel:           Een publieke view die per publieke organisatie de laatste
--                 registraties toont MET intervention-/team-/categorie-labels,
--                 `note` en `photo_path`. Bedoeld voor /tv en /embed.
--
--                 Tegen de standaard van 0002_views.sql (security_invoker = true)
--                 in draait deze view bewust met security_invoker = false:
--                 anon heeft op `registrations` een column-level revoke voor
--                 `note` en `photo_path` (privacy door default). Deze view is de
--                 expliciete, gecureerde uitzondering daarop, gefilterd op
--                 `o.public_share_enabled = true`. Niet-publieke orgs leveren
--                 geen rijen.
--
--                 Foto's blijven via storage-RLS afgeschermd; signed URLs voor
--                 anon worden in de Next.js-loader gegenereerd met de
--                 service-role key. De bucket wordt NIET publiek.
--
-- INSTRUCTIE:     Plak dit volledig in Supabase -> SQL Editor -> Run.
--                 Idempotent: re-run veilig.
-- =============================================================================


create or replace view public.public_recent_registrations
with (security_invoker = false) as
select
  o.id                  as org_id,
  o.public_share_slug   as share_slug,
  r.id                  as registration_id,
  r.happened_on         as happened_on,
  r.created_at          as created_at,
  r.quantity            as quantity,
  r.note                as note,
  r.photo_path          as photo_path,
  r.co2_kg_cached       as co2_kg_cached,
  i.name                as intervention_name,
  i.unit                as intervention_unit,
  t.name                as team_name,
  c.name                as category_name,
  c.color               as category_color
from public.registrations r
  join public.organizations o on o.id = r.org_id
  join public.interventions i on i.id = r.intervention_id
  join public.categories    c on c.id = i.category_id
  join public.teams         t on t.id = r.team_id
where o.public_share_enabled = true;


-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant select on public.public_recent_registrations to anon, authenticated;


-- =============================================================================
-- Einde 0007_public_recent_registrations.sql
-- =============================================================================
