import { CategoryDonutChartBody } from "@/components/charts/category-donut-chart";
import { TrendAreaChartBody } from "@/components/charts/trend-area-chart";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ImpactOverviewCard } from "@/components/dashboard/impact-overview-card";
import {
  RegistrationCard,
  type RegistrationCardData,
} from "@/components/dashboard/registration-card";
import { Icon } from "@/components/ui/icon";
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

      <ImpactOverviewCard
        eodDays={snapshot.eodDays}
        teamBreakdown={snapshot.teamBreakdown}
        periodLabel={periodLabel}
        registrationCount={snapshot.registrationCount}
        totalCo2Kg={snapshot.totalCo2Kg}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          description={`Cumulatieve CO₂-besparing · ${periodLabel}`}
          icon="trending_up"
          iconTone="tertiary"
          title="Voortgang 2026"
        >
          <TrendAreaChartBody cumulative data={timeseries} />
        </DashboardPanel>
        <DashboardPanel
          description="Aandeel van elke categorie in de totale besparing"
          icon="donut_small"
          iconTone="primary"
          title="Impact per categorie"
        >
          <CategoryDonutChartBody
            items={snapshot.categoryBreakdown.map((item) => ({
              id: item.id,
              name: item.name,
              color: item.color,
              co2SavedKg: item.co2SavedKg,
              registrationCount: item.registrationCount,
            }))}
          />
        </DashboardPanel>
      </section>

      <DashboardPanel
        description="De laatste acties van de hele organisatie — elke kaart telt direct mee in het overzicht bovenaan."
        icon="history"
        iconTone="primary"
        title="Recente registraties"
      >
        {recentRegistrations.length === 0 ? (
          <div className="flex flex-col items-start gap-2 rounded-[1.5rem] bg-surface-container-low p-6 text-sm text-muted-foreground">
            <Icon name="inbox" className="text-2xl text-primary" filled />
            <p>
              Nog geen registraties binnen deze organisatie. Voeg via de registratie-pagina de
              eerste actie toe.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recentRegistrations.map((registration) => (
              <li key={registration.id} className="h-full">
                <RegistrationCard registration={registration} />
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>
    </main>
  );
}
