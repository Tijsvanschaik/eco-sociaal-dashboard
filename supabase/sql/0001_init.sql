-- =============================================================================
-- 0001_init.sql
-- Eco-sociaal Dashboard - initial schema + RLS
--
-- Datum:          2026-04-17
-- Afhankelijkheden: geen (dit is het eerste bestand)
-- Doel:           Multi-tenant schema (organizations -> memberships, locations,
--                 teams, categories, interventions, registrations) inclusief
--                 Row Level Security zodat elke org geisoleerd werkt. Een
--                 beperkte leesset voor de 'anon' rol wordt alleen toegestaan
--                 voor organisaties met public_share_enabled = true.
--
-- INSTRUCTIE:     Plak dit volledig in Supabase -> SQL Editor -> Run.
--                 Idempotent: re-run veilig. Na de run in `docs/progress.md`
--                 aanvinken en types regenereren (Supabase dashboard ->
--                 API -> Generate Types) en in supabase/types/supabase.ts
--                 plakken.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Extensies
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- -----------------------------------------------------------------------------
-- 2. Enum types
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'worker');
  end if;

  if not exists (select 1 from pg_type where typname = 'intervention_unit') then
    create type public.intervention_unit as enum (
      'kg', 'km', 'maaltijd', 'kwh', 'stuk', 'uur', 'liter', 'dag'
    );
  end if;
end $$;


-- -----------------------------------------------------------------------------
-- 3. Tabellen
-- -----------------------------------------------------------------------------

-- Organizations ---------------------------------------------------------------
create table if not exists public.organizations (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  public_share_enabled boolean not null default false,
  public_share_slug    text unique,
  eod_baseline_kg      numeric(14, 2),
  eod_baseline_date    date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Memberships: user <-> org ---------------------------------------------------
create table if not exists public.memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.user_role not null default 'worker',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- Locations -------------------------------------------------------------------
create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  is_internal boolean not null default false,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, name)
);

-- Teams -----------------------------------------------------------------------
-- Composite unique (id, org_id) enables composite FK from registrations so
-- you can't register against a team from a different org even if the FK on
-- team_id alone would accept it.
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete restrict,
  name        text not null,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, location_id, name)
);

-- Team memberships: user <-> team (M:N) ---------------------------------------
create table if not exists public.team_memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  team_id    uuid not null references public.teams(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

-- Categories ------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  color       text not null default '#6b7280'
              check (color ~ '^#[0-9a-fA-F]{6}$'),
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, name)
);

-- Interventions ---------------------------------------------------------------
create table if not exists public.interventions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  category_id   uuid not null,
  name          text not null,
  unit          public.intervention_unit not null,
  co2_factor_kg numeric(14, 6) not null check (co2_factor_kg >= 0),
  is_archived   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (org_id, id),
  unique (org_id, name),
  foreign key (org_id, category_id)
    references public.categories(org_id, id) on delete restrict
);

-- Registrations ---------------------------------------------------------------
create table if not exists public.registrations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  team_id         uuid not null,
  intervention_id uuid not null,
  user_id         uuid not null references auth.users(id) on delete restrict,
  quantity        numeric(14, 3) not null check (quantity > 0),
  happened_on     date not null default current_date,
  photo_path      text,
  note            text,
  co2_kg_cached   numeric(14, 3) not null check (co2_kg_cached >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  foreign key (org_id, team_id)
    references public.teams(org_id, id) on delete restrict,
  foreign key (org_id, intervention_id)
    references public.interventions(org_id, id) on delete restrict
);


-- -----------------------------------------------------------------------------
-- 4. Indexen
-- -----------------------------------------------------------------------------
create index if not exists idx_memberships_user         on public.memberships(user_id);
create index if not exists idx_memberships_org          on public.memberships(org_id);
create index if not exists idx_team_memberships_user    on public.team_memberships(user_id);
create index if not exists idx_team_memberships_team    on public.team_memberships(team_id);
create index if not exists idx_teams_org                on public.teams(org_id);
create index if not exists idx_locations_org            on public.locations(org_id);
create index if not exists idx_categories_org           on public.categories(org_id);
create index if not exists idx_interventions_org        on public.interventions(org_id);
create index if not exists idx_interventions_category   on public.interventions(category_id);
create index if not exists idx_registrations_org_date   on public.registrations(org_id, happened_on desc);
create index if not exists idx_registrations_team       on public.registrations(team_id);
create index if not exists idx_registrations_user       on public.registrations(user_id);
create index if not exists idx_registrations_intervention on public.registrations(intervention_id);


-- -----------------------------------------------------------------------------
-- 5. Helper functions (SECURITY DEFINER, used inside RLS policies)
-- -----------------------------------------------------------------------------
-- These bypass RLS on memberships/team_memberships to avoid recursive
-- evaluation when policies reference them. They ONLY read with the current
-- auth.uid(), so they cannot be abused to peek at other users' data.

