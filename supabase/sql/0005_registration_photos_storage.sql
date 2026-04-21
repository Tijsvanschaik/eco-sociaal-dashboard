-- =============================================================================
-- 0005_registration_photos_storage.sql
-- Doel: zorg dat de `registrations`-storage bucket met bijbehorende RLS-policies
--       correct staat voor foto-uploads bij registraties. Deze migratie repareert
--       scenario's waarin de bucket ontbreekt, policies ontbreken of superadmins
--       niet konden uploaden/lezen, en maakt alles idempotent runbaar.
-- Datum: 2026-04-21
-- Afhankelijkheden: vereist 0001_init.sql en 0003_platform_admins.sql
-- Instructie: Plak dit volledig in Supabase -> SQL Editor -> Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bucket
-- -----------------------------------------------------------------------------
-- De bucket moet bestaan en private zijn. Eventueel eerder ingestelde
-- MIME/size-limits worden gereset zodat de client-side validatie leidend is.
insert into storage.buckets (id, name, public)
values ('registrations', 'registrations', false)
on conflict (id) do update
  set public = excluded.public;

update storage.buckets
   set file_size_limit = null,
       allowed_mime_types = null
 where id = 'registrations';


-- -----------------------------------------------------------------------------
-- 2. Policies op storage.objects
-- -----------------------------------------------------------------------------
-- Pad-conventie: <org_id>/<user_id>/<uuid>.<ext>. De eerste segment MOET de
-- organisatie-UUID zijn zodat RLS tenant-isolatie kan afdwingen.

drop policy if exists "registrations_storage_select_member" on storage.objects;
create policy "registrations_storage_select_member" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'registrations'
    and (
      public.app_is_member((split_part(name, '/', 1))::uuid)
      or public.app_is_superadmin()
    )
  );

drop policy if exists "registrations_storage_insert_member" on storage.objects;
create policy "registrations_storage_insert_member" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'registrations'
    and (
      public.app_is_member((split_part(name, '/', 1))::uuid)
      or public.app_is_superadmin()
    )
  );

drop policy if exists "registrations_storage_update_owner" on storage.objects;
create policy "registrations_storage_update_owner" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'registrations'
    and (
      owner = auth.uid()
      or public.app_is_admin((split_part(name, '/', 1))::uuid)
      or public.app_is_superadmin()
    )
  )
  with check (bucket_id = 'registrations');

drop policy if exists "registrations_storage_delete_owner" on storage.objects;
create policy "registrations_storage_delete_owner" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'registrations'
    and (
      owner = auth.uid()
      or public.app_is_admin((split_part(name, '/', 1))::uuid)
      or public.app_is_superadmin()
    )
  );


-- -----------------------------------------------------------------------------
-- 3. Grants
-- -----------------------------------------------------------------------------
-- Zeker weten dat storage-RLS de helper-functies mag aanroepen onder `authenticated`.
grant execute on function public.app_is_member(uuid)   to authenticated;
grant execute on function public.app_is_admin(uuid)    to authenticated;
grant execute on function public.app_is_superadmin()   to authenticated;
