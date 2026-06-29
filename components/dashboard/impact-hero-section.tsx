"use client";

import { useMemo } from "react";

import { ImpactMetaphorCarousel } from "@/components/impact-metaphors/impact-metaphor-carousel";
import { Icon } from "@/components/ui/icon";
import { buildMetaphorUnits } from "@/lib/impact-metaphors";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";
import { cn } from "@/lib/utils";

const impactInsetPanelClassName = "rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)]";

function formatKg(kg: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: kg >= 100 ? 0 : 1,
  }).format(kg);
}

function formatScore(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export type ImpactHeroSectionProps = {
  carouselPaused?: boolean;
  carouselSeedPrefix?: string;
  className?: string;
  fitToContainer?: boolean;
  hasData?: boolean;
  islandTuning?: IslandTuning;
  totalCo2Kg: number;
  totalSocialScore: number;
};

export function ImpactHeroSection({
  carouselPaused = false,
  carouselSeedPrefix = "impact",
  className,
  fitToContainer = false,
  hasData: hasDataProp,
  islandTuning,
  totalCo2Kg,
  totalSocialScore,
}: ImpactHeroSectionProps) {
  const units = useMemo(
    () => buildMetaphorUnits({ totalCo2Kg, totalSocialScore }),
    [totalCo2Kg, totalSocialScore],
  );

  const hasData = hasDataProp ?? (totalCo2Kg > 0 || totalSocialScore > 0 || units.length > 0);

  return (
    <div className={cn("flex min-h-0 flex-col gap-3 sm:gap-5 lg:h-full lg:gap-6", className)}>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary sm:gap-2 sm:px-4 sm:py-1.5 sm:text-xs">
        <Icon name="insights" className="text-sm sm:text-base" filled /> Totale eco-sociale impact
      </span>

      <div className="min-h-0">
        {hasData && units.length > 0 ? (
          <ImpactMetaphorCarousel
            fitToContainer={fitToContainer}
            paused={carouselPaused}
            seedPrefix={carouselSeedPrefix}
            tuning={islandTuning}
            units={units}
          />
        ) : (
          <div className="min-h-[8.5rem] space-y-2 sm:min-h-[9rem]">
            <h2
              id="impact-overview-heading"
              className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl"
            >
              Jullie impact in cijfers
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Zodra de eerste registraties binnenrollen, wisselen we hier tussen bomen geplant en
              mensen bereikt.
            </p>
          </div>
        )}
      </div>

      <dl
        className={cn(
          "mt-1 grid grid-cols-2 gap-2.5 sm:mt-2 sm:gap-4",
          fitToContainer && "mt-0 gap-2 sm:gap-2",
        )}
      >
        <ImpactFactTile
          compact={fitToContainer}
          description="Dit is de som van de CO₂-impact van alle registraties."
          icon="eco"
          label="Eco score"
          tone="tertiary"
          unit="kg CO₂"
          value={formatKg(totalCo2Kg)}
        />
        <ImpactFactTile
          compact={fitToContainer}
          description="Dit is de som van alle sociale impact van alle registraties."
          icon="favorite"
          label="Sociale score"
          tone="primary"
          unit="punten"
          value={formatScore(totalSocialScore)}
        />
      </dl>
    </div>
  );
}

function ImpactFactTile({
  compact = false,
  description,
  icon,
  label,
  tone,
  unit,
  value,
}: {
  compact?: boolean;
  description: string;
  icon: string;
  label: string;
  tone: "primary" | "tertiary";
  unit?: string;
  value: string;
}) {
  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : "bg-primary-container text-primary";

  if (compact) {
    return (
      <div
        aria-label={`${label}: ${value}${unit ? ` ${unit}` : ""}`}
        className={cn(
          "flex min-w-0 items-center gap-2 p-2.5 sm:gap-2.5 sm:p-3",
          impactInsetPanelClassName,
        )}
      >
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm sm:h-8 sm:w-8",
            iconTone,
          )}
        >
          <Icon name={icon} filled className="text-base sm:text-lg" />
        </span>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0">
          <dd className="text-lg font-extrabold leading-none tracking-tight text-foreground sm:text-xl md:text-2xl">
            {value}
          </dd>
          {unit ? (
            <span className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col gap-2 overflow-hidden p-3.5 transition-transform hover:-translate-y-0.5 sm:gap-3 sm:p-5",
        impactInsetPanelClassName,
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[0.75rem] shadow-sm sm:h-10 sm:w-10 sm:rounded-[0.875rem]",
          iconTone,
        )}
      >
        <Icon name={icon} filled className="text-lg sm:text-xl" />
      </span>
      <div className="space-y-1 sm:space-y-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5">
          <dd className="text-xl font-extrabold leading-none tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {value}
          </dd>
          {unit ? (
            <span className="text-[11px] font-semibold text-muted-foreground sm:text-sm">
              {unit}
            </span>
          ) : null}
        </div>
        <dt className="text-xs font-bold tracking-tight text-foreground sm:text-sm">{label}</dt>
        <p className="hidden text-xs leading-relaxed text-muted-foreground/90 sm:block">
          {description}
        </p>
      </div>
    </div>
  );
}
