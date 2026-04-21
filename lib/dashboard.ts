import { eodDaysGained, roundToThousandths } from "@/lib/impact";

type Team = {
  id: string;
  name: string;
  locationName: string;
};

type Category = {
  id: string;
  name: string;
  color: string;
};

type Intervention = {
  id: string;
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
  secondary?: string;
  color?: string;
  co2SavedKg: number;
  registrationCount: number;
};

export type DashboardSnapshot = {
  totalCo2Kg: number;
  registrationCount: number;
  activeUserCount: number;
  eodDays: number;
  teamBreakdown: BreakdownRow[];
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
  const teamMap = new Map(
    teams.map((team) => [team.id, { ...team, co2SavedKg: 0, registrationCount: 0 }]),
  );
  const interventionMap = new Map(interventions.map((item) => [item.id, item]));
  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      { ...category, co2SavedKg: 0, registrationCount: 0 },
    ]),
  );
  const activeUsers = new Set<string>();

  let totalCo2Kg = 0;

  for (const registration of registrations) {
    totalCo2Kg += registration.co2KgCached;
    activeUsers.add(registration.userId);

    const team = teamMap.get(registration.teamId);
    if (team) {
      team.co2SavedKg += registration.co2KgCached;
      team.registrationCount += 1;
    }

    const intervention = interventionMap.get(registration.interventionId);
    const category = intervention ? categoryMap.get(intervention.categoryId) : null;
    if (category) {
      category.co2SavedKg += registration.co2KgCached;
      category.registrationCount += 1;
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
      secondary: team.locationName,
      co2SavedKg: roundToThousandths(team.co2SavedKg),
      registrationCount: team.registrationCount,
    })),
    categoryBreakdown: sortByImpact(Array.from(categoryMap.values())).map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      co2SavedKg: roundToThousandths(category.co2SavedKg),
      registrationCount: category.registrationCount,
    })),
  };
}
