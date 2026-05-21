-- =============================================================================
-- 9000_seed.sql
-- Eco-sociaal Dashboard - dev seed for LEV Groep.
--
-- Datum:          2026-05-16 (destructieve tenant-reset voor `lev-groep`)
-- Afhankelijkheden: 0001_init.sql … 0009_eco_social_units.sql
-- Doel:           Stamdata LEV Groep: organisatie‑rij aanmaken/indien niet
--                 bestaat, daarna voor slug `lev-groep` ALLE gekoppelde
--                 registrations / memberships / team_memberships /
--                 interventions / categories / teams wissen en opnieuw 10 teams,
--                 6 thema‑categorieen en alle interventies (ADR 0007) laden.
--
-- Verantwoording: docs/decisions/0007-lev-intervention-impact-factors.md
--
-- LET OP DESTRUCTIEF voor tenant `lev-groep`:
--   Verwijdert alle registraties en alle org‑ledentabellen‑rijen voor die org.
--   Auth‑users blijven in Supabase Auth staan; die krijgen geen tenant‑toegang
--   meer tot LEV tot je ze opnieuw uitnodigt of `scripts/seed-fake-data.ts`
--   draait (service role).
--
-- BUCKET: oude foto‑objects onder `storage.objects` worden niet automatisch
--         gewist bij registration deletes — desgewenst handmatig opruimen.
--
-- LET OP: `public_share_enabled = true` hier AAN voor development‑routes.
--
-- UITVOERING: Één blok in SQL Editor voor een dev/dummy‑omgeving. Andere orgs in
--             dezelfde database worden niet aangeraakt.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Organizatie (rij aanwezig vóór tenant‑wissen)
-- -----------------------------------------------------------------------------
insert into public.organizations (name, slug, public_share_enabled, public_share_slug,
                                  eod_baseline_kg, eod_baseline_date)
values ('LEV Groep', 'lev-groep', true, 'lev-groep', 50000, date '2024-01-01')
on conflict (slug) do nothing;


-- -----------------------------------------------------------------------------
-- 2. Tenant `lev-groep` leegmaken (FK‑veilige volgorde)
-- -----------------------------------------------------------------------------
delete from public.registrations as r
using public.organizations as o
where o.slug = 'lev-groep'
  and r.org_id = o.id;

delete from public.team_memberships as tm
using public.organizations as o
where o.slug = 'lev-groep'
  and tm.org_id = o.id;

delete from public.memberships as m
using public.organizations as o
where o.slug = 'lev-groep'
  and m.org_id = o.id;

delete from public.interventions as i
using public.organizations as o
where o.slug = 'lev-groep'
  and i.org_id = o.id;

delete from public.categories as c
using public.organizations as o
where o.slug = 'lev-groep'
  and c.org_id = o.id;

delete from public.teams as t
using public.organizations as o
where o.slug = 'lev-groep'
  and t.org_id = o.id;


-- -----------------------------------------------------------------------------
-- 3. Teams
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
) as team(name);


-- -----------------------------------------------------------------------------
-- 4. Categorieen — zes LEV-thema's (kleuren uit ADR voor visueel onderscheid)
-- -----------------------------------------------------------------------------
with org as (select id from public.organizations where slug = 'lev-groep')
insert into public.categories (org_id, name, color)
select org.id, c.name, c.color
from org
cross join (values
  ('Afval & Scheiding',          '#78716c'),
  ('Duurzame Mobiliteit',        '#2563eb'),
  ('Energie & Besparing',        '#ea580c'),
  ('Groen & Leefomgeving',       '#16a34a'),
  ('Hergebruik & Circulair',     '#0d9488'),
  ('Ontmoeting & Bewustwording', '#a855f7')
) as c(name, color);


-- -----------------------------------------------------------------------------
-- 5. Interventies — factor-defaults conform ADR 0007
-- -----------------------------------------------------------------------------
with org as (
  select id from public.organizations where slug = 'lev-groep'
),
cats as (
  select c.id, c.name
  from public.categories c
  join org on c.org_id = org.id
)
insert into public.interventions (
  org_id,
  category_id,
  name,
  eco_unit,
  social_unit,
  co2_factor_kg,
  social_score_factor
)
select
  (select id from org),
  cats.id,
  iv.name,
  iv.unit_label,
  iv.unit_label,
  iv.factor,
  iv.social_factor
