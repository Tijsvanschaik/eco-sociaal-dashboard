import { getOrgContextBySlug } from "@/lib/organizations";
import {
  type RegistrationListScope,
  canEditRegistration,
  deriveRegistrationListYears,
  parseRegistrationListYear,
  parseRegistrationScopeFilter,
  parseRegistrationTeamFilter,
  resolveRegistrationListYear,
} from "@/lib/registrations/list-filters";
import type { createClient } from "@/lib/supabase/server";
import type { TeamOption } from "@/lib/tenant-dashboard-data";
import { getEmailMap } from "@/lib/user-emails";

const REGISTRATION_LIST_LIMIT = 200;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type RegistrationListRow = {
  authorEmail: string | null;
  canEdit: boolean;
  categoryColor: string | null;
  co2KgCached: number;
  ecoUnit: string | null;
  happenedOn: string;
  id: string;
  interventionName: string;
  quantity: number;
  socialQuantity: number;
  socialScoreCached: number;
  socialUnit: string | null;
  teamId: string;
  teamName: string;
  userId: string;
};

export type TenantRegistrationsListData = {
  context: NonNullable<Awaited<ReturnType<typeof getOrgContextBySlug>>>;
  rows: RegistrationListRow[];
  scope: RegistrationListScope;
  selectedTeamId: string | null;
  teams: TeamOption[];
  /** Calendar years that have at least one registration for the current scope/team filter. */
  years: number[];
  year: number;
};

export async function getTenantRegistrationsListData(
  supabase: SupabaseServerClient,
  orgSlug: string,
  searchParams: {
    scope?: string | string[];
    team?: string | string[];
    year?: string | string[];
  },
): Promise<TenantRegistrationsListData | null> {
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) return null;

  const requestedYear = parseRegistrationListYear(searchParams.year);
  const selectedTeamId = parseRegistrationTeamFilter(searchParams.team);
  const scope = parseRegistrationScopeFilter(searchParams.scope, context.role);
  const showOnlyMine = scope === "mine";

  const [{ data: teams }, { data: categories }, { data: interventions }, availableYears] =
    await Promise.all([
    supabase
      .from("teams")
      .select("id, name")
      .eq("org_id", context.org.id)
      .eq("is_archived", false)
      .order("name"),
    supabase
      .from("categories")
      .select("id, color")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    supabase
      .from("interventions")
      .select("id, name, eco_unit, social_unit, category_id")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    getRegistrationListYears(supabase, {
      orgId: context.org.id,
      scope,
      selectedTeamId,
      userId: context.userId,
    }),
  ]);

  const years = availableYears;
  const year = resolveRegistrationListYear(requestedYear, years);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));
  const interventionMap = new Map(
    (interventions ?? []).map((intervention) => {
      const category = categoryMap.get(intervention.category_id);
      return [
        intervention.id,
        {
          name: intervention.name,
          ecoUnit: intervention.eco_unit,
          socialUnit: intervention.social_unit,
          categoryColor: category?.color ?? null,
        },
      ];
    }),
  );
  const teamMap = new Map((teams ?? []).map((team) => [team.id, team.name]));

  let query = supabase
    .from("registrations")
    .select(
      "id, user_id, team_id, intervention_id, quantity, social_quantity, happened_on, co2_kg_cached, social_score_cached",
    )
    .eq("org_id", context.org.id)
    .gte("happened_on", yearStart)
    .lte("happened_on", yearEnd)
    .order("happened_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(REGISTRATION_LIST_LIMIT);

  if (showOnlyMine) {
    query = query.eq("user_id", context.userId);
  }
  if (selectedTeamId) {
    query = query.eq("team_id", selectedTeamId);
  }

  const { data: registrationRows } = await query;

  const showAuthorColumn = scope === "all";
  const userIds = Array.from(new Set((registrationRows ?? []).map((row) => row.user_id)));
  const emailMap = showAuthorColumn ? await getEmailMap(userIds) : new Map<string, string>();

  const rows: RegistrationListRow[] =
    registrationRows?.map((row) => {
      const intervention = interventionMap.get(row.intervention_id);
      return {
        id: row.id,
        userId: row.user_id,
        authorEmail: showAuthorColumn ? (emailMap.get(row.user_id) ?? null) : null,
        canEdit: canEditRegistration(context.role, context.userId, row.user_id),
        teamId: row.team_id,
        teamName: teamMap.get(row.team_id) ?? "Onbekend team",
        interventionName: intervention?.name ?? "Onbekende activiteit",
        categoryColor: intervention?.categoryColor ?? null,
        quantity: row.quantity,
        socialQuantity: Number(row.social_quantity ?? 0),
        ecoUnit: intervention?.ecoUnit ?? null,
        socialUnit: intervention?.socialUnit ?? null,
        co2KgCached: row.co2_kg_cached,
        socialScoreCached: Number(row.social_score_cached ?? 0),
        happenedOn: row.happened_on,
      };
    }) ?? [];

  return {
    context,
    rows,
    scope,
    selectedTeamId,
    teams: teams ?? [],
    years,
    year,
  };
}

async function getRegistrationListYears(
  supabase: SupabaseServerClient,
  {
    orgId,
    scope,
    selectedTeamId,
    userId,
  }: {
    orgId: string;
    scope: RegistrationListScope;
    selectedTeamId: string | null;
    userId: string;
  },
): Promise<number[]> {
  let query = supabase.from("registrations").select("happened_on").eq("org_id", orgId);

  if (scope === "mine") {
    query = query.eq("user_id", userId);
  }
  if (selectedTeamId) {
    query = query.eq("team_id", selectedTeamId);
  }

  const { data } = await query;
  return deriveRegistrationListYears((data ?? []).map((row) => row.happened_on));
}
