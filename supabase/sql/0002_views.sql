-- =============================================================================
-- 0002_views.sql
-- Eco-sociaal Dashboard - public aggregate views for the share-link dashboard.
--
-- Datum:          2026-04-17
-- Afhankelijkheden: 0001_init.sql
-- Doel:           Drie aggregate views die het publieke dashboard voedt. De
--                 views draaien met security_invoker = true, dus ze gebruiken
--                 de RLS-policies van de caller. Anon ziet alleen rijen van
--                 organisaties met public_share_enabled = true, en alleen
--                 aggregate-kolommen (geen user_id / photo / note), dankzij
--                 de column-grants in 0001.
--
-- INSTRUCTIE:     Plak dit volledig in Supabase -> SQL Editor -> Run.
--                 Idempotent: re-run veilig.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. Helper: actieve gebruikers tellen zonder anon SELECT op user_id --------
-- -----------------------------------------------------------------------------
-- `public_dashboard_totals` draait met security_invoker; anon mag geen
-- SELECT op registrations.user_id hebben (privacy). Deze SECURITY DEFINER
-- functie leest user_id alleen server-side en telt distinct users voor orgs
-- met public_share_enabled = true.

create or replace function public.app_public_org_active_user_count(p_org_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct r.user_id)::bigint
  from public.registrations r
  inner join public.organizations o on o.id = r.org_id
  where r.org_id = p_org_id
    and o.public_share_enabled = true;
$$;

revoke all on function public.app_public_org_active_user_count(uuid) from public;
grant execute on function public.app_public_org_active_user_count(uuid) to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 1. Totals per organisatie ---------------------------------------------------
-- -----------------------------------------------------------------------------
-- EOD-days-gained = (co2_saved_kg / eod_baseline_kg) * 365, afgekapt op 365.
-- Nullable als eod_baseline_kg niet gezet is.

create or replace view public.public_dashboard_totals
with (security_invoker = true) as
select
  o.id                                                 as org_id,
  o.public_share_slug                                  as share_slug,
  o.name                                               as org_name,
  o.eod_baseline_kg                                    as eod_baseline_kg,
  o.eod_baseline_date                                  as eod_baseline_date,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3)     as co2_saved_kg,
  count(r.id)::bigint                                  as registration_count,
  public.app_public_org_active_user_count(o.id)        as active_user_count,
  case
    when o.eod_baseline_kg is null or o.eod_baseline_kg = 0 then null
    else least(
      round((coalesce(sum(r.co2_kg_cached), 0) / o.eod_baseline_kg) * 365, 2),
      365
    )
  end                                                  as eod_days_gained
from public.organizations o
left join public.registrations r on r.org_id = o.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, o.name, o.eod_baseline_kg, o.eod_baseline_date;


-- -----------------------------------------------------------------------------
-- 2. Breakdown per team -------------------------------------------------------
-- -----------------------------------------------------------------------------

create or replace view public.public_team_breakdown
with (security_invoker = true) as
select
  o.id                                                 as org_id,
  o.public_share_slug                                  as share_slug,
  t.id                                                 as team_id,
  t.name                                               as team_name,
  l.name                                               as location_name,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3)     as co2_saved_kg,
  count(r.id)::bigint                                  as registration_count
from public.organizations o
join public.teams t        on t.org_id = o.id and t.is_archived = false
join public.locations l    on l.id     = t.location_id
left join public.registrations r on r.team_id = t.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, t.id, t.name, l.name;


-- -----------------------------------------------------------------------------
-- 3. Breakdown per categorie --------------------------------------------------
-- -----------------------------------------------------------------------------

create or replace view public.public_category_breakdown
with (security_invoker = true) as
select
  o.id                                                 as org_id,
  o.public_share_slug                                  as share_slug,
  c.id                                                 as category_id,
  c.name                                               as category_name,
  c.color                                              as category_color,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3)     as co2_saved_kg,
  count(r.id)::bigint                                  as registration_count
from public.organizations o
join public.categories c   on c.org_id = o.id and c.is_archived = false
left join public.interventions i on i.category_id = c.id
left join public.registrations r on r.intervention_id = i.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, c.id, c.name, c.color;


-- -----------------------------------------------------------------------------
-- 4. Grants
-- -----------------------------------------------------------------------------
grant select on public.public_dashboard_totals   to anon, authenticated;
grant select on public.public_team_breakdown     to anon, authenticated;
grant select on public.public_category_breakdown to anon, authenticated;

-- =============================================================================
-- Einde 0002_views.sql
-- =============================================================================
