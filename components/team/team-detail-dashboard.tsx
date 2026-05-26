import Link from "next/link";

import { tenantPageMainClassName } from "@/components/app-shell/tenant-page-layout";
import { ProgressSlide } from "@/components/public/progress-slide";
import { RecentRegistrationsSlide } from "@/components/public/recent-registrations-slide";
import { TeamActivityBreakdown } from "@/components/team/team-activity-breakdown";
import { TeamImpactHero } from "@/components/team/team-impact-hero";
import { Icon } from "@/components/ui/icon";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { RecentRegistration } from "@/lib/tenant-dashboard-data";
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";

export function TeamDetailDashboard({
  orgSlug,
  teamName,
  year,
  snapshot,
  timeseries,
  recentRegistrations,
}: {
  orgSlug: string;
  teamName: string;
  year: number;
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
  recentRegistrations: RecentRegistration[];
}) {
  const periodLabel = String(year);
  const segments = snapshot.teamBreakdown[0]?.segments ?? [];

  return (
    <main className={tenantPageMainClassName}>
      <header className="w-full space-y-4">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/5"
          href={`/${orgSlug}/dashboard`}
        >
          <Icon name="arrow_back" className="text-base" />
          Terug naar dashboard
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Team <span className="text-primary">{teamName}</span>
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Activiteiten en impact van dit team in {year}.
          </p>
        </div>
      </header>

      <TeamImpactHero
        periodLabel={periodLabel}
        registrationCount={snapshot.registrationCount}
        teamName={teamName}
        totalCo2Kg={snapshot.totalCo2Kg}
        totalSocialScore={snapshot.totalSocialScore}
      />

      <TeamActivityBreakdown periodLabel={periodLabel} segments={segments} />

      <ProgressSlide
        periodLabel={periodLabel}
        progressYear={year}
        snapshot={snapshot}
        timeseries={timeseries}
      />

      <RecentRegistrationsSlide
        description="De laatste acties van dit team — elke kaart telt direct mee in het team-overzicht."
        registrations={recentRegistrations}
        limit={12}
        gridClassName="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      />
    </main>
  );
}
