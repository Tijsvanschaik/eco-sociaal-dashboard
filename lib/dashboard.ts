import { eodDaysGained, roundToThousandths } from "@/lib/impact";

type Team = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  color: string;
};

type Intervention = {
  id: string;
  name: string;
  categoryId: string;
};

type Registration = {
  co2KgCached: number;
  interventionId: string;
  teamId: string;
  userId: string;
};

export type BreakdownRow = {
  id: string;
  name: string;
  color?: string;
  co2SavedKg: number;
  /** Zelfde EOD-logica als teams: besparing t.o.v. org-baseline. */
  eodDays: number;
  registrationCount: number;
};

export type TeamBreakdownSegment = {
  id: string;
  interventionId: string;
  interventionName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  co2SavedKg: number;
  registrationCount: number;
};

export type TeamBreakdownRow = {
  id: string;
  name: string;
  co2SavedKg: number;
  // EOD-dagen die dit team alleen zou bijdragen t.o.v. de org-baseline.
  // 0 wanneer baseline ontbreekt of het team nog niets bespaard heeft.
  eodDays: number;
  registrationCount: number;
  segments: TeamBreakdownSegment[];
};

export type DashboardSnapshot = {
  totalCo2Kg: number;
  registrationCount: number;
  activeUserCount: number;
  eodDays: number;
  teamBreakdown: TeamBreakdownRow[];
  categoryBreakdown: BreakdownRow[];
};

export function buildDashboardSnapshot({
  baselineKg,
  categories,
  interventions,
  registrations,
  teams,
}: {
  baselineKg: number | null;
  categories: Category[];
  interventions: Intervention[];
  registrations: Registration[];
  teams: Team[];
}): DashboardSnapshot {
  const interventionMap = new Map(interventions.map((item) => [item.id, item]));
  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      { ...category, co2SavedKg: 0, registrationCount: 0 },
    ]),
  );
  // Per team: totaal + segments per interventie (met kleur van bijbehorende
  // categorie) zodat bars per team gestapeld kunnen worden op interventieniveau.
  const teamMap = new Map(
    teams.map((team) => [
      team.id,
      {
        ...team,
        co2SavedKg: 0,
        registrationCount: 0,
        segments: new Map<string, TeamBreakdownSegment>(),
      },
    ]),
  );
  const activeUsers = new Set<string>();

  let totalCo2Kg = 0;

  for (const registration of registrations) {
    totalCo2Kg += registration.co2KgCached;
    activeUsers.add(registration.userId);

    const intervention = interventionMap.get(registration.interventionId);
    const category = intervention ? categoryMap.get(intervention.categoryId) : null;
    if (category) {
      category.co2SavedKg += registration.co2KgCached;
      category.registrationCount += 1;
    }

    const team = teamMap.get(registration.teamId);
    if (team) {
      team.co2SavedKg += registration.co2KgCached;
      team.registrationCount += 1;

      if (intervention && category) {
        const existing = team.segments.get(intervention.id);
        if (existing) {
          existing.co2SavedKg += registration.co2KgCached;
          existing.registrationCount += 1;
        } else {
          team.segments.set(intervention.id, {
            id: `${team.id}:${intervention.id}`,
            interventionId: intervention.id,
            interventionName: intervention.name,
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            co2SavedKg: registration.co2KgCached,
            registrationCount: 1,
          });
        }
      }
    }
  }

  const sortByImpact = <T extends { co2SavedKg: number; name: string }>(rows: T[]) =>
    rows.sort(
      (left, right) =>
        right.co2SavedKg - left.co2SavedKg || left.name.localeCompare(right.name, "nl"),
    );

  return {
    totalCo2Kg: roundToThousandths(totalCo2Kg),
    registrationCount: registrations.length,
    activeUserCount: activeUsers.size,
    eodDays: eodDaysGained(totalCo2Kg, baselineKg ?? 0),
    teamBreakdown: sortByImpact(Array.from(teamMap.values())).map((team) => ({
      id: team.id,
      name: team.name,
      co2SavedKg: roundToThousandths(team.co2SavedKg),
      eodDays: eodDaysGained(team.co2SavedKg, baselineKg ?? 0),
      registrationCount: team.registrationCount,
      segments: Array.from(team.segments.values())
        .sort(
          (left, right) =>
            right.co2SavedKg - left.co2SavedKg ||
            left.interventionName.localeCompare(right.interventionName, "nl"),
        )
        .map((segment) => ({
          ...segment,
          co2SavedKg: roundToThousandths(segment.co2SavedKg),
        })),
    })),
    categoryBreakdown: sortByImpact(Array.from(categoryMap.values())).map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      co2SavedKg: roundToThousandths(category.co2SavedKg),
      eodDays: eodDaysGained(category.co2SavedKg, baselineKg ?? 0),
      registrationCount: category.registrationCount,
    })),
  };
}
