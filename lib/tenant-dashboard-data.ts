import type { DashboardSnapshot } from "@/lib/dashboard";
import { buildDashboardSnapshot } from "@/lib/dashboard";
import { getOrgContextBySlug } from "@/lib/organizations";
import type { createClient } from "@/lib/supabase/server";
import {
  type DashboardPeriod,
  type WeeklyCategoryTimeseriesRow,
  type WeeklyTimeseriesRow,
  buildWeeklyCategoryTimeseries,
  buildWeeklyTimeseries,
  filterRegistrationsByPeriod,
} from "@/lib/timeseries";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type TeamOption = {
  id: string;
  locationName: string;
  name: string;
};

export type InterventionOption = {
  categoryName: string;
  factorKg: number;
  id: string;
  name: string;
  unit: string;
};

export type RecentRegistration = {
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  quantity: number;
  teamLabel: string;
};

export type TenantDashboardData = {
  context: NonNullable<Awaited<ReturnType<typeof getOrgContextBySlug>>>;
  interventions: InterventionOption[];
  categoryTimeseries: WeeklyCategoryTimeseriesRow[];
  period: DashboardPeriod;
  recentRegistrations: RecentRegistration[];
  snapshot: DashboardSnapshot;
  teams: TeamOption[];
  timeseries: WeeklyTimeseriesRow[];
};

export type SuperadminOrgOverview = {
  org: {
    eodBaselineKg: number | null;
    id: string;
    name: string;
    publicShareEnabled: boolean;
    publicShareSlug: string | null;
    slug: string;
  };
  recentRegistrations: RecentRegistration[];
  snapshot: DashboardSnapshot;
};

export async function getTenantDashboardData(
  supabase: SupabaseServerClient,
  orgSlug: string,
  period: DashboardPeriod,
): Promise<TenantDashboardData | null> {
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) return null;

  const {
    interventions,
    categoryTimeseries,
    recentRegistrations,
    snapshot,
    teams,
    teamMembershipIds,
    timeseries,
  } = await loadOrgRows(supabase, context.org.id, period, context.userId);

  return {
    context,
    interventions,
    categoryTimeseries,
    period,
    recentRegistrations,
    snapshot,
    teams:
      context.role === "admin" ? teams : teams.filter((team) => teamMembershipIds.has(team.id)),
    timeseries,
  };
}

export async function getSuperadminOrgOverview(
  supabase: SupabaseServerClient,
  orgId: string,
): Promise<SuperadminOrgOverview | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, public_share_enabled, public_share_slug, eod_baseline_kg")
    .eq("id", orgId)
    .maybeSingle();
  if (!org) return null;

  const { recentRegistrations, snapshot } = await loadOrgRows(supabase, org.id);

  return {
    org: {
      eodBaselineKg: org.eod_baseline_kg,
      id: org.id,
      name: org.name,
      publicShareEnabled: org.public_share_enabled,
      publicShareSlug: org.public_share_slug,
      slug: org.slug,
    },
    recentRegistrations,
    snapshot,
  };
}

async function loadOrgRows(
  supabase: SupabaseServerClient,
  orgId: string,
  period: DashboardPeriod = "all",
  userId?: string,
) {
  const [
    { data: org },
    { data: locations },
    { data: teams },
    { data: teamMemberships },
    { data: categories },
    { data: interventions },
    { data: orgRegistrations },
    { data: recentRegistrations },
  ] = await Promise.all([
    supabase.from("organizations").select("eod_baseline_kg").eq("id", orgId).maybeSingle(),
    supabase.from("locations").select("id, name").eq("org_id", orgId).eq("is_archived", false),
    supabase
      .from("teams")
      .select("id, name, location_id")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    userId
      ? supabase
          .from("team_memberships")
          .select("team_id")
          .eq("org_id", orgId)
          .eq("user_id", userId)
      : Promise.resolve({ data: [] as { team_id: string }[] }),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    supabase
      .from("interventions")
      .select("id, name, unit, co2_factor_kg, category_id")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    supabase
      .from("registrations")
      .select("team_id, intervention_id, user_id, co2_kg_cached, happened_on")
      .eq("org_id", orgId),
    buildRecentRegistrationsQuery(supabase, orgId, userId),
  ]);

  const locationMap = new Map((locations ?? []).map((location) => [location.id, location.name]));
  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));
  const teamRows = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    locationName: locationMap.get(team.location_id) ?? "Onbekende locatie",
  }));
  const interventionRows = (interventions ?? []).map((intervention) => ({
    id: intervention.id,
    name: intervention.name,
    unit: intervention.unit,
    factorKg: intervention.co2_factor_kg,
    categoryName: categoryMap.get(intervention.category_id)?.name ?? "Onbekende categorie",
    categoryId: intervention.category_id,
  }));
  const interventionMap = new Map(
    interventionRows.map((intervention) => [intervention.id, intervention]),
  );
  const timeseriesRegistrations =
    orgRegistrations?.map((registration) => ({
      teamId: registration.team_id,
      interventionId: registration.intervention_id,
      userId: registration.user_id,
      co2KgCached: registration.co2_kg_cached,
      happenedOn: registration.happened_on,
      categoryId: interventionMap.get(registration.intervention_id)?.categoryId,
    })) ?? [];
  const filteredRegistrations = timeseriesRegistrations.filter(
    (registration) => registration.categoryId,
  );
  const snapshotRegistrations = filterRegistrationsByPeriod(timeseriesRegistrations, { period });
  const snapshot = buildDashboardSnapshot({
    baselineKg: org?.eod_baseline_kg ?? null,
    categories: categories ?? [],
    interventions: interventionRows,
    registrations: snapshotRegistrations.map((registration) => ({
      teamId: registration.teamId,
      interventionId: registration.interventionId,
      userId: registration.userId,
      co2KgCached: registration.co2KgCached,
    })),
    teams: teamRows,
  });
  const teamMap = new Map(teamRows.map((team) => [team.id, team]));
  const chartRegistrations = filteredRegistrations.map((registration) => ({
    categoryId: registration.categoryId ?? "",
    co2KgCached: registration.co2KgCached,
    happenedOn: registration.happenedOn,
    quantity: 1,
  }));
  const timeseries = buildWeeklyTimeseries(timeseriesRegistrations, { period });
  const categoryTimeseries = buildWeeklyCategoryTimeseries(chartRegistrations, categories ?? [], {
    period,
  });

  return {
    categoryTimeseries,
    interventions: interventionRows,
    recentRegistrations:
      recentRegistrations?.map((registration) => ({
        id: registration.id,
        quantity: registration.quantity,
        happenedOn: registration.happened_on,
        note: registration.note,
        co2KgCached: registration.co2_kg_cached,
        teamLabel: teamMap.get(registration.team_id)?.name ?? "Onbekend team",
        interventionLabel:
          interventionMap.get(registration.intervention_id)?.name ?? "Onbekende interventie",
      })) ?? [],
    snapshot,
    teams: teamRows,
    teamMembershipIds: new Set((teamMemberships ?? []).map((membership) => membership.team_id)),
    timeseries,
  };
}

function buildRecentRegistrationsQuery(
  supabase: SupabaseServerClient,
  orgId: string,
  userId?: string,
) {
  const query = supabase
    .from("registrations")
    .select("id, team_id, intervention_id, quantity, happened_on, note, co2_kg_cached")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(8);

  return userId ? query.eq("user_id", userId) : query;
}
