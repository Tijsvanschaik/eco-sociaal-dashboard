-- =============================================================================
-- 0012_org_profile_content.sql
-- Doel: missie kort + impact-disclaimer; org-logo storage bucket.
--       `description` blijft missie lang (bestaande kolom).
-- Datum: 2026-06-22
-- Afhankelijkheden: 0001_init.sql, 0006_org_profile.sql
-- Instructie: Plak volledig in Supabase -> SQL Editor -> Run. Idempotent.
-- =============================================================================

alter table public.organizations
  add column if not exists mission_short text,
  add column if not exists impact_disclaimer text;

-- Ruimere missie-tekst (was 280 in Zod; DB had geen limiet)
comment on column public.organizations.description is 'Missie lang / uitgebreide org-toelichting';
comment on column public.organizations.mission_short is 'Korte missie (1-2 zinnen)';
comment on column public.organizations.impact_disclaimer is 'Disclaimer indicatieve impact-cijfers';

-- -----------------------------------------------------------------------------
-- Org logos bucket (private; signed/public URL via logo_url)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "org_logos_select_public" on storage.objects;
create policy "org_logos_select_public" on storage.objects
  for select to public
  using (bucket_id = 'org-logos');

drop policy if exists "org_logos_insert_admin" on storage.objects;
create policy "org_logos_insert_admin" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'org-logos'
    and public.app_is_admin((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "org_logos_update_admin" on storage.objects;
create policy "org_logos_update_admin" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'org-logos'
    and public.app_is_admin((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "org_logos_delete_admin" on storage.objects;
create policy "org_logos_delete_admin" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'org-logos'
    and (
      public.app_is_admin((split_part(name, '/', 1))::uuid)
      or public.app_is_superadmin()
    )
  );
