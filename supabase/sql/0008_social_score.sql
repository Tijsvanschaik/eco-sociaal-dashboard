-- =============================================================================
-- 0008_social_score.sql
-- Eco-sociaal Dashboard - sociale score (eenheidloos) parallel aan CO₂.
--
-- Afhankelijkheden: 0001_init.sql … 0007_* (kolommen ALTER + views herddefiniëren)
-- Idempotent: opnieuw draien is veilig (IF NOT EXISTS + CREATE OR REPLACE).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Kolommen
-- -----------------------------------------------------------------------------
alter table public.interventions
  add column if not exists social_score_factor numeric(14, 6)
    not null default 0
    constraint interventions_social_score_factor_non_negative
      check (social_score_factor >= 0);

alter table public.registrations
  add column if not exists social_score_cached numeric(14, 3)
    not null default 0
    constraint registrations_social_score_cached_non_negative
      check (social_score_cached >= 0);


-- -----------------------------------------------------------------------------
-- 2. Anon kolom-grant (nieuwe kolom ook publiek waar share aan staat; zelfde
--    beleid als co2_kg_cached via RLS)
-- -----------------------------------------------------------------------------
revoke all on public.registrations from anon;
grant select (
  id,
  org_id,
  team_id,
  intervention_id,
  quantity,
  happened_on,
  co2_kg_cached,
  social_score_cached,
  created_at
)
  on public.registrations to anon;


-- -----------------------------------------------------------------------------
-- 3. Views (0002) — totalen per org / team / categorie
--     Nieuwe sociale-score-kolommen staan ACHTERaan: PostgreSQL staat niet toe
--     om bij CREATE OR REPLACE een bestaande kolom-op posities een andere naam te geven.
-- -----------------------------------------------------------------------------
create or replace view public.public_dashboard_totals
with (security_invoker = true) as
select
  o.id                                                         as org_id,
  o.public_share_slug                                          as share_slug,
  o.name                                                       as org_name,
  o.eod_baseline_kg                                            as eod_baseline_kg,
  o.eod_baseline_date                                          as eod_baseline_date,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3)             as co2_saved_kg,
  count(r.id)::bigint                                          as registration_count,
  public.app_public_org_active_user_count(o.id)                as active_user_count,
  case
    when o.eod_baseline_kg is null or o.eod_baseline_kg = 0 then null
    else least(
      round((coalesce(sum(r.co2_kg_cached), 0) / o.eod_baseline_kg) * 365, 2),
      365
    )
  end                                                          as eod_days_gained,
  coalesce(sum(r.social_score_cached), 0)::numeric(14,3)       as social_score_total
from public.organizations o
left join public.registrations r on r.org_id = o.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, o.name, o.eod_baseline_kg, o.eod_baseline_date;


create or replace view public.public_team_breakdown
with (security_invoker = true) as
select
  o.id                                                         as org_id,
  o.public_share_slug                                          as share_slug,
  t.id                                                         as team_id,
  t.name                                                       as team_name,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3)             as co2_saved_kg,
  count(r.id)::bigint                                          as registration_count,
  coalesce(sum(r.social_score_cached), 0)::numeric(14,3)       as social_score_total
from public.organizations o
join public.teams t        on t.org_id = o.id and t.is_archived = false
left join public.registrations r on r.team_id = t.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, t.id, t.name;


create or replace view public.public_category_breakdown
with (security_invoker = true) as
select
  o.id                                                         as org_id,
  o.public_share_slug                                          as share_slug,
  c.id                                                         as category_id,
  c.name                                                       as category_name,
  c.color                                                      as category_color,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3)             as co2_saved_kg,
  count(r.id)::bigint                                          as registration_count,
  coalesce(sum(r.social_score_cached), 0)::numeric(14,3)       as social_score_total
from public.organizations o
join public.categories c   on c.org_id = o.id and c.is_archived = false
left join public.interventions i on i.category_id = c.id
left join public.registrations r on r.intervention_id = i.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, c.id, c.name, c.color;


grant select on public.public_dashboard_totals   to anon, authenticated;
grant select on public.public_team_breakdown     to anon, authenticated;
grant select on public.public_category_breakdown to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 4. Publieke week-tijdreeks (0004)
-- -----------------------------------------------------------------------------
create or replace view public.public_dashboard_timeseries
with (security_invoker = true) as
select
  o.id as org_id,
  o.public_share_slug as share_slug,
  date_trunc('week', r.happened_on::timestamp)::date as week_start,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3) as co2_saved_kg,
  count(r.id)::bigint as registration_count,
  coalesce(sum(r.social_score_cached), 0)::numeric(14,3) as social_score_total
from public.organizations o
join public.registrations r on r.org_id = o.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, date_trunc('week', r.happened_on::timestamp)::date;

grant select on public.public_dashboard_timeseries to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 5. Recente registraties voor TV/embed (0007)
-- -----------------------------------------------------------------------------
create or replace view public.public_recent_registrations
with (security_invoker = false) as
select
  o.id                         as org_id,
  o.public_share_slug           as share_slug,
  r.id                         as registration_id,
  r.happened_on                as happened_on,
  r.created_at                 as created_at,
  r.quantity                   as quantity,
  r.note                       as note,
  r.photo_path                 as photo_path,
  r.co2_kg_cached              as co2_kg_cached,
  i.name                       as intervention_name,
  i.unit                       as intervention_unit,
  t.name                       as team_name,
  c.name                       as category_name,
  c.color                      as category_color,
  r.social_score_cached        as social_score_cached
from public.registrations r
  join public.organizations o on o.id = r.org_id
  join public.interventions i on i.id = r.intervention_id
  join public.categories    c on c.id = i.category_id
  join public.teams         t on t.id = r.team_id
where o.public_share_enabled = true;

grant select on public.public_recent_registrations to anon, authenticated;


-- =============================================================================
-- Einde 0008_social_score.sql
-- =============================================================================
