import { getDashboardCalendarYear } from "@/lib/timeseries";

const LIST_YEAR_MIN = 2020;
const LIST_YEAR_MAX = 2100;

export type RegistrationListScope = "all" | "mine";

export function parseRegistrationListYear(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return getDashboardCalendarYear();
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < LIST_YEAR_MIN || parsed > LIST_YEAR_MAX) {
    return getDashboardCalendarYear();
  }
  return parsed;
}

export function parseRegistrationTeamFilter(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || raw === "all") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw) ? raw : null;
}

export function parseRegistrationScopeFilter(
  value: string | string[] | undefined,
  role: "admin" | "worker",
): RegistrationListScope {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "mine") return "mine";
  if (raw === "all") return "all";
  return role === "admin" ? "all" : "mine";
}

export function canEditRegistration(
  role: "admin" | "worker",
  currentUserId: string,
  registrationUserId: string,
): boolean {
  if (role === "admin") return true;
  return currentUserId === registrationUserId;
}

/** Unique calendar years from `happened_on` (YYYY-MM-DD), newest first. */
export function deriveRegistrationListYears(happenedOnDates: string[]): number[] {
  const years = new Set<number>();
  for (const date of happenedOnDates) {
    const year = Number.parseInt(date.slice(0, 4), 10);
    if (Number.isFinite(year) && year >= LIST_YEAR_MIN && year <= LIST_YEAR_MAX) {
      years.add(year);
    }
  }
  return Array.from(years).sort((a, b) => b - a);
}

/** Pick a list year that has data, or keep the request when nothing exists yet. */
export function resolveRegistrationListYear(
  requestedYear: number,
  availableYears: number[],
): number {
  if (availableYears.includes(requestedYear)) return requestedYear;
  return availableYears[0] ?? requestedYear;
}
