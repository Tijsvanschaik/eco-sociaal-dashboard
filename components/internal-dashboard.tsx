import Link from "next/link";

import type { RegistrationCardData } from "@/components/dashboard/registration-card";
import { ProgressSlide } from "@/components/public/progress-slide";
import { RecentRegistrationsSlide } from "@/components/public/recent-registrations-slide";
import { TotalImpactSlide } from "@/components/public/total-impact-slide";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";

function toStoryPhotoSources(registrations: RegistrationCardData[]) {
  return registrations.map(({ id, photoUrl, co2KgCached, socialScoreCached }) => ({
    id,
    photoUrl: photoUrl ?? null,
    co2KgCached,
    socialScoreCached,
  }));
}

export function InternalDashboard({
  orgSlug,
  orgName,
  year,
  recentRegistrations,
  snapshot,
  timeseries,
}: {
  orgSlug: string;
  orgName: string;
  year: number;
  recentRegistrations: RegistrationCardData[];
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
}) {
  const periodLabel = String(year);

  return (
    <main className="relative min-h-dvh w-full min-w-0 space-y-8 bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)] px-10 pt-6 pb-28 sm:pt-10 sm:pb-28 md:py-10">
      <header className="w-full space-y-3 px-6 sm:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Welkom op het <span className="text-primary">{orgName}</span> impact dashboard
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Live overzicht van jullie impact — per team en categorie.
        </p>
      </header>

      <TotalImpactSlide
        periodLabel={periodLabel}
        snapshot={snapshot}
        storyPhotoSources={toStoryPhotoSources(recentRegistrations)}
        teamLinkBase={`/${orgSlug}/teams`}
      />

      <ProgressSlide
        periodLabel={periodLabel}
        progressYear={year}
        snapshot={snapshot}
        timeseries={timeseries}
      />

      <RecentRegistrationsSlide registrations={recentRegistrations} />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <Button
          asChild
          variant="brand"
          className="pointer-events-auto h-auto gap-2 px-6 py-3.5 text-base"
        >
          <Link href={`/${orgSlug}/registratie`}>
            <Icon name="add" />
            <span>Nieuwe Registratie</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
