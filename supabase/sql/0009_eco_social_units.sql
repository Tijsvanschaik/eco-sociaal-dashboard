-- =============================================================================
-- 0009_eco_social_units.sql
-- Eco-sociaal Dashboard — aparte eco- en sociale eenheden + social_quantity.
--
-- Datum:          2026-05-21
-- Afhankelijkheden: 0001_init.sql … 0008_social_score.sql
-- Doel:           interventions: eco_unit + social_unit (vrije tekst, admin).
--                 registrations: social_quantity naast quantity (eco).
--                 Historische sociale totalen worden eenmalig op 0 gezet.
--
-- INSTRUCTIE:     Plak dit volledig in Supabase -> SQL Editor -> Run.
--                 Idempotent waar mogelijk.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Interventions — eco_unit + social_unit, drop legacy enum column
-- -----------------------------------------------------------------------------
alter table public.interventions
  add column if not exists eco_unit text,
  add column if not exists social_unit text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'interventions'
      and column_name = 'unit'
  ) then
    update public.interventions
    set
      eco_unit = coalesce(nullif(trim(eco_unit), ''), unit::text),
      social_unit = coalesce(nullif(trim(social_unit), ''), unit::text);
  end if;
end $$;

update public.interventions
set
  eco_unit = coalesce(nullif(trim(eco_unit), ''), 'eenheid'),
  social_unit = coalesce(nullif(trim(social_unit), ''), 'eenheid')
where eco_unit is null
   or social_unit is null
   or trim(eco_unit) = ''
   or trim(social_unit) = '';

alter table public.interventions
  alter column eco_unit set not null,
  alter column social_unit set not null;

alter table public.interventions
  drop constraint if exists interventions_eco_unit_length,
  drop constraint if exists interventions_social_unit_length;

alter table public.interventions
  add constraint interventions_eco_unit_length
    check (char_length(eco_unit) between 1 and 40),
  add constraint interventions_social_unit_length
    check (char_length(social_unit) between 1 and 40);


-- -----------------------------------------------------------------------------
-- 2. Registrations — social_quantity + reset legacy social cache
-- -----------------------------------------------------------------------------
alter table public.registrations
  add column if not exists social_quantity numeric(14, 3);

update public.registrations
set
  social_quantity = 0,
  social_score_cached = 0
where social_quantity is null;

alter table public.registrations
  alter column social_quantity set not null;

alter table public.registrations
  drop constraint if exists registrations_social_quantity_non_negative;

alter table public.registrations
  add constraint registrations_social_quantity_non_negative
    check (social_quantity >= 0);


-- -----------------------------------------------------------------------------
-- 3. Publieke view (drop + recreate: nieuwe kolommen, andere volgorde)
-- -----------------------------------------------------------------------------
drop view if exists public.public_recent_registrations;

create view public.public_recent_registrations
with (security_invoker = false) as
select
  o.id                         as org_id,
  o.public_share_slug          as share_slug,
  r.id                         as registration_id,
  r.happened_on                as happened_on,
  r.created_at                 as created_at,
  r.quantity                   as quantity,
  r.social_quantity            as social_quantity,
  r.note                       as note,
  r.photo_path                 as photo_path,
  r.co2_kg_cached              as co2_kg_cached,
  r.social_score_cached        as social_score_cached,
  i.name                       as intervention_name,
  i.eco_unit                   as intervention_eco_unit,
  i.social_unit                as intervention_social_unit,
  t.name                       as team_name,
  c.name                       as category_name,
  c.color                      as category_color
from public.registrations r
  join public.organizations o on o.id = r.org_id
  join public.interventions i on i.id = r.intervention_id
  join public.categories    c on c.id = i.category_id
  join public.teams         t on t.id = r.team_id
where o.public_share_enabled = true;

grant select on public.public_recent_registrations to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 4. Drop legacy interventions.unit (nu geen view-afhankelijkheid meer)
-- -----------------------------------------------------------------------------
alter table public.interventions
  drop column if exists unit;


-- -----------------------------------------------------------------------------
-- 5. Anon column grant (social_quantity voor aggregate-paden)
-- -----------------------------------------------------------------------------
revoke all on public.registrations from anon;
grant select (
  id,
  org_id,
  team_id,
  intervention_id,
  quantity,
  social_quantity,
  happened_on,
  co2_kg_cached,
  social_score_cached,
  created_at
)
  on public.registrations to anon;


-- =============================================================================
-- Einde 0009_eco_social_units.sql
-- =============================================================================
