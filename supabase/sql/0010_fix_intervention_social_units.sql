-- =============================================================================
-- 0010_fix_intervention_social_units.sql
-- Doel:     Zet social_unit op 'personen' waar die per ongeluk gelijk is aan
--           eco_unit (legacy uit 9000_seed vóór eco/sociaal-split).
--           Wijzigt GEEN users, memberships, teams of registratie-hoeveelheden.
-- Datum:    2026-05-26
-- Vereist:  0009_eco_social_units.sql
-- Gebruik:  Plak dit volledig in Supabase -> SQL Editor -> Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Interventies: sociale eenheid loskoppelen van eco-eenheid
-- -----------------------------------------------------------------------------
-- Na 0009 kopieerde 9000_seed social_unit = eco_unit. ADR 0008: sociaal telt
-- vrijwel altijd personen/deelnemers; eco blijft uur/km/stuk/kg.
update public.interventions
set
  social_unit = 'personen',
  updated_at = now()
where social_unit = eco_unit
  and is_archived = false;

-- Ook vangnet voor interventies waar social_unit per ongeluk een eco-label is
-- terwijl eco_unit intussen is aangepast:
update public.interventions
set
  social_unit = 'personen',
  updated_at = now()
where is_archived = false
  and social_unit in ('uur', 'km', 'stuk', 'kg', 'dag', 'liter', 'kwh', 'maaltijd')
  and social_unit <> 'personen';

-- -----------------------------------------------------------------------------
-- 2. Registraties: social_score_cached herberekenen (labels only fix hierboven;
--    quantities blijven staan — alleen cache syncen met huidige factor)
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
  and r.org_id = i.org_id;

-- -----------------------------------------------------------------------------
-- Einde 0010 — controle (optioneel):
--   select name, eco_unit, social_unit from public.interventions
--     where org_id = (select id from public.organizations where slug = 'lev-groep')
--     order by name limit 10;
--   select count(*) filter (where social_unit = 'personen') as personen,
--          count(*) filter (where social_unit = eco_unit) as nog_gelijk
--     from public.interventions where is_archived = false;
-- =============================================================================
