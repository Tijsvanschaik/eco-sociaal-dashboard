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
    <div className={cn("flex min-h-0 flex-col gap-5 lg:h-full lg:gap-6", className)}>
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
        <Icon name="insights" className="text-base" filled /> Totale eco-sociale impact
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

      <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImpactFactTile
          description="Dit is de som van de CO₂-impact van alle registraties."
          icon="eco"
          label="Eco score"
          tone="tertiary"
          unit="kg CO₂"
          value={formatKg(totalCo2Kg)}
        />
        <ImpactFactTile
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
  description,
  icon,
  label,
  tone,
  unit,
  value,
}: {
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

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden p-5 transition-transform hover:-translate-y-0.5",
        impactInsetPanelClassName,
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-[0.875rem] shadow-sm",
          iconTone,
        )}
      >
        <Icon name={icon} filled className="text-xl" />
      </span>
      <div className="space-y-2">
        <div className="flex items-baseline gap-1.5">
          <dd className="text-3xl font-extrabold leading-none tracking-tight text-foreground sm:text-4xl">
            {value}
          </dd>
          {unit ? (
            <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
          ) : null}
        </div>
        <dt className="text-sm font-bold tracking-tight text-foreground">{label}</dt>
        <p className="text-xs leading-relaxed text-muted-foreground/90">{description}</p>
      </div>
    </div>
  );
}
