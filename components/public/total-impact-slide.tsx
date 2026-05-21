import { ImpactOverviewCard } from "@/components/dashboard/impact-overview-card";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { ImpactStoryPhotoSource } from "@/lib/impact-stories";
import { cn } from "@/lib/utils";

export type TotalImpactSlideProps = {
  isTv?: boolean;
  periodLabel: string;
  snapshot: DashboardSnapshot;
  storyPhotoSources?: ImpactStoryPhotoSource[];
};

/**
 * Slide 1: Totale eco-sociale impact + Top teams. Hergebruikt de `<ImpactOverviewCard>` die
 * ook op het interne dashboard staat zodat publieke surfaces (`/p`, `/tv`,
 * `/embed`) en intern dezelfde visuele taal spreken. Wijzig je het kaart-
 * design op één plek, dan trekt het overal door.
 */
export function TotalImpactSlide({
  isTv = false,
  periodLabel,
  snapshot,
  storyPhotoSources = [],
}: TotalImpactSlideProps) {
  return (
    <div className={cn(isTv && "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col")}>
      <ImpactOverviewCard
        eodDays={snapshot.eodDays}
        fitToContainer={isTv}
        forceShowAllTeams={isTv}
        periodLabel={periodLabel}
        registrationCount={snapshot.registrationCount}
        showTeamRanks={isTv}
        storyPhotoSources={storyPhotoSources}
        teamBreakdown={snapshot.teamBreakdown}
        totalCo2Kg={snapshot.totalCo2Kg}
        totalSocialScore={snapshot.totalSocialScore}
      />
    </div>
  );
}
