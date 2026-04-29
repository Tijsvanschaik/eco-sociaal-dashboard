import type { RegistrationCardData } from "@/components/dashboard/registration-card";
import { ProgressSlide } from "@/components/public/progress-slide";
import { RecentRegistrationsSlide } from "@/components/public/recent-registrations-slide";
import { TotalImpactSlide } from "@/components/public/total-impact-slide";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { DashboardPeriod, WeeklyTimeseriesRow } from "@/lib/timeseries";

export function InternalDashboard({
  orgName,
  period,
  recentRegistrations,
  snapshot,
  timeseries,
}: {
  orgName: string;
  period: DashboardPeriod;
  recentRegistrations: RegistrationCardData[];
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
}) {
  const periodLabel =
    period === "30d" ? "laatste 30 dagen" : period === "90d" ? "laatste 90 dagen" : "alle data";

  return (
    <main className="min-h-dvh w-full min-w-0 space-y-8 bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)] px-10 py-6 sm:py-10">
      <header className="w-full space-y-3 p-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Welkom op het <span className="text-primary">{orgName}</span> impact dashboard
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Live overzicht van jullie impact — per team en categorie.
        </p>
      </header>

      <TotalImpactSlide periodLabel={periodLabel} snapshot={snapshot} />

      <ProgressSlide periodLabel={periodLabel} snapshot={snapshot} timeseries={timeseries} />

      <RecentRegistrationsSlide registrations={recentRegistrations} />
    </main>
  );
}
