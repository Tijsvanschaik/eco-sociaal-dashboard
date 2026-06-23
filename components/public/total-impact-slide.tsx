import { ImpactOverviewCard } from "@/components/dashboard/impact-overview-card";
import type { DashboardSnapshot } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export type TotalImpactSlideProps = {
  isTv?: boolean;
  periodLabel: string;
  snapshot: DashboardSnapshot;
  teamLinkBase?: string;
};

/**
 * Slide 1: Totale eco-sociale impact + Top teams.
 */
export function TotalImpactSlide({
  isTv = false,
  periodLabel,
  snapshot,
  teamLinkBase,
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
        teamLinkBase={teamLinkBase}
        teamBreakdown={snapshot.teamBreakdown}
        totalCo2Kg={snapshot.totalCo2Kg}
        totalSocialScore={snapshot.totalSocialScore}
      />
    </div>
  );
}
