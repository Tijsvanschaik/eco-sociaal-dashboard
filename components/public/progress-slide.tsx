import { CategoryDonutChartBody } from "@/components/charts/category-donut-chart";
import { TrendAreaChartBody } from "@/components/charts/trend-area-chart";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";
import { cn } from "@/lib/utils";

export type ProgressSlideProps = {
  /**
   * TV / embed-rotate: alleen de voortgangsgrafiek, volle breedte en vullend
   * binnen de slide-hoogte (geen categorie-donuts).
   */
  isKioskFullscreen?: boolean;
  /**
   * Optionele jaartal-suffix voor de "Voortgang"-titel. Default = huidig jaar
   * van de server. Geef bv. "2026" mee voor een fixed scherm in een specifieke
   * jaargang.
   */
  progressYear?: number | string;
  periodLabel: string;
  snapshot: DashboardSnapshot;
  timeseries: WeeklyTimeseriesRow[];
};

/**
 * Slide 2: Voortgang (cumulatieve weektrend) + Impact per categorie (donut).
 * Hergebruikt de chart-bodies uit het interne dashboard via de gedeelde
 * `<DashboardPanel>`-schil zodat copy en typografie consistent zijn.
 *
 * In kiosk-modus (`isKioskFullscreen`): alleen de trendgrafiek, schermvullend.
 */
export function ProgressSlide({
  isKioskFullscreen = false,
  progressYear,
  periodLabel,
  snapshot,
  timeseries,
}: ProgressSlideProps) {
  const yearLabel = progressYear ?? new Date().getUTCFullYear();

  if (isKioskFullscreen) {
    return (
      <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
        <DashboardPanel
          className="flex h-full min-h-0 flex-col rounded-[2rem] lg:min-h-0"
          contentClassName="mt-5 flex min-h-0 flex-1 flex-col"
          description={`Cumulatieve CO₂-besparing en sociale score · ${periodLabel}`}
          icon="trending_up"
          iconTone="tertiary"
          title={`Voortgang ${yearLabel}`}
        >
          <TrendAreaChartBody cumulative data={timeseries} fillContainer />
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className={cn("grid gap-6 lg:grid-cols-2")}>
      <DashboardPanel
        description={`Cumulatieve CO₂-besparing en sociale score · ${periodLabel}`}
        icon="trending_up"
        iconTone="tertiary"
        title={`Voortgang ${yearLabel}`}
      >
        <TrendAreaChartBody cumulative data={timeseries} />
      </DashboardPanel>
      <DashboardPanel
        description="Aandeel per categorie: CO₂ (kg) en sociale score (eenheid vrij)"
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
            socialScoreTotal: item.socialScoreTotal,
            registrationCount: item.registrationCount,
            eodDays: item.eodDays,
          }))}
        />
      </DashboardPanel>
    </section>
  );
}
