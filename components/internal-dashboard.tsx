import Link from "next/link";

import { tenantPageMainClassName } from "@/components/app-shell/tenant-page-layout";
import { OrgWelcomePanel } from "@/components/org-welcome-panel";
import { InternalRecentRegistrationsSection } from "@/components/dashboard/internal-recent-registrations-section";
import { ProgressSlide } from "@/components/public/progress-slide";
import { TotalImpactSlide } from "@/components/public/total-impact-slide";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { DashboardFeedFilters } from "@/lib/registrations/dashboard-filters";
import type { RecentRegistration, TeamOption } from "@/lib/tenant-dashboard-data";
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";

export function InternalDashboard({
  feedFilters,
  description,
  impactDisclaimer,
  missionShort,
  orgSlug,
  orgName,
  recentRegistrations,
  showTeamFilter,
  snapshot,
  teams,
  timeseries,
  year,
}: {
  feedFilters: DashboardFeedFilters;
  description?: string | null;
  impactDisclaimer?: string | null;
  missionShort?: string | null;
  orgSlug: string;
  orgName: string;
  recentRegistrations: RecentRegistration[];
  showTeamFilter: boolean;
  snapshot: DashboardSnapshot;
  teams: TeamOption[];
  timeseries: WeeklyTimeseriesRow[];
  year: number;
}) {
  const periodLabel = String(year);

  return (
    <main className={tenantPageMainClassName}>
      <OrgWelcomePanel
        description={description}
        impactDisclaimer={impactDisclaimer}
        missionShort={missionShort}
        orgName={orgName}
      />

      <TotalImpactSlide
        periodLabel={periodLabel}
        snapshot={snapshot}
        teamLinkBase={`/${orgSlug}/teams`}
      />

      <ProgressSlide
        periodLabel={periodLabel}
        progressYear={year}
        snapshot={snapshot}
        timeseries={timeseries}
      />

      <InternalRecentRegistrationsSection
        filters={feedFilters}
        orgSlug={orgSlug}
        registrations={recentRegistrations}
        showTeamFilter={showTeamFilter}
        teams={teams}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <Button
          asChild
          variant="brand"
          className="pointer-events-auto h-auto gap-2 px-6 py-3.5 text-base"
        >
          <Link href={`/${orgSlug}/activiteit/nieuw`}>
            <Icon name="add" />
            <span>Activiteit registreren</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
