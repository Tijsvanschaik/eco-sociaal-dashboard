"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { InterventionCard } from "@/components/registration/intervention-card";
import { SectionLabel } from "@/components/registration/registration-section";
import { EmptyState } from "@/components/settings/form-fields";
import { sectionLabelClassName } from "@/components/settings/settings-styles";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { iconForCategory } from "@/lib/category-icons";
import {
  deriveCategoriesFromInterventions,
  filterInterventions,
} from "@/lib/registration/intervention-filters";
import type { InterventionOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

const categoryIconClassName =
  "inline-flex shrink-0 items-center justify-center rounded-sm text-white shadow-sm";

function categoryIconSizeClassName(size: "sm" | "md" = "md") {
  return size === "sm" ? "h-8 w-8" : "h-9 w-9";
}

type InterventionPickerProps = {
  interventions: InterventionOption[];
  onSelect: (interventionId: string) => void;
  selectedId: string;
};

export function InterventionPicker({
  interventions,
  onSelect,
  selectedId,
}: InterventionPickerProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCardRef = useRef<HTMLButtonElement | null>(null);

  const categories = useMemo(
    () => deriveCategoriesFromInterventions(interventions),
    [interventions],
  );

  const filteredInterventions = useMemo(
    () =>
      filterInterventions(interventions, {
        categoryId: categoryFilter,
        searchQuery,
        alwaysIncludeId: selectedId,
      }),
    [categoryFilter, interventions, searchQuery, selectedId],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scroll selected card when filters change
  useEffect(() => {
    if (!selectedId) return;
    selectedCardRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [categoryFilter, searchQuery, selectedId]);

  const hasActiveFilter = Boolean(categoryFilter || searchQuery.trim());

  return (
    <DashboardPanel
      contentClassName="space-y-5"
      description="Kies de activiteit die het best past bij wat je hebt gedaan."
      icon="eco"
      iconTone="primary"
      title="Kies je activiteit"
    >
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
        />
        <Input
          aria-label="Zoek activiteit"
          className="h-11 rounded-[1rem] border border-border/60 bg-card pl-11 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Zoek op activiteit of categorie…"
          type="search"
          value={searchQuery}
        />
      </div>

      {categories.length > 0 ? (
        <div className="space-y-2.5">
          <p className={sectionLabelClassName}>Filter op categorie</p>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryFilterButton
              active={categoryFilter === null}
              ariaLabel="Alle categorieën"
              icon="apps"
              onClick={() => setCategoryFilter(null)}
              title={`Alle (${interventions.length})`}
            />
            {categories.map((category) => {
              const count = interventions.filter(
                (intervention) => intervention.categoryId === category.id,
              ).length;

              return (
                <CategoryFilterButton
                  key={category.id}
                  active={categoryFilter === category.id}
                  ariaLabel={`Filter op ${category.name}`}
                  color={category.color}
                  icon={iconForCategory(category.name)}
                  onClick={() =>
                    setCategoryFilter((current) => (current === category.id ? null : category.id))
                  }
                  title={`${category.name} (${count})`}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {filteredInterventions.length === 0 ? (
        <EmptyState
          icon="filter_alt"
          message="Geen activiteiten gevonden. Pas je zoekterm of filter aan."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filteredInterventions.map((intervention) => (
            <li key={intervention.id}>
              <InterventionCard
                cardRef={intervention.id === selectedId ? selectedCardRef : undefined}
                intervention={intervention}
                onSelect={() => onSelect(intervention.id)}
                selected={selectedId === intervention.id}
              />
            </li>
          ))}
        </ul>
      )}

      {hasActiveFilter && filteredInterventions.length > 0 ? (
        <SectionLabel>
          {filteredInterventions.length} van {interventions.length} activiteiten
          {selectedId && !filteredInterventions.some((item) => item.id === selectedId)
            ? " (inclusief je huidige keuze)"
            : ""}
        </SectionLabel>
      ) : null}
    </DashboardPanel>
  );
}

function CategoryFilterButton({
  active,
  ariaLabel,
  color,
  icon,
  onClick,
  title,
}: {
  active: boolean;
  ariaLabel: string;
  color?: string;
  icon: string;
  onClick: () => void;
  title: string;
}) {
  const isColored = Boolean(color);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={cn(
        categoryIconClassName,
        categoryIconSizeClassName("sm"),
        "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isColored ? "border border-black/5" : "border border-border/50 bg-card text-primary",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low",
        !active && isColored && "hover:brightness-95",
        !active && !isColored && "hover:border-primary/30",
      )}
      style={isColored ? { backgroundColor: color } : undefined}
    >
      <Icon
        name={icon}
        className={cn("text-base", isColored ? "text-white" : undefined)}
        filled={active}
      />
      <span className="sr-only">{title}</span>
    </button>
  );
}