create or replace function public.app_is_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid()
  );
$$;

create or replace function public.app_is_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.app_is_in_team(p_team uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.team_memberships
    where team_id = p_team and user_id = auth.uid()
  );
$$;

revoke all on function public.app_is_member(uuid)   from public;
revoke all on function public.app_is_admin(uuid)    from public;
revoke all on function public.app_is_in_team(uuid)  from public;
grant execute on function public.app_is_member(uuid)  to authenticated, anon;
grant execute on function public.app_is_admin(uuid)   to authenticated;
grant execute on function public.app_is_in_team(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- 6. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.organizations    enable row level security;
alter table public.memberships      enable row level security;
alter table public.locations        enable row level security;
alter table public.teams            enable row level security;
alter table public.team_memberships enable row level security;
alter table public.categories       enable row level security;
alter table public.interventions    enable row level security;
alter table public.registrations    enable row level security;

-- organizations ---------------------------------------------------------------
drop policy if exists "orgs_select_member" on public.organizations;
create policy "orgs_select_member" on public.organizations
  for select to authenticated
  using (public.app_is_member(id));

drop policy if exists "orgs_update_admin" on public.organizations;
create policy "orgs_update_admin" on public.organizations
  for update to authenticated
  using (public.app_is_admin(id))
  with check (public.app_is_admin(id));

drop policy if exists "orgs_select_anon_public" on public.organizations;
create policy "orgs_select_anon_public" on public.organizations
  for select to anon
  using (public_share_enabled = true);

-- memberships -----------------------------------------------------------------
drop policy if exists "memberships_select" on public.memberships;
create policy "memberships_select" on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or public.app_is_admin(org_id));

drop policy if exists "memberships_insert_admin" on public.memberships;
create policy "memberships_insert_admin" on public.memberships
  for insert to authenticated
  with check (public.app_is_admin(org_id));

drop policy if exists "memberships_update_admin" on public.memberships;
create policy "memberships_update_admin" on public.memberships
  for update to authenticated
  using (public.app_is_admin(org_id))
  with check (public.app_is_admin(org_id));

drop policy if exists "memberships_delete_admin" on public.memberships;
create policy "memberships_delete_admin" on public.memberships
  for delete to authenticated
  using (public.app_is_admin(org_id));

-- locations -------------------------------------------------------------------
drop policy if exists "locations_select_member" on public.locations;
create policy "locations_select_member" on public.locations
  for select to authenticated using (public.app_is_member(org_id));

drop policy if exists "locations_write_admin" on public.locations;
create policy "locations_write_admin" on public.locations
  for all to authenticated
  using (public.app_is_admin(org_id))
  with check (public.app_is_admin(org_id));

drop policy if exists "locations_select_anon_public" on public.locations;
create policy "locations_select_anon_public" on public.locations
  for select to anon
  using (exists (
    select 1 from public.organizations o
    where o.id = locations.org_id and o.public_share_enabled = true
  ));

-- teams -----------------------------------------------------------------------
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams
  for select to authenticated using (public.app_is_member(org_id));

drop policy if exists "teams_write_admin" on public.teams;
create policy "teams_write_admin" on public.teams
  for all to authenticated
  using (public.app_is_admin(org_id))
  with check (public.app_is_admin(org_id));

drop policy if exists "teams_select_anon_public" on public.teams;
create policy "teams_select_anon_public" on public.teams
  for select to anon
  using (exists (
    select 1 from public.organizations o
    where o.id = teams.org_id and o.public_share_enabled = true
  ));

-- team_memberships ------------------------------------------------------------
drop policy if exists "team_memberships_select_member" on public.team_memberships;
create policy "team_memberships_select_member" on public.team_memberships
  for select to authenticated using (public.app_is_member(org_id));

drop policy if exists "team_memberships_write_admin" on public.team_memberships;
create policy "team_memberships_write_admin" on public.team_memberships
  for all to authenticated
  using (public.app_is_admin(org_id))
  with check (public.app_is_admin(org_id));

-- categories ------------------------------------------------------------------
drop policy if exists "categories_select_member" on public.categories;
create policy "categories_select_member" on public.categories
  for select to authenticated using (public.app_is_member(org_id));

drop policy if exists "categories_write_admin" on public.categories;
create policy "categories_write_admin" on public.categories
  for all to authenticated
  using (public.app_is_admin(org_id))
  with check (public.app_is_admin(org_id));

drop policy if exists "categories_select_anon_public" on public.categories;
create policy "categories_select_anon_public" on public.categories
  for select to anon
  using (exists (
    select 1 from public.organizations o
    where o.id = categories.org_id and o.public_share_enabled = true
  ));

