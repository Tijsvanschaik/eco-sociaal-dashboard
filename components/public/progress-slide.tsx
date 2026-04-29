import { CategoryDonutChartBody } from "@/components/charts/category-donut-chart";
import { TrendAreaChartBody } from "@/components/charts/trend-area-chart";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import type { DashboardSnapshot } from "@/lib/dashboard";
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";

export type ProgressSlideProps = {
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
 */
export function ProgressSlide({
  progressYear,
  periodLabel,
  snapshot,
  timeseries,
}: ProgressSlideProps) {
  const yearLabel = progressYear ?? new Date().getUTCFullYear();

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <DashboardPanel
        description={`Cumulatieve CO₂-besparing · ${periodLabel}`}
        icon="trending_up"
        iconTone="tertiary"
        title={`Voortgang ${yearLabel}`}
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
  );
}
