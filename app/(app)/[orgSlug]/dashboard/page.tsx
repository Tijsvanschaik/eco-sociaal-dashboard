import { InternalDashboard } from "@/components/internal-dashboard";
import { buildDashboardSnapshot } from "@/lib/dashboard";
import { getOrgContextBySlug } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;

export default async function DashboardPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context) notFound();

  const [
    { data: locations },
    { data: teams },
    { data: teamMemberships },
    { data: categories },
    { data: interventions },
    { data: orgRegistrations },
    { data: recentRegistrations },
  ] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    supabase
      .from("teams")
      .select("id, name, location_id")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
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
      .select("id, name, unit, co2_factor_kg, category_id")
      .eq("org_id", context.org.id)
      .eq("is_archived", false),
    supabase
      .from("registrations")
      .select("team_id, intervention_id, user_id, co2_kg_cached")
      .eq("org_id", context.org.id),
    supabase
      .from("registrations")
      .select("id, team_id, intervention_id, quantity, happened_on, note, co2_kg_cached")
      .eq("org_id", context.org.id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(8),
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
    categoryId: intervention.category_id,
    categoryName: categoryMap.get(intervention.category_id)?.name ?? "Onbekende categorie",
  }));
  const teamMembershipIds = new Set(
    (teamMemberships ?? []).map((membership) => membership.team_id),
  );
  const formTeams =
    context.role === "admin" ? teamRows : teamRows.filter((team) => teamMembershipIds.has(team.id));
  const snapshot = buildDashboardSnapshot({
    baselineKg: context.org.eodBaselineKg,
    categories: categories ?? [],
    interventions: interventionRows,
    registrations:
      orgRegistrations?.map((registration) => ({
        teamId: registration.team_id,
        interventionId: registration.intervention_id,
        userId: registration.user_id,
        co2KgCached: registration.co2_kg_cached,
      })) ?? [],
    teams: teamRows,
  });
  const interventionMap = new Map(
    interventionRows.map((intervention) => [intervention.id, intervention]),
  );
  const teamMap = new Map(teamRows.map((team) => [team.id, team]));

  return (
    <InternalDashboard
      interventions={interventionRows}
      orgName={context.org.name}
      orgSlug={context.org.slug}
      recentRegistrations={
        recentRegistrations?.map((registration) => ({
          id: registration.id,
          quantity: registration.quantity,
          happenedOn: registration.happened_on,
          note: registration.note,
          co2KgCached: registration.co2_kg_cached,
          teamLabel: teamMap.get(registration.team_id)?.name ?? "Onbekend team",
          interventionLabel:
            interventionMap.get(registration.intervention_id)?.name ?? "Onbekende interventie",
        })) ?? []
      }
      roleLabel={context.role === "admin" ? "admin" : "medewerker"}
      snapshot={snapshot}
      teams={formTeams}
    />
  );
}
