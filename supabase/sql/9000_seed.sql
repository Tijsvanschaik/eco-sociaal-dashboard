-- =============================================================================
-- 9000_seed.sql
-- Eco-sociaal Dashboard - dev seed for LEV Groep.
--
-- Datum:          2026-04-17
-- Afhankelijkheden: 0001_init.sql, 0002_views.sql
-- Doel:           Een speelbare dataset voor development: 1 organisatie
--                 (LEV Groep), 10 teams, 6 categorieen en 10 interventies met
--                 placeholder CO2-factoren (LEV nog door te geven).
--
-- INSTRUCTIE:     Plak dit volledig in Supabase -> SQL Editor -> Run. Alle
--                 inserts gebruiken `on conflict do nothing`, dus re-runs zijn
--                 veilig. Dit bestand seed GEEN registraties en GEEN
--                 memberships; members voeg je later toe via /beheer of het
--                 Supabase-dashboard.
--
-- LET OP: `public_share_enabled = true` staat hier AAN zodat de publieke
--         routes meteen werken tijdens development. Schakel dit in productie
--         desgewenst via /[org]/instellingen uit.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Organizatie
-- -----------------------------------------------------------------------------
insert into public.organizations (name, slug, public_share_enabled, public_share_slug,
                                  eod_baseline_kg, eod_baseline_date)
values ('LEV Groep', 'lev-groep', true, 'lev-groep', 50000, date '2024-01-01')
on conflict (slug) do nothing;


-- -----------------------------------------------------------------------------
-- 2. Teams
-- -----------------------------------------------------------------------------
with org as (select id from public.organizations where slug = 'lev-groep')
insert into public.teams (org_id, name)
select org.id, team.name
from org
cross join (values
  ('LEV Asten'),
  ('LEV Best'),
  ('LEV Deurne'),
  ('LEV Geldrop-Mierlo'),
  ('LEV Helmond'),
  ('LEV Laarbeek'),
  ('LEV Nuenen'),
  ('LEV Son en Breugel'),
  ('WIJzer Oirschot'),
  ('LEV-groep centraal')
) as team(name)
on conflict (org_id, name) do nothing;


-- -----------------------------------------------------------------------------
-- 3. Categorieen (6)
-- -----------------------------------------------------------------------------
with org as (select id from public.organizations where slug = 'lev-groep')
insert into public.categories (org_id, name, color)
select org.id, c.name, c.color
from org
cross join (values
  ('Mobiliteit', '#3b82f6'),
  ('Voeding',    '#10b981'),
  ('Energie',    '#f59e0b'),
  ('Afval',      '#8b5a2b'),
  ('Inkoop',     '#8b5cf6'),
  ('Sociaal',    '#ec4899')
) as c(name, color)
on conflict (org_id, name) do nothing;


-- -----------------------------------------------------------------------------
-- 4. Interventies (10) - PLACEHOLDER CO2-factoren
-- LEV moet deze vervangen door factoren uit CO2emissiefactoren.nl / eigen
-- metingen. Tot die tijd is co2_factor_kg indicatief.
-- -----------------------------------------------------------------------------
with org as (
  select id from public.organizations where slug = 'lev-groep'
),
cats as (
  select c.id, c.name
  from public.categories c
  join org on c.org_id = org.id
)
insert into public.interventions (org_id, category_id, name, unit, co2_factor_kg)
select
  (select id from org),
  cats.id,
  iv.name,
  iv.unit::public.intervention_unit,
  iv.factor
from cats
join (values
  ('Mobiliteit', 'Fietsen in plaats van auto',      'km',       0.170),
  ('Mobiliteit', 'Carpoolen',                        'km',       0.085),
  ('Mobiliteit', 'Openbaar vervoer ipv auto',        'km',       0.110),
  ('Voeding',    'Vegetarische maaltijd',            'maaltijd', 2.000),
  ('Voeding',    'Lokaal & seizoen koken',           'maaltijd', 1.500),
  ('Energie',    'LED-lamp ipv gloeilamp',           'stuk',     5.000),
  ('Energie',    'Thermostaat 1 graad lager',        'dag',      0.800),
  ('Afval',      'Voedselverspilling voorkomen',     'maaltijd', 1.000),
  ('Inkoop',     'Tweedehands kantoorartikel',       'stuk',     3.000),
  ('Sociaal',    'Bezoek eenzame buurtbewoner',      'uur',      0.000)
) as iv(cat_name, name, unit, factor)
  on iv.cat_name = cats.name
on conflict (org_id, name) do nothing;

-- =============================================================================
-- Einde 9000_seed.sql
--
-- Controle-queries:
--   select slug, name from public.organizations;
--   select name from public.teams order by name;
--   select name, color from public.categories order by name;
--   select name, unit, co2_factor_kg from public.interventions order by name;
-- =============================================================================
