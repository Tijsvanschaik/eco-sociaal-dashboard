import type { DashboardSnapshot } from "@/lib/dashboard";
import { buildDashboardSnapshot } from "@/lib/dashboard";
import { getOrgContextBySlug } from "@/lib/organizations";
import {
  type DashboardFeedFilters,
  getDashboardFeedPeriodStart,
  parseDashboardFeedFilters,
} from "@/lib/registrations/dashboard-filters";
import { canEditRegistration } from "@/lib/registrations/list-filters";
import { REGISTRATIONS_BUCKET } from "@/lib/registrations/photo-upload";
import type { createClient } from "@/lib/supabase/server";
import {
  type WeeklyCategoryTimeseriesRow,
  type WeeklyTimeseriesRow,
  buildWeeklyCategoryTimeseries,
  buildWeeklyTimeseries,
  filterRegistrationsByCalendarYear,
  filterRegistrationsByPeriod,
  getDashboardCalendarYear,
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
  ecoUnit: string;
  socialScoreFactor: number;
  socialUnit: string;
};

export type RecentRegistration = {
  canEdit: boolean;
  categoryColor: string | null;
  categoryId: string | null;
  categoryName: string | null;
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  photoUrl: string | null;
  ecoUnit: string | null;
  quantity: number;
  socialQuantity: number;
  socialScoreCached: number;
  socialUnit: string | null;
  teamId: string;
  teamLabel: string;
  userId: string;
};

