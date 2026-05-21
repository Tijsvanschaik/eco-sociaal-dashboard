import { roundToThousandths } from "@/lib/impact";

export type DashboardPeriod = "30d" | "90d" | "all";

type WeeklyRegistration = {
  co2KgCached: number;
  happenedOn: string;
  quantity?: number;
  socialScoreCached?: number;
};

export type WeeklyTimeseriesRow = {
  co2SavedKg: number;
  registrationCount: number;
  /** Eénheidloze sociale score (parallel aan co2KgCached voor de week). */
  socialScoreSaved: number;
  weekStart: string;
};

type Category = {
  color: string;
  id: string;
  name: string;
};

type CategoryRegistration = WeeklyRegistration & {
  categoryId: string;
};

export type WeeklyCategoryTimeseriesRow = {
  totalCo2SavedKg: number;
  totalSocialScoreSaved: number;
  weekStart: string;
} & Record<string, number | string>;

export function parseDashboardPeriod(value: string | undefined): DashboardPeriod {
  if (value === "30d" || value === "90d" || value === "all") return value;
  return "90d";
}

/** Kalenderjaar voor het interne dashboard (UTC). Rolt automatisch over op 1 januari. */
export function getDashboardCalendarYear(now: Date | string = new Date()): number {
  const date = typeof now === "string" ? new Date(`${now}T12:00:00Z`) : now;
  return date.getUTCFullYear();
}

export function isHappenedOnInCalendarYear(happenedOn: string, year: number): boolean {
  const date = new Date(`${happenedOn}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  return date.getUTCFullYear() === year;
}

export function filterRegistrationsByCalendarYear<T extends { happenedOn: string }>(
  registrations: T[],
  year: number,
): T[] {
  return registrations.filter((registration) =>
    isHappenedOnInCalendarYear(registration.happenedOn, year),
  );
}

export function buildWeeklyTimeseries(
  registrations: WeeklyRegistration[],
  {
    now = new Date(),
    period = "all",
    year,
  }: {
    now?: Date | string;
    period?: DashboardPeriod;
    year?: number;
  },
): WeeklyTimeseriesRow[] {
  if (registrations.length === 0) return [];

  const nowDate = typeof now === "string" ? new Date(`${now}T12:00:00Z`) : now;
  const minDate = year === undefined ? getMinDate(nowDate, period) : null;
  const rows = new Map<
    string,
    { co2SavedKg: number; registrationCount: number; socialScoreSaved: number }
  >();

  for (const registration of registrations) {
    const happenedOn = new Date(`${registration.happenedOn}T12:00:00Z`);
    if (Number.isNaN(happenedOn.getTime())) continue;
    if (year !== undefined && !isHappenedOnInCalendarYear(registration.happenedOn, year)) {
      continue;
    }
    if (minDate && happenedOn < minDate) continue;

    const social = Number(registration.socialScoreCached ?? 0);
    const weekStart = toIsoDate(startOfIsoWeek(happenedOn));
    const current = rows.get(weekStart) ?? {
      co2SavedKg: 0,
      registrationCount: 0,
      socialScoreSaved: 0,
    };

    current.co2SavedKg += registration.co2KgCached;
    current.socialScoreSaved += social;
    current.registrationCount += 1;

    rows.set(weekStart, current);
  }

  return Array.from(rows.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([weekStart, row]) => ({
      weekStart,
      co2SavedKg: roundToThousandths(row.co2SavedKg),
      socialScoreSaved: roundToThousandths(row.socialScoreSaved),
      registrationCount: row.registrationCount,
    }));
}

export function filterRegistrationsByPeriod<T extends { happenedOn: string }>(
  registrations: T[],
  {
    now = new Date(),
    period,
  }: {
    now?: Date | string;
    period: DashboardPeriod;
  },
): T[] {
  const nowDate = typeof now === "string" ? new Date(`${now}T12:00:00Z`) : now;
  const minDate = getMinDate(nowDate, period);
  if (!minDate) return registrations;

  return registrations.filter((registration) => {
    const happenedOn = new Date(`${registration.happenedOn}T12:00:00Z`);
    return !Number.isNaN(happenedOn.getTime()) && happenedOn >= minDate;
  });
}

export function buildWeeklyCategoryTimeseries(
  registrations: CategoryRegistration[],
  categories: Category[],
  {
    now = new Date(),
    period = "all",
    year,
  }: {
    now?: Date | string;
    period?: DashboardPeriod;
    year?: number;
  },
): WeeklyCategoryTimeseriesRow[] {
  if (registrations.length === 0 || categories.length === 0) return [];

  const nowDate = typeof now === "string" ? new Date(`${now}T12:00:00Z`) : now;
  const minDate = year === undefined ? getMinDate(nowDate, period) : null;
  const rows = new Map<string, WeeklyCategoryTimeseriesRow>();

  for (const registration of registrations) {
    const happenedOn = new Date(`${registration.happenedOn}T12:00:00Z`);
    if (Number.isNaN(happenedOn.getTime())) continue;
    if (year !== undefined && !isHappenedOnInCalendarYear(registration.happenedOn, year)) {
      continue;
    }
    if (minDate && happenedOn < minDate) continue;

    const social = Number(registration.socialScoreCached ?? 0);
    const weekStart = toIsoDate(startOfIsoWeek(happenedOn));
    const current =
      rows.get(weekStart) ??
      categories.reduce(
        (accumulator, category) => {
          accumulator[category.id] = 0;
          return accumulator;
        },
        {
          weekStart,
          totalCo2SavedKg: 0,
          totalSocialScoreSaved: 0,
        } as WeeklyCategoryTimeseriesRow,
      );

    current[registration.categoryId] = roundToThousandths(
      Number(current[registration.categoryId] ?? 0) + registration.co2KgCached,
    );
    current.totalCo2SavedKg = roundToThousandths(
      current.totalCo2SavedKg + registration.co2KgCached,
    );
    current.totalSocialScoreSaved = roundToThousandths(current.totalSocialScoreSaved + social);

    rows.set(weekStart, current);
  }

  return Array.from(rows.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, row]) => row);
}

function getMinDate(now: Date, period: DashboardPeriod): Date | null {
  if (period === "all") return null;

  const daysBack = period === "30d" ? 30 : 90;
  const minDate = new Date(now);
  minDate.setUTCDate(minDate.getUTCDate() - daysBack + 1);
  minDate.setUTCHours(0, 0, 0, 0);

  return minDate;
}

function startOfIsoWeek(value: Date): Date {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);

  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);

  return date;
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
