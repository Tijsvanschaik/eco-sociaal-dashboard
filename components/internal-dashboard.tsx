import Link from "next/link";

import { CategoryDonutChart } from "@/components/charts/category-donut-chart";
import { CategoryWeeklyStack } from "@/components/charts/category-weekly-stack";
import { TeamRankingBar } from "@/components/charts/team-ranking-bar";
import { TrendAreaChart } from "@/components/charts/trend-area-chart";
import { PeriodToggle } from "@/components/period-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type {
  DashboardPeriod,
  WeeklyCategoryTimeseriesRow,
  WeeklyTimeseriesRow,
} from "@/lib/timeseries";

type RecentRegistration = {
  co2KgCached: number;
  happenedOn: string;
  id: string;
  interventionLabel: string;
  note: string | null;
  quantity: number;
  teamLabel: string;
};

function formatKg(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function InternalDashboard({
  categoryTimeseries,
  orgName,
  orgSlug,
  period,
  recentRegistrations,
  roleLabel,
  snapshot,
  timeseries,
}: {
  categoryTimeseries: WeeklyCategoryTimeseriesRow[];
  orgName: string;
  orgSlug: string;
  period: DashboardPeriod;
  recentRegistrations: RecentRegistration[];
  roleLabel: string;
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
}) {
  const periodLabel =
    period === "30d" ? "laatste 30 dagen" : period === "90d" ? "laatste 90 dagen" : "alle data";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{orgName}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Volg hoe jullie ervoor staan, per team en per categorie. Je bent ingelogd als{" "}
            {roleLabel}.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Periode: {periodLabel}</p>
          <PeriodToggle current={period} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="CO2 bespaard" value={`${formatKg(snapshot.totalCo2Kg)} kg`} />
        <MetricCard label="Registraties" value={`${snapshot.registrationCount}`} />
        <MetricCard label="Actieve collega's" value={`${snapshot.activeUserCount}`} />
        <MetricCard label="EOD opgeschoven" value={`${snapshot.eodDays} dagen`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Volgende stap</CardTitle>
            <CardDescription>
              Houd registreren en analyseren bewust uit elkaar. Nieuwe acties voeg je toe op de
              aparte registratiepagina.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Dit dashboard toont de stand over {periodLabel}. Voor een nieuwe registratie ga je
              naar de aparte invoerflow.
            </p>
            <Button asChild className="min-h-11 w-full sm:w-auto">
              <Link href={`/${orgSlug}/registratie`}>Nieuwe registratie</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mijn recente registraties</CardTitle>
            <CardDescription>
              Je laatste 8 registraties, zodat je meteen feedback ziet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nog geen registraties. Voeg je eerste actie toe.
              </p>
            ) : (
              recentRegistrations.map((registration) => (
                <div key={registration.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{registration.interventionLabel}</p>
                      <p className="text-sm text-muted-foreground">{registration.teamLabel}</p>
                    </div>
                    <p className="text-sm font-medium">{formatKg(registration.co2KgCached)} kg</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {registration.quantity} op {registration.happenedOn}
                  </p>
                  {registration.note && <p className="mt-2 text-sm">{registration.note}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TrendAreaChart
          data={timeseries}
          description={`Wekelijkse CO2-impact over ${periodLabel}.`}
          title="Trend per week"
        />
        <CategoryDonutChart
          description="Aandeel van elke categorie in de totale besparing."
          items={snapshot.categoryBreakdown.map((item) => ({
            id: item.id,
            name: item.name,
            color: item.color,
            co2SavedKg: item.co2SavedKg,
            registrationCount: item.registrationCount,
          }))}
          title="Per categorie"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TeamRankingBar
          description="De teams met de meeste bespaarde CO2 in deze periode."
          items={snapshot.teamBreakdown}
          title="Top teams"
        />
        <CategoryWeeklyStack
          categories={snapshot.categoryBreakdown.map((item) => ({
            id: item.id,
            name: item.name,
            color: item.color,
            registrationCount: item.registrationCount,
          }))}
          data={categoryTimeseries}
          description="Welke categorieen droegen per week bij aan het totaal?"
          title="Categorieen per week"
        />
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
