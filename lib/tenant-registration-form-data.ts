import { getOrgContextBySlug } from "@/lib/organizations";
import type { createClient } from "@/lib/supabase/server";
import type { InterventionOption, TeamOption } from "@/lib/tenant-dashboard-data";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type TenantRegistrationFormData = {
  context: NonNullable<Awaited<ReturnType<typeof getOrgContextBySlug>>>;
  interventions: InterventionOption[];
  teams: TeamOption[];
};

export function filterTeamsForRegistration(
  teams: TeamOption[],
  teamMembershipIds: Set<string>,
  role: "admin" | "worker",
): TeamOption[] {
  if (role === "admin") return teams;
  return teams.filter((team) => teamMembershipIds.has(team.id));
}

/**
 * Lightweight loader for the registration form — teams + interventions only.
 * Avoids dashboard aggregations, timeseries, recent registrations and signed URLs.
 */
export async function getTenantRegistrationFormData(
  supabase: SupabaseServerClient,
  orgSlug: string,
): Promise<TenantRegistrationFormData | null> {
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) return null;

  const [
    { data: teams },
    { data: teamMemberships },
    { data: categories },
    { data: interventions },
  ] = await Promise.all([
    supabase.from("teams").select("id, name").eq("org_id", context.org.id).eq("is_archived", false),
    supabase
      .from("team_memberships")
      .select("team_id")
      .eq("org_id", context.org.id)
      .eq("user_id", context.userId),
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
  ]);

  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));
  const teamRows = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
  }));
  const teamMembershipIds = new Set(
    (teamMemberships ?? []).map((membership) => membership.team_id),
  );
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

  return {
    context,
    interventions: interventionRows,
    teams: filterTeamsForRegistration(teamRows, teamMembershipIds, context.role),
  };
}
