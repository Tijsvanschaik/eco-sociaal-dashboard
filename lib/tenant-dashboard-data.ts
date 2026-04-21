import type { DashboardSnapshot } from "@/lib/dashboard";
import { buildDashboardSnapshot } from "@/lib/dashboard";
import { getOrgContextBySlug } from "@/lib/organizations";
import { REGISTRATIONS_BUCKET } from "@/lib/registrations/photo-upload";
import type { createClient } from "@/lib/supabase/server";
import {
  type DashboardPeriod,
  type WeeklyCategoryTimeseriesRow,
  type WeeklyTimeseriesRow,
  buildWeeklyCategoryTimeseries,
  buildWeeklyTimeseries,
  filterRegistrationsByPeriod,
} from "@/lib/timeseries";

/** Hoe lang een signed URL geldig is. 1 uur dekt een gebruikssessie ruim. */
const PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type TeamOption = {
  id: string;
  name: string;
};

export type InterventionOption = {
  categoryColor: string | null;
  categoryId: string;
  categoryName: string;
  factorKg: number;
  id: string;
  name: string;
  unit: string;
};

export type RecentRegistration = {
  categoryColor: string | null;
  categoryName: string | null;
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  photoUrl: string | null;
  quantity: number;
  teamLabel: string;
  unit: string | null;
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
    { data: teams },
    { data: teamMemberships },
    { data: categories },
    { data: interventions },
    { data: orgRegistrations },
    { data: recentRegistrations },
  ] = await Promise.all([
    supabase.from("organizations").select("eod_baseline_kg").eq("id", orgId).maybeSingle(),
    supabase.from("teams").select("id, name").eq("org_id", orgId).eq("is_archived", false),
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
    buildRecentRegistrationsQuery(supabase, orgId),
  ]);

  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));
  const teamRows = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
  }));
  const interventionRows = (interventions ?? []).map((intervention) => {
    const category = categoryMap.get(intervention.category_id);
    return {
      id: intervention.id,
      name: intervention.name,
      unit: intervention.unit,
      factorKg: intervention.co2_factor_kg,
      categoryName: category?.name ?? "Onbekende categorie",
      categoryColor: category?.color ?? null,
      categoryId: intervention.category_id,
    };
  });
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

  const photoUrlByPath = await resolvePhotoUrls(
    supabase,
    (recentRegistrations ?? [])
      .map((row) => row.photo_path)
      .filter((path): path is string => Boolean(path)),
  );

  return {
    categoryTimeseries,
    interventions: interventionRows,
    recentRegistrations:
      recentRegistrations?.map((registration) => {
        const team = teamMap.get(registration.team_id);
        const intervention = interventionMap.get(registration.intervention_id);
        const category = intervention ? categoryMap.get(intervention.categoryId) : null;
        return {
          id: registration.id,
          quantity: registration.quantity,
          happenedOn: registration.happened_on,
          note: registration.note,
          co2KgCached: registration.co2_kg_cached,
          teamLabel: team?.name ?? "Onbekend team",
          interventionLabel: intervention?.name ?? "Onbekende interventie",
          unit: intervention?.unit ?? null,
          categoryName: category?.name ?? null,
          categoryColor: category?.color ?? null,
          photoUrl: registration.photo_path
            ? (photoUrlByPath.get(registration.photo_path) ?? null)
            : null,
        };
      }) ?? [],
    snapshot,
    teams: teamRows,
    teamMembershipIds: new Set((teamMemberships ?? []).map((membership) => membership.team_id)),
    timeseries,
  };
}

function buildRecentRegistrationsQuery(supabase: SupabaseServerClient, orgId: string) {
  return supabase
    .from("registrations")
    .select("id, team_id, intervention_id, quantity, happened_on, note, photo_path, co2_kg_cached")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(12);
}

/**
 * Haalt in één batch signed URLs op voor de opgegeven storage-paden. Falen
 * we, dan gebruiken we gewoon geen foto — de UI valt netjes terug op de
 * placeholder.
 */
async function resolvePhotoUrls(
  supabase: SupabaseServerClient,
  paths: string[],
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase.storage
    .from(REGISTRATIONS_BUCKET)
    .createSignedUrls(unique, PHOTO_SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("[tenant-dashboard] createSignedUrls failed:", error.message);
    return new Map();
  }

  const byPath = new Map<string, string>();
  for (const entry of data ?? []) {
    if (entry?.path && entry.signedUrl) {
      byPath.set(entry.path, entry.signedUrl);
    }
  }
  return byPath;
}
