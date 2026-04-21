import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}: {
  categories: CategoryRow[];
  mode: "embed" | "public" | "tv";
  teams: TeamRow[];
  totals: Totals;
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

      <section className={`mt-6 grid gap-6 ${isEmbed ? "lg:grid-cols-2" : "lg:grid-cols-2"}`}>
        <BreakdownCard
          items={teams.map((team) => ({
            id: team.team_id ?? team.team_name ?? "team",
            label: team.team_name ?? "Onbekend team",
            secondary: team.location_name ?? undefined,
            value: `${formatNumber(team.co2_saved_kg, " kg")} · ${formatNumber(team.registration_count)} registraties`,
          }))}
          title="Top teams"
        />
        <BreakdownCard
          items={categories.map((category) => ({
            id: category.category_id ?? category.category_name ?? "category",
            label: category.category_name ?? "Onbekende categorie",
            secondary: undefined,
            value: `${formatNumber(category.co2_saved_kg, " kg")} · ${formatNumber(category.registration_count)} registraties`,
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

function BreakdownCard({
  items,
  title,
}: {
  items: Array<{ id: string; label: string; secondary?: string; value: string }>;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen data beschikbaar.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.label}</p>
              {item.secondary && <p className="text-sm text-muted-foreground">{item.secondary}</p>}
              <p className="mt-2 text-sm">{item.value}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
