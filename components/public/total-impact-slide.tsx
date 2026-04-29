import { ImpactOverviewCard } from "@/components/dashboard/impact-overview-card";
import type { DashboardSnapshot } from "@/lib/dashboard";

export type TotalImpactSlideProps = {
  isTv?: boolean;
  periodLabel: string;
  snapshot: DashboardSnapshot;
};

/**
 * Slide 1: Totale impact + Top teams. Hergebruikt de `<ImpactOverviewCard>` die
 * ook op het interne dashboard staat zodat publieke surfaces (`/p`, `/tv`,
 * `/embed`) en intern dezelfde visuele taal spreken. Wijzig je het kaart-
 * design op één plek, dan trekt het overal door.
 */
export function TotalImpactSlide({ isTv = false, periodLabel, snapshot }: TotalImpactSlideProps) {
  return (
    <ImpactOverviewCard
      eodDays={snapshot.eodDays}
      forceShowAllTeams={isTv}
      periodLabel={periodLabel}
      registrationCount={snapshot.registrationCount}
      showTeamRanks={isTv}
      teamBreakdown={snapshot.teamBreakdown}
      totalCo2Kg={snapshot.totalCo2Kg}
    />
  );
}
