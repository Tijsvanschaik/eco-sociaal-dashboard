/**
 * Inserts curated demo registrations with fixed quantities (see target-demo-registrations-data).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { calculateCo2, calculateSocialScore } from "../lib/impact";
import type { Database } from "../supabase/types/supabase";
import {
  TARGET_DEMO_REGISTRATION_TEMPLATES,
  type TargetDemoRegistrationTemplate,
} from "./target-demo-registrations-data";

export type InsertTargetedOrgRegistrationsOptions = {
  templates?: TargetDemoRegistrationTemplate[];
  workersOnly?: boolean;
};

type TeamAssignmentSlot = {
  teamId: string;
  userId: string;
};

/** Spread registrations across teams; heavy CO₂ items first, then round-robin for even counts. */
export function assignTargetDemoRegistrationsToTeams(
  templates: TargetDemoRegistrationTemplate[],
  teams: Array<{ id: string }>,
  usersByTeamId: Map<string, string[]>,
  interventionByName: Map<
    string,
    { co2_factor_kg: number | string; social_score_factor: number | string | null }
  >,
): TeamAssignmentSlot[] {
  const eligibleTeams = teams.filter((team) => (usersByTeamId.get(team.id)?.length ?? 0) > 0);
  if (eligibleTeams.length === 0) {
    throw new Error("Geen teams met toegewezen leden voor target-demo registraties.");
  }

  const ranked = templates.map((template, index) => {
    const intervention = interventionByName.get(template.interventionName);
    if (!intervention) {
      throw new Error(`Interventie '${template.interventionName}' niet gevonden.`);
    }
    return {
      index,
      co2Kg: calculateCo2(template.quantity, Number(intervention.co2_factor_kg)),
    };
  });
  ranked.sort((a, b) => b.co2Kg - a.co2Kg);

  const teamUserCursor = new Map<string, number>();
  const slots: TeamAssignmentSlot[] = new Array(templates.length);

  ranked.forEach((item, rank) => {
    const team = eligibleTeams[rank % eligibleTeams.length] as { id: string };
    const userIds = usersByTeamId.get(team.id) as string[];
    const cursor = teamUserCursor.get(team.id) ?? 0;
    const userId = userIds[cursor % userIds.length] as string;
    teamUserCursor.set(team.id, cursor + 1);
    slots[item.index] = { teamId: team.id, userId };
  });

  return slots;
}

/** Ensure every team has at least one member so demo data can spread across teams. */
export async function ensureTeamsHaveMembers(
  admin: SupabaseClient<Database>,
  orgId: string,
  teams: Array<{ id: string }>,
  userIds: string[],
): Promise<void> {
  if (userIds.length === 0) {
    throw new Error("Geen gebruikers beschikbaar om teams toe te wijzen.");
  }

  const rows = teams.map((team, index) => ({
    org_id: orgId,
    team_id: team.id,
    user_id: userIds[index % userIds.length] as string,
  }));

  const { error } = await admin
    .from("team_memberships")
    .upsert(rows, { onConflict: "team_id,user_id" });
  if (error) throw error;
}

export async function insertTargetedOrgRegistrations(
  admin: SupabaseClient<Database>,
  orgId: string,
  options?: InsertTargetedOrgRegistrationsOptions,
): Promise<{ inserted: number; totalCo2Kg: number; totalSocialScore: number }> {
  const templates = options?.templates ?? TARGET_DEMO_REGISTRATION_TEMPLATES;

  const [teamsRes, interventionsRes, tmListRes, memListRes] = await Promise.all([
    admin
      .from("teams")
      .select("id, name")
      .eq("org_id", orgId)
      .eq("is_archived", false)
      .order("name"),
    admin
      .from("interventions")
      .select("id, name, co2_factor_kg, social_score_factor")
      .eq("org_id", orgId)
      .eq("is_archived", false),
    admin.from("team_memberships").select("user_id, team_id").eq("org_id", orgId),
    admin.from("memberships").select("user_id, role").eq("org_id", orgId),
  ]);

  if (teamsRes.error) throw teamsRes.error;
  if (interventionsRes.error) throw interventionsRes.error;
  if (tmListRes.error) throw tmListRes.error;
  if (memListRes.error) throw memListRes.error;

  const teams = teamsRes.data ?? [];
  const interventions = interventionsRes.data ?? [];
  if (teams.length === 0 || interventions.length === 0) {
    throw new Error("Geen teams of interventies voor deze organisatie.");
  }

  const interventionByName = new Map(interventions.map((i) => [i.name, i]));

  let roster = memListRes.data ?? [];
  if (options?.workersOnly) {
    roster = roster.filter((m) => m.role === "worker");
  }
  if (roster.length === 0) {
    throw new Error(
      options?.workersOnly
        ? "Geen worker-memberships in deze organisatie."
        : "Geen memberships in deze organisatie.",
    );
  }

  const memberIds = new Set(roster.map((m) => m.user_id));
  let assignments = (tmListRes.data ?? []).filter((row) => memberIds.has(row.user_id));

  const rosterUserIds = roster.map((m) => m.user_id);
  await ensureTeamsHaveMembers(admin, orgId, teams, rosterUserIds);

  const tmRefresh = await admin
    .from("team_memberships")
    .select("user_id, team_id")
    .eq("org_id", orgId);
  if (tmRefresh.error) throw tmRefresh.error;
  assignments = (tmRefresh.data ?? []).filter((row) => memberIds.has(row.user_id));

  if (assignments.length === 0) {
    throw new Error(
      "Geen team_memberships voor gekozen leden. Wijs gebruikers aan teams toe in Beheer.",
    );
  }

  const usersByTeamId = new Map<string, string[]>();
  for (const row of assignments) {
    const list = usersByTeamId.get(row.team_id) ?? [];
    list.push(row.user_id);
    usersByTeamId.set(row.team_id, list);
  }

  const teamSlots = assignTargetDemoRegistrationsToTeams(
    templates,
    teams,
    usersByTeamId,
    interventionByName,
  );

  let totalCo2Kg = 0;
  let totalSocialScore = 0;

  const rows = templates.map((template, index) => {
    const intervention = interventionByName.get(template.interventionName);
    if (!intervention) {
      throw new Error(
        `Interventie '${template.interventionName}' niet gevonden voor org ${orgId}. Draai 9000_seed.sql.`,
      );
    }

    const co2KgCached = calculateCo2(template.quantity, Number(intervention.co2_factor_kg));
    const socialScoreCached = calculateSocialScore(
      template.socialQuantity,
      Number(intervention.social_score_factor ?? 0),
    );
    totalCo2Kg += co2KgCached;
    totalSocialScore += socialScoreCached;

    const slot = teamSlots[index] as TeamAssignmentSlot;

    return {
      org_id: orgId,
      team_id: slot.teamId,
      user_id: slot.userId,
      intervention_id: intervention.id,
      quantity: template.quantity,
      social_quantity: template.socialQuantity,
      happened_on: template.happenedOn,
      note: template.note ?? null,
      co2_kg_cached: co2KgCached,
      social_score_cached: socialScoreCached,
    };
  });

  const { error } = await admin.from("registrations").insert(rows);
  if (error) throw error;

  return {
    inserted: rows.length,
    totalCo2Kg: Math.round(totalCo2Kg * 1000) / 1000,
    totalSocialScore: Math.round(totalSocialScore * 1000) / 1000,
  };
}