from cats
join (values
  -- Energie & Besparing
  ('Energie & Besparing', 'Energiecoach (contactuur)',                                  'uur',      3.050,   1.220),
  ('Energie & Besparing', 'Kierenjagers (tochtafdichting / handwerk)',                     'uur',      3.550,   1.130),
  ('Energie & Besparing', 'Energie-inloopspreekuur',                                       'uur',      2.600,   1.060),
  ('Energie & Besparing', 'Lezing over energie',                                          'stuk',    18.000,   0.930),
  ('Energie & Besparing', 'Ondersteuning Mijn Huis Past',                                  'uur',      3.100,   1.040),
  ('Energie & Besparing', 'Energieadvies / energiebesparing voor bewoners',                'uur',      3.350,   1.190),
  -- Groen & Leefomgeving
  ('Groen & Leefomgeving', 'Geveltuintjes aanleggen',                                      'uur',      0.550,   1.330),
  ('Groen & Leefomgeving', 'Vergroenen buurt, wijk of schoolplein',                         'uur',      0.650,   1.330),
  ('Groen & Leefomgeving', 'Tegels wippen / vergroenen oprit',                            'uur',      1.050,   1.140),
  ('Groen & Leefomgeving', 'Moestuin / buurttuin (mede-/ondersteuning)',                   'uur',      0.450,   1.520),
  ('Groen & Leefomgeving', 'Ondersteunen groeninitiatieven',                               'uur',      0.550,   1.520),
  ('Groen & Leefomgeving', 'Stationspark / buurtgroenproject',                             'uur',      0.550,   1.280),
  -- Hergebruik & Circulair
  ('Hergebruik & Circulair', 'Repaircafé - hersteld item',                                 'stuk',     6.500,   1.040),
  ('Hergebruik & Circulair', 'Kledingruil / kledingmarkt - item geruild',                 'stuk',     3.200,   1.140),
  ('Hergebruik & Circulair', 'Kledingatelier / naaiatelier',                               'uur',      2.250,   1.330),
  ('Hergebruik & Circulair', 'Kledingbank - item uitgifte',                                 'stuk',     4.250,   1.440),
  ('Hergebruik & Circulair', 'Speelgoedruilkast - item',                                    'stuk',     2.000,   1.040),
  ('Hergebruik & Circulair', 'Hergebruik materialen',                                      'kg',       4.800,   1.040),
  -- Ontmoeting & Bewustwording
  ('Ontmoeting & Bewustwording', 'Opruimactie',                                             'uur',      1.400,   1.320),
  ('Ontmoeting & Bewustwording', 'Taal & Tuin',                                             'uur',      0.350,   1.820),
  ('Ontmoeting & Bewustwording', 'Duurzame buurtactiviteit',                                'uur',      0.750,   1.520),
  ('Ontmoeting & Bewustwording', 'Buurtcamping - duurzame activiteit (uren inzet)',         'uur',      0.620,   1.820),
  ('Ontmoeting & Bewustwording', 'Bewustwordingsactiviteit',                                'uur',      0.450,   1.520),
  ('Ontmoeting & Bewustwording', 'Workshop / bijeenkomst duurzaamheid',                     'uur',      0.950,   1.380),
  ('Ontmoeting & Bewustwording', 'Verbindend duurzaam bewonersinitiatief',                   'uur',      0.540,   1.740),
  -- Duurzame Mobiliteit
  ('Duurzame Mobiliteit', 'Deelmobiliteit (km ipv auto)',                                    'km',       0.170,   0.340),
  ('Duurzame Mobiliteit', 'Teamfietsen (km ipv auto)',                                     'km',       0.170,   0.480),
  ('Duurzame Mobiliteit', 'Bakfiets inzet (km ipv auto)',                                   'km',       0.170,   0.430),
  ('Duurzame Mobiliteit', 'Bewoners aanmoedigen duurzaam vervoer',                         'km',       0.170,   0.620),
  -- Afval & Scheiding
  ('Afval & Scheiding', 'Afval scheiden op kantoor (actie-uren)',                         'uur',      2.080,   0.840),
  ('Afval & Scheiding', 'Afvalscheiding bij bewonersinitiatief',                             'uur',      1.750,   1.320),
  ('Afval & Scheiding', 'Bewustmaking afval tijdens evenement',                            'stuk',    10.000,   1.260),
  ('Afval & Scheiding', 'Zwerfafvalactie',                                                 'uur',      1.310,   1.220)
) as iv(cat_name, name, unit_label, factor, social_factor)
  on iv.cat_name = cats.name;

-- =============================================================================
-- Einde 9000_seed.sql
--
-- Controle-queries (optioneel):
--   select slug, id from public.organizations where slug = 'lev-groep';
--   select count(*) from public.registrations r
--     join public.organizations o on o.id = r.org_id where o.slug = 'lev-groep';  -- verwacht 0 na wipe
--   select count(*) from public.memberships m
--     join public.organizations o on o.id = m.org_id where o.slug = 'lev-groep';   -- verwacht 0 na wipe
-- Dummy-users opnieuw: `npx tsx scripts/seed-fake-data.ts` (vereist service role).
-- =============================================================================
