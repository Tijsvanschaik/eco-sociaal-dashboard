import { CategoryDonutChart } from "@/components/charts/category-donut-chart";
import { TeamRankingBar } from "@/components/charts/team-ranking-bar";
import { TrendAreaChart } from "@/components/charts/trend-area-chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicTimeseriesRow } from "@/lib/public-dashboard";
import type { Database } from "@/supabase/types/supabase";

type Totals = Database["public"]["Views"]["public_dashboard_totals"]["Row"];
type TeamRow = Database["public"]["Views"]["public_team_breakdown"]["Row"];
type CategoryRow = Database["public"]["Views"]["public_category_breakdown"]["Row"];

function formatNumber(value: number | null, suffix = ""): string {
  return `${new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value && value < 100 ? 1 : 0,
  }).format(value ?? 0)}${suffix}`;
}

export function PublicDashboardView({
  categories,
  mode,
  teams,
  totals,
  timeseries,
}: {
  categories: CategoryRow[];
  mode: "embed" | "public" | "tv";
  teams: TeamRow[];
  totals: Totals;
  timeseries: PublicTimeseriesRow[];
}) {
  const isTv = mode === "tv";
  const isEmbed = mode === "embed";

  return (
    <main
      className={
        isTv ? "min-h-dvh bg-background px-8 py-10" : "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
      }
    >
      {isTv && <meta content="60" httpEquiv="refresh" />}
      <section className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {isTv ? "TV-modus" : isEmbed ? "Intranet embed" : "Publiek dashboard"}
        </p>
        <h1
          className={
            isTv ? "text-5xl font-semibold tracking-tight" : "text-3xl font-semibold tracking-tight"
          }
        >
          {totals.org_name}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Live totaalstand van eco-sociale registraties. Deze pagina toont alleen publieke cijfers.
        </p>
      </section>

      <section
        className={`mt-6 grid gap-4 ${isEmbed ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}
      >
        <MetricCard label="CO2 bespaard" value={formatNumber(totals.co2_saved_kg, " kg")} />
        <MetricCard label="Registraties" value={formatNumber(totals.registration_count)} />
        <MetricCard label="Actieve collega's" value={formatNumber(totals.active_user_count)} />
        <MetricCard
          label="EOD opgeschoven"
          value={`${Math.round(totals.eod_days_gained ?? 0)} dagen`}
        />
      </section>

      <section className="mt-6">
        <TrendAreaChart
          data={timeseries
            .filter((row) => row.week_start)
            .map((row) => ({
              weekStart: row.week_start ?? "",
              co2SavedKg: row.co2_saved_kg ?? 0,
              registrationCount: row.registration_count ?? 0,
            }))}
          description="Ontwikkeling van de publieke CO2-impact per week."
          title="Trend per week"
        />
      </section>

      <section
        className={`mt-6 grid gap-6 ${isTv ? "xl:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-2"}`}
      >
        <TeamRankingBar
          description="De teams met de hoogste publieke impact."
          items={teams.map((team) => ({
            id: team.team_id ?? team.team_name ?? "team",
            name: team.team_name ?? "Onbekend team",
            secondary: team.location_name ?? undefined,
            co2SavedKg: team.co2_saved_kg ?? 0,
          }))}
          title="Top teams"
        />
        <CategoryDonutChart
          description="Verdeling van de besparing over categorieen."
          items={categories.map((category) => ({
            id: category.category_id ?? category.category_name ?? "category",
            name: category.category_name ?? "Onbekende categorie",
            color: category.category_color ?? undefined,
            co2SavedKg: category.co2_saved_kg ?? 0,
            registrationCount: category.registration_count ?? 0,
          }))}
          title="Per categorie"
        />
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
