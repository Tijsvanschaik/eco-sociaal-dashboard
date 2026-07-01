-- =============================================================================
-- 0013_lev_dashboard_profile_copy.sql
-- Eco-sociaal Dashboard — LEV Groep dashboard-profielteksten
--
-- Datum:          2026-07-01
-- Afhankelijkheden: 0012_org_profile_content.sql (kolommen description, impact_disclaimer)
-- Doel:            Missie (uitgebreid) + impact-disclaimer voor slug `lev-groep`
--                   bijwerken voor het interne dashboard welkomstpanel.
--
-- UITVOERING: Plak dit volledig in Supabase -> SQL Editor -> Run.
--             Idempotent: veilig opnieuw draaien (overschrijft dezelfde velden).
-- =============================================================================

update public.organizations
set
  description = $desc$LEV Groep werkt sinds 2020 aan duurzaamheid, van energiebesparing tot circulaire inkoop. Die ervaring gebruiken we nu ook buiten onze eigen muren: van binnen naar buiten. Klimaatverandering raakt namelijk niet alleen het milieu, maar ook de mensen in onze wijken, denk aan energiearmoede, hittestress en leefbaarheid. Daarom verbinden we eco-thema's als energie, mobiliteit en klimaatadaptatie met sociale thema's als gezondheid en verbinding. Dit dashboard maakt zichtbaar welke concrete stappen medewerkers en teams daarin zetten, in Helmond en de regio.$desc$,
  impact_disclaimer = $disc$De eco- en sociale score op dit dashboard zijn indicatieve inschattingen, bedoeld om bewustwording en betrokkenheid te stimuleren. Ze zijn geen wetenschappelijk gevalideerde meting, maar geven een praktisch beeld van de impact van onze activiteiten.$disc$
where slug = 'lev-groep';
