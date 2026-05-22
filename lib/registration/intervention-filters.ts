export type FilterableIntervention = {
  categoryId?: string;
  categoryName: string;
  id: string;
  name: string;
};

export type InterventionFilterOptions = {
  /** Keep the selected intervention visible even when filters would hide it. */
  alwaysIncludeId?: string | null;
  categoryId?: string | null;
  searchQuery?: string;
};

export function filterInterventions<T extends FilterableIntervention>(
  interventions: T[],
  options: InterventionFilterOptions = {},
): T[] {
  const categoryId = options.categoryId ?? null;
  const query = options.searchQuery?.trim().toLowerCase() ?? "";
  const alwaysIncludeId = options.alwaysIncludeId ?? null;

  const filtered = interventions.filter((intervention) => {
    if (categoryId && intervention.categoryId !== categoryId) {
      return false;
    }
    if (query) {
      const haystack = `${intervention.name} ${intervention.categoryName}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  if (!alwaysIncludeId) {
    return filtered;
  }

  const selected = interventions.find((intervention) => intervention.id === alwaysIncludeId);
  if (!selected || filtered.some((intervention) => intervention.id === selected.id)) {
    return filtered;
  }

  return [selected, ...filtered];
}

export type CategoryFromIntervention = {
  color: string;
  id: string;
  name: string;
};

/** Derive unique categories from intervention rows (sorted by name). */
export function deriveCategoriesFromInterventions(
  interventions: Array<{
    categoryColor: string | null;
    categoryId?: string;
    categoryName: string;
  }>,
): CategoryFromIntervention[] {
  const map = new Map<string, CategoryFromIntervention>();

  for (const intervention of interventions) {
    if (!intervention.categoryId) continue;
    if (map.has(intervention.categoryId)) continue;
    map.set(intervention.categoryId, {
      id: intervention.categoryId,
      name: intervention.categoryName,
      color: intervention.categoryColor ?? "#af1e7b",
    });
  }

  return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name, "nl"));
}