-- interventions ---------------------------------------------------------------
drop policy if exists "interventions_select_member" on public.interventions;
create policy "interventions_select_member" on public.interventions
  for select to authenticated using (public.app_is_member(org_id));

drop policy if exists "interventions_write_admin" on public.interventions;
create policy "interventions_write_admin" on public.interventions
  for all to authenticated
  using (public.app_is_admin(org_id))
  with check (public.app_is_admin(org_id));

drop policy if exists "interventions_select_anon_public" on public.interventions;
create policy "interventions_select_anon_public" on public.interventions
  for select to anon
  using (exists (
    select 1 from public.organizations o
    where o.id = interventions.org_id and o.public_share_enabled = true
  ));

-- registrations ---------------------------------------------------------------
-- SELECT for authenticated: any member of the org.
drop policy if exists "registrations_select_member" on public.registrations;
create policy "registrations_select_member" on public.registrations
  for select to authenticated using (public.app_is_member(org_id));

-- INSERT: admin for any team in org, or worker for own team + own user_id.
drop policy if exists "registrations_insert" on public.registrations;
create policy "registrations_insert" on public.registrations
  for insert to authenticated
  with check (
    public.app_is_admin(org_id)
    or (
      public.app_is_member(org_id)
      and public.app_is_in_team(team_id)
      and user_id = auth.uid()
    )
  );

-- UPDATE: owner always, admin always.
drop policy if exists "registrations_update" on public.registrations;
create policy "registrations_update" on public.registrations
  for update to authenticated
  using (user_id = auth.uid() or public.app_is_admin(org_id))
  with check (user_id = auth.uid() or public.app_is_admin(org_id));

-- DELETE: owner always, admin always.
drop policy if exists "registrations_delete" on public.registrations;
create policy "registrations_delete" on public.registrations
  for delete to authenticated
  using (user_id = auth.uid() or public.app_is_admin(org_id));

-- Anon: only aggregate-safe columns for public orgs. We revoke SELECT on the
-- whole table for anon and then grant SELECT on a column whitelist that
-- excludes user_id, photo_path and note.
drop policy if exists "registrations_select_anon_public" on public.registrations;
create policy "registrations_select_anon_public" on public.registrations
  for select to anon
  using (exists (
    select 1 from public.organizations o
    where o.id = registrations.org_id and o.public_share_enabled = true
  ));


-- -----------------------------------------------------------------------------
-- 7. Column-level grants for anon (privacy: no user_id / photo / note)
-- -----------------------------------------------------------------------------
revoke all on public.registrations   from anon;
grant select (id, org_id, team_id, intervention_id, quantity, happened_on,
              co2_kg_cached, created_at)
  on public.registrations to anon;

-- Other tables: full SELECT for anon is filtered by RLS to public orgs only.
grant select on public.organizations to anon;
grant select on public.locations     to anon;
grant select on public.teams         to anon;
grant select on public.categories    to anon;
grant select on public.interventions to anon;


-- -----------------------------------------------------------------------------
-- 8. Storage bucket `registrations` + policies
-- -----------------------------------------------------------------------------
-- Path convention: <org_id>/<registration_id>/<filename>.
-- The first path segment must be the org_id so RLS can isolate tenants.

insert into storage.buckets (id, name, public)
values ('registrations', 'registrations', false)
on conflict (id) do nothing;

drop policy if exists "registrations_storage_select_member" on storage.objects;
create policy "registrations_storage_select_member" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'registrations'
    and public.app_is_member((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "registrations_storage_insert_member" on storage.objects;
create policy "registrations_storage_insert_member" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'registrations'
    and public.app_is_member((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "registrations_storage_update_owner" on storage.objects;
create policy "registrations_storage_update_owner" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'registrations'
    and (owner = auth.uid() or public.app_is_admin((split_part(name, '/', 1))::uuid))
  )
  with check (bucket_id = 'registrations');

drop policy if exists "registrations_storage_delete_owner" on storage.objects;
create policy "registrations_storage_delete_owner" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'registrations'
    and (owner = auth.uid() or public.app_is_admin((split_part(name, '/', 1))::uuid))
  );


-- -----------------------------------------------------------------------------
-- 9. updated_at triggers
-- -----------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations','locations','teams','categories','interventions','registrations'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.tg_set_updated_at();',
      t
    );
  end loop;
end $$;

-- =============================================================================
-- Einde 0001_init.sql
-- Controle-queries na de run (optioneel, in Supabase SQL Editor):
--   select relname, relrowsecurity from pg_class
--     where relname in ('organizations','memberships','locations','teams',
--                       'team_memberships','categories','interventions',
--                       'registrations');
--   -- alle rijen moeten relrowsecurity = t hebben.
-- =============================================================================
