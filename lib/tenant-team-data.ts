import type { DashboardSnapshot } from "@/lib/dashboard";
import { buildDashboardSnapshot } from "@/lib/dashboard";
import { getOrgContextBySlug } from "@/lib/organizations";
import { canEditRegistration } from "@/lib/registrations/list-filters";
import { REGISTRATIONS_BUCKET } from "@/lib/registrations/photo-upload";
import type { createClient } from "@/lib/supabase/server";
import type { RecentRegistration } from "@/lib/tenant-dashboard-data";
import {
  type WeeklyCategoryTimeseriesRow,
  type WeeklyTimeseriesRow,
  buildWeeklyCategoryTimeseries,
  buildWeeklyTimeseries,
  filterRegistrationsByCalendarYear,
  getDashboardCalendarYear,
} from "@/lib/timeseries";

/** Hoe lang een signed URL geldig is. 1 uur dekt een gebruikssessie ruim. */
const PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60;
const RECENT_REGISTRATIONS_LIMIT = 12;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type RegistrationRow = {
  teamId: string;
  interventionId: string;
  userId: string;
  co2KgCached: number;
  socialScoreCached: number;
  happenedOn: string;
  categoryId?: string;
};

export type TenantTeamDetailData = {
  context: NonNullable<Awaited<ReturnType<typeof getOrgContextBySlug>>>;
  team: { id: string; name: string };
  year: number;
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
  categoryTimeseries: WeeklyCategoryTimeseriesRow[];
  recentRegistrations: RecentRegistration[];
};

export function filterRegistrationsByTeamId<T extends { teamId: string }>(
  registrations: T[],
  teamId: string,
): T[] {
  return registrations.filter((registration) => registration.teamId === teamId);
}

export async function getTenantTeamDetailData(
  supabase: SupabaseServerClient,
  orgSlug: string,
  teamId: string,
): Promise<TenantTeamDetailData | null> {
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) return null;

  const year = getDashboardCalendarYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const { data: teamRow } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", teamId)
    .eq("org_id", context.org.id)
    .eq("is_archived", false)
    .maybeSingle();

  if (!teamRow) return null;

  const team = { id: teamRow.id, name: teamRow.name };

  const [
    { data: org },
    { data: categories },
    { data: interventions },
    { data: orgRegistrations },
    { data: recentRegistrationRows },
  ] = await Promise.all([
    supabase.from("organizations").select("eod_baseline_kg").eq("id", context.org.id).maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, color")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    supabase
      .from("interventions")
      .select("id, name, eco_unit, social_unit, co2_factor_kg, social_score_factor, category_id")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    supabase
      .from("registrations")
      .select("team_id, intervention_id, user_id, co2_kg_cached, social_score_cached, happened_on")
      .eq("org_id", context.org.id)
      .gte("happened_on", yearStart)
      .lte("happened_on", yearEnd),
    supabase
      .from("registrations")
      .select(
        "id, user_id, team_id, intervention_id, quantity, social_quantity, happened_on, note, photo_path, co2_kg_cached, social_score_cached",
      )
      .eq("org_id", context.org.id)
      .eq("team_id", teamId)
      .gte("happened_on", yearStart)
      .lte("happened_on", yearEnd)
      .order("created_at", { ascending: false })
      .limit(RECENT_REGISTRATIONS_LIMIT),
  ]);

  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));
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
  const interventionMap = new Map(
    interventionRows.map((intervention) => [intervention.id, intervention]),
  );

  const allRegistrations: RegistrationRow[] =
    orgRegistrations?.map((registration) => ({
      teamId: registration.team_id,
      interventionId: registration.intervention_id,
      userId: registration.user_id,
      co2KgCached: registration.co2_kg_cached,
      socialScoreCached: Number(registration.social_score_cached ?? 0),
      happenedOn: registration.happened_on,
      categoryId: interventionMap.get(registration.intervention_id)?.categoryId,
    })) ?? [];

  const teamRegistrations = filterRegistrationsByTeamId(allRegistrations, teamId);
  const snapshotRegistrations = filterRegistrationsByCalendarYear(teamRegistrations, year).map(
    (registration) => ({
      teamId: registration.teamId,
      interventionId: registration.interventionId,
      userId: registration.userId,
      co2KgCached: registration.co2KgCached,
      socialScoreCached: registration.socialScoreCached,
    }),
  );

  const snapshot = buildDashboardSnapshot({
    baselineKg: org?.eod_baseline_kg ?? null,
    categories: categories ?? [],
    interventions: interventionRows,
    registrations: snapshotRegistrations,
    teams: [team],
  });

  const chartRegistrations = teamRegistrations
    .filter((registration) => registration.categoryId)
    .map((registration) => ({
      categoryId: registration.categoryId ?? "",
      co2KgCached: registration.co2KgCached,
      happenedOn: registration.happenedOn,
      quantity: 1,
      socialScoreCached: registration.socialScoreCached,
    }));

  const timeseries = buildWeeklyTimeseries(teamRegistrations, { year });
  const categoryTimeseries = buildWeeklyCategoryTimeseries(chartRegistrations, categories ?? [], {
    year,
  });

  const photoUrlByPath = await resolvePhotoUrls(
    supabase,
    (recentRegistrationRows ?? [])
      .map((row) => row.photo_path)
      .filter((path): path is string => Boolean(path)),
  );

  const recentRegistrations: RecentRegistration[] =
    recentRegistrationRows?.map((registration) => {
      const intervention = interventionMap.get(registration.intervention_id);
      const category = intervention ? categoryMap.get(intervention.categoryId) : null;
      return {
        id: registration.id,
        userId: registration.user_id,
        teamId: registration.team_id,
        categoryId: intervention?.categoryId ?? null,
        canEdit: canEditRegistration(context.role, context.userId, registration.user_id),
        quantity: registration.quantity,
        socialQuantity: Number(registration.social_quantity ?? 0),
        happenedOn: registration.happened_on,
        note: registration.note,
        co2KgCached: registration.co2_kg_cached,
        socialScoreCached: Number(registration.social_score_cached ?? 0),
        teamLabel: team.name,
        interventionLabel: intervention?.name ?? "Onbekende activiteit",
        ecoUnit: intervention?.ecoUnit ?? null,
        socialUnit: intervention?.socialUnit ?? null,
        categoryName: category?.name ?? null,
        categoryColor: category?.color ?? null,
        photoUrl: registration.photo_path
          ? (photoUrlByPath.get(registration.photo_path) ?? null)
          : null,
      };
    }) ?? [];

  return {
    context,
    team,
    year,
    snapshot,
    timeseries,
    categoryTimeseries,
    recentRegistrations,
  };
}

async function resolvePhotoUrls(
  supabase: SupabaseServerClient,
  paths: string[],
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter((path): path is string => Boolean(path))));
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase.storage
    .from(REGISTRATIONS_BUCKET)
    .createSignedUrls(unique, PHOTO_SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("[tenant-team] createSignedUrls failed:", error.message);
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
