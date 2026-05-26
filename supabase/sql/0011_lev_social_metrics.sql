-- =============================================================================
-- 0011_lev_social_metrics.sql
-- Doel:     Sociale metrics conform review 2026-05-26 — social_unit = personen,
--           social_score_factor per LEV-interventie (ADR 0007), herbereken cache.
--           Geen wipe van users, memberships of registratie-hoeveelheden.
-- Datum:    2026-05-26
-- Vereist:  0009_eco_social_units.sql
-- Gebruik:  Plak dit volledig in Supabase -> SQL Editor -> Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Alle actieve interventies: sociale eenheid = personen
-- -----------------------------------------------------------------------------
update public.interventions
set
  social_unit = 'personen',
  updated_at = now()
where is_archived = false
  and social_unit is distinct from 'personen';

-- -----------------------------------------------------------------------------
-- 2. Sociale-score-factoren (LEV-interventienamen, ADR 0007 / review 2026-05-26)
-- -----------------------------------------------------------------------------
with lev_social_factors (name, social_score_factor) as (
  values
    ('Energiecoach (contactuur)', 1.220),
    ('Kierenjagers (tochtafdichting / handwerk)', 1.130),
    ('Energie-inloopspreekuur', 1.060),
    ('Lezing over energie', 0.930),
    ('Ondersteuning Mijn Huis Past', 1.040),
    ('Energieadvies / energiebesparing voor bewoners', 1.190),
    ('Geveltuintjes aanleggen', 1.330),
    ('Vergroenen buurt, wijk of schoolplein', 1.330),
    ('Tegels wippen / vergroenen oprit', 1.140),
    ('Moestuin / buurttuin (mede-/ondersteuning)', 1.520),
    ('Ondersteunen groeninitiatieven', 1.520),
    ('Stationspark / buurtgroenproject', 1.280),
    ('Repaircafé - hersteld item', 1.040),
    ('Kledingruil / kledingmarkt - item geruild', 1.140),
    ('Kledingatelier / naaiatelier', 1.330),
    ('Kledingbank - item uitgifte', 1.440),
    ('Speelgoedruilkast - item', 1.040),
    ('Hergebruik materialen', 1.040),
    ('Opruimactie', 1.320),
    ('Taal & Tuin', 1.820),
    ('Duurzame buurtactiviteit', 1.520),
    ('Buurtcamping - duurzame activiteit (uren inzet)', 1.820),
    ('Bewustwordingsactiviteit', 1.520),
    ('Workshop / bijeenkomst duurzaamheid', 1.380),
    ('Verbindend duurzaam bewonersinitiatief', 1.740),
    ('Deelmobiliteit (km ipv auto)', 0.340),
    ('Teamfietsen (km ipv auto)', 0.480),
    ('Bakfiets inzet (km ipv auto)', 0.430),
    ('Bewoners aanmoedigen duurzaam vervoer', 0.620),
    ('Afval scheiden op kantoor (actie-uren)', 0.840),
    ('Afvalscheiding bij bewonersinitiatief', 1.320),
    ('Bewustmaking afval tijdens evenement', 1.260),
    ('Zwerfafvalactie', 1.220)
)
update public.interventions i
set
  social_score_factor = f.social_score_factor,
  updated_at = now()
from lev_social_factors f
where i.name = f.name
  and i.is_archived = false
  and i.social_score_factor is distinct from f.social_score_factor;

-- -----------------------------------------------------------------------------
-- 3. Registraties: social_score_cached herberekenen
-- -----------------------------------------------------------------------------
update public.registrations r
set
  social_score_cached = round(
    (r.social_quantity * i.social_score_factor)::numeric,
    3
  ),
  updated_at = now()
from public.interventions i
where r.intervention_id = i.id
  and r.org_id = i.org_id
  and r.social_score_cached is distinct from round(
    (r.social_quantity * i.social_score_factor)::numeric,
    3
  );

-- -----------------------------------------------------------------------------
-- Einde 0011 — controle (optioneel):
--   select name, eco_unit, social_unit, social_score_factor
--     from public.interventions
--     where org_id = (select id from public.organizations where slug = 'lev-groep')
--     order by name;
-- =============================================================================