export type TenantDashboardData = {
  context: NonNullable<Awaited<ReturnType<typeof getOrgContextBySlug>>>;
  feedFilters: DashboardFeedFilters;
  interventions: InterventionOption[];
  categoryTimeseries: WeeklyCategoryTimeseriesRow[];
  year: number;
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
  searchParams: {
    period?: string | string[];
    team?: string | string[];
  } = {},
): Promise<TenantDashboardData | null> {
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) return null;

  const year = getDashboardCalendarYear();
  const feedFilters = parseDashboardFeedFilters(searchParams);
  const {
    interventions,
    categoryTimeseries,
    recentRegistrations,
    snapshot,
    teams,
    teamMembershipIds,
    timeseries,
  } = await loadOrgRows(supabase, context.org.id, {
    feedFilters,
    role: context.role,
    userId: context.userId,
    year,
  });

  const visibleTeams =
    context.role === "admin" ? teams : teams.filter((team) => teamMembershipIds.has(team.id));
  const allowedTeamIds = new Set(visibleTeams.map((team) => team.id));
  const sanitizedTeamId =
    feedFilters.teamId && allowedTeamIds.has(feedFilters.teamId) ? feedFilters.teamId : null;

  return {
    context,
    feedFilters: {
      ...feedFilters,
      teamId: sanitizedTeamId,
    },
    interventions,
    categoryTimeseries,
    year,
    recentRegistrations,
    snapshot,
    teams: visibleTeams,
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
  options: {
    feedFilters?: DashboardFeedFilters;
    period?: "30d" | "90d" | "all";
    role?: "admin" | "worker";
    userId?: string;
    year?: number;
  } = {},
) {
  const { feedFilters, period = "all", role, userId, year } = options;
  const yearStart = year !== undefined ? `${year}-01-01` : null;
  const yearEnd = year !== undefined ? `${year}-12-31` : null;

  let orgRegistrationsQuery = supabase
    .from("registrations")
    .select("team_id, intervention_id, user_id, co2_kg_cached, social_score_cached, happened_on")
    .eq("org_id", orgId);
  if (yearStart && yearEnd) {
    orgRegistrationsQuery = orgRegistrationsQuery
      .gte("happened_on", yearStart)
      .lte("happened_on", yearEnd);
  }

  const [
    { data: org },
    { data: teams },
    { data: teamMemberships },
    { data: categories },
    { data: interventions },
    { data: orgRegistrations },
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
      .select("id, name, eco_unit, social_unit, co2_factor_kg, social_score_factor, category_id")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    orgRegistrationsQuery,
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
      ecoUnit: intervention.eco_unit,
      socialUnit: intervention.social_unit,
      factorKg: intervention.co2_factor_kg,
      socialScoreFactor: Number(intervention.social_score_factor ?? 0),
      categoryName: category?.name ?? "Onbekende categorie",
      categoryColor: category?.color ?? null,
      categoryId: intervention.category_id,
    };
  });
  const { data: recentRegistrations } = await buildRecentRegistrationsQuery(supabase, orgId, {
    feedFilters,
    year,
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
      socialScoreCached: Number(registration.social_score_cached ?? 0),
      happenedOn: registration.happened_on,
      categoryId: interventionMap.get(registration.intervention_id)?.categoryId,
    })) ?? [];
  const filteredRegistrations = timeseriesRegistrations.filter(
    (registration) => registration.categoryId,
  );
  const snapshotRegistrations =
    year !== undefined
      ? filterRegistrationsByCalendarYear(timeseriesRegistrations, year)
      : filterRegistrationsByPeriod(timeseriesRegistrations, { period });
  const snapshot = buildDashboardSnapshot({
    baselineKg: org?.eod_baseline_kg ?? null,
    categories: categories ?? [],
    interventions: interventionRows,
    registrations: snapshotRegistrations.map((registration) => ({
      teamId: registration.teamId,
      interventionId: registration.interventionId,
      userId: registration.userId,
      co2KgCached: registration.co2KgCached,
      socialScoreCached: registration.socialScoreCached,
    })),
    teams: teamRows,
  });
  const teamMap = new Map(teamRows.map((team) => [team.id, team]));
  const chartRegistrations = filteredRegistrations.map((registration) => ({
    categoryId: registration.categoryId ?? "",
    co2KgCached: registration.co2KgCached,
    happenedOn: registration.happenedOn,
    quantity: 1,
    socialScoreCached: registration.socialScoreCached,
  }));
  const timeseries =
    year !== undefined
      ? buildWeeklyTimeseries(timeseriesRegistrations, { year })
      : buildWeeklyTimeseries(timeseriesRegistrations, { period });
  const categoryTimeseries =
    year !== undefined
      ? buildWeeklyCategoryTimeseries(chartRegistrations, categories ?? [], { year })
      : buildWeeklyCategoryTimeseries(chartRegistrations, categories ?? [], { period });

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
          userId: registration.user_id,
          teamId: registration.team_id,
          categoryId: intervention?.categoryId ?? null,
          canEdit: role && userId ? canEditRegistration(role, userId, registration.user_id) : false,
          quantity: registration.quantity,
          socialQuantity: Number(registration.social_quantity ?? 0),
          happenedOn: registration.happened_on,
          note: registration.note,
          co2KgCached: registration.co2_kg_cached,
          socialScoreCached: Number(registration.social_score_cached ?? 0),
          teamLabel: team?.name ?? "Onbekend team",
          interventionLabel: intervention?.name ?? "Onbekende activiteit",
          ecoUnit: intervention?.ecoUnit ?? null,
          socialUnit: intervention?.socialUnit ?? null,
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

function buildRecentRegistrationsQuery(
  supabase: SupabaseServerClient,
  orgId: string,
  options: {
    feedFilters?: DashboardFeedFilters;
    year?: number;
  } = {},
) {
  const { feedFilters, year } = options;

  let query = supabase
    .from("registrations")
    .select(
      "id, user_id, team_id, intervention_id, quantity, social_quantity, happened_on, note, photo_path, co2_kg_cached, social_score_cached",
    )
    .eq("org_id", orgId);

  if (year !== undefined) {
    query = query.gte("happened_on", `${year}-01-01`).lte("happened_on", `${year}-12-31`);
  }

  if (feedFilters?.teamId) {
    query = query.eq("team_id", feedFilters.teamId);
  }

  const periodStart = feedFilters?.period ? getDashboardFeedPeriodStart(feedFilters.period) : null;
  if (periodStart) {
    query = query.gte("happened_on", periodStart);
  }

  return query.order("created_at", { ascending: false }).limit(24);
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
