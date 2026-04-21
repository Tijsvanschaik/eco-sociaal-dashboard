-- =============================================================================
-- 0004_public_dashboard_timeseries.sql
-- Eco-sociaal Dashboard - public weekly trend view for dashboard charts.
--
-- Datum:          2026-04-21
-- Afhankelijkheden: 0001_init.sql, 0002_views.sql
-- Doel:           Een publieke week-tijdreeks voor /p, /tv en /embed.
--                 De view draait met security_invoker = true en toont alleen
--                 aggregate-kolommen voor organisaties met public_share_enabled.
--
-- INSTRUCTIE:     Plak dit volledig in Supabase -> SQL Editor -> Run.
--                 Idempotent: re-run veilig.
-- =============================================================================

create or replace view public.public_dashboard_timeseries
with (security_invoker = true) as
select
  o.id as org_id,
  o.public_share_slug as share_slug,
  date_trunc('week', r.happened_on::timestamp)::date as week_start,
  coalesce(sum(r.co2_kg_cached), 0)::numeric(14,3) as co2_saved_kg,
  count(r.id)::bigint as registration_count
from public.organizations o
join public.registrations r on r.org_id = o.id
where o.public_share_enabled = true
group by o.id, o.public_share_slug, date_trunc('week', r.happened_on::timestamp)::date;

grant select on public.public_dashboard_timeseries to anon, authenticated;

-- =============================================================================
-- Einde 0004_public_dashboard_timeseries.sql
-- =============================================================================
