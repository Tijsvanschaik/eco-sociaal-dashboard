-- =============================================================================
-- 0003_platform_admins.sql
-- Doel: voeg een platform-brede superadmin-rol toe en breid RLS uit zodat
--       superadmins tenant-data read-only over alle organisaties heen kunnen
--       bekijken, zonder bestaande schrijfrechten van tenant-admins te verbreden.
-- Datum: 2026-04-21
-- Afhankelijkheden: vereist 0001_init.sql en 0002_views.sql
-- Instructie: Plak dit volledig in Supabase -> SQL Editor -> Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tabellen
-- -----------------------------------------------------------------------------
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;


-- -----------------------------------------------------------------------------
-- 2. Helper functions
-- -----------------------------------------------------------------------------
create or replace function public.app_is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.platform_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.app_is_superadmin() from public;
grant execute on function public.app_is_superadmin() to authenticated;


-- -----------------------------------------------------------------------------
-- 3. Policies
-- -----------------------------------------------------------------------------
drop policy if exists "platform_admins_select_superadmin" on public.platform_admins;
create policy "platform_admins_select_superadmin" on public.platform_admins
  for select to authenticated
  using (public.app_is_superadmin());

drop policy if exists "platform_admins_insert_superadmin" on public.platform_admins;
create policy "platform_admins_insert_superadmin" on public.platform_admins
  for insert to authenticated
  with check (public.app_is_superadmin());

drop policy if exists "platform_admins_update_superadmin" on public.platform_admins;
create policy "platform_admins_update_superadmin" on public.platform_admins
  for update to authenticated
  using (public.app_is_superadmin())
  with check (public.app_is_superadmin());

drop policy if exists "platform_admins_delete_superadmin" on public.platform_admins;
create policy "platform_admins_delete_superadmin" on public.platform_admins
  for delete to authenticated
  using (public.app_is_superadmin());

drop policy if exists "orgs_select_member" on public.organizations;
create policy "orgs_select_member" on public.organizations
  for select to authenticated
  using (public.app_is_member(id) or public.app_is_superadmin());

drop policy if exists "memberships_select" on public.memberships;
create policy "memberships_select" on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or public.app_is_admin(org_id) or public.app_is_superadmin());

drop policy if exists "locations_select_member" on public.locations;
create policy "locations_select_member" on public.locations
  for select to authenticated
  using (public.app_is_member(org_id) or public.app_is_superadmin());

drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams
  for select to authenticated
  using (public.app_is_member(org_id) or public.app_is_superadmin());

drop policy if exists "team_memberships_select_member" on public.team_memberships;
create policy "team_memberships_select_member" on public.team_memberships
  for select to authenticated
  using (public.app_is_member(org_id) or public.app_is_superadmin());

drop policy if exists "categories_select_member" on public.categories;
create policy "categories_select_member" on public.categories
  for select to authenticated
  using (public.app_is_member(org_id) or public.app_is_superadmin());

drop policy if exists "interventions_select_member" on public.interventions;
create policy "interventions_select_member" on public.interventions
  for select to authenticated
  using (public.app_is_member(org_id) or public.app_is_superadmin());

drop policy if exists "registrations_select_member" on public.registrations;
create policy "registrations_select_member" on public.registrations
  for select to authenticated
  using (public.app_is_member(org_id) or public.app_is_superadmin());

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


-- -----------------------------------------------------------------------------
-- 4. Grants
-- -----------------------------------------------------------------------------
revoke all on public.platform_admins from anon;
grant select, insert, update, delete on public.platform_admins to authenticated;


-- -----------------------------------------------------------------------------
-- 5. Bootstrap
-- -----------------------------------------------------------------------------
-- Na eerste run: eenmalig in SQL Editor draaien om jezelf te promoten.
-- Vervang het e-mailadres hieronder door je echte account.
--
-- insert into public.platform_admins (user_id)
-- values ((select id from auth.users where email = 'jij@example.com'))
-- on conflict (user_id) do nothing;
