import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  formatRegistrationCo2Kg,
  formatRegistrationDate,
  formatRegistrationSocialScore,
} from "@/components/dashboard/registration-card";
import { SuperadminResetRegistrationsPanel } from "@/components/superadmin-reset-registrations-panel";
import { SuperadminMetricGrid } from "@/components/superadmin/superadmin-metric-grid";
import {
  SuperadminPageHeader,
  SuperadminPageMain,
} from "@/components/superadmin/superadmin-page-layout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/server";
import { getSuperadminOrgOverview } from "@/lib/tenant-dashboard-data";

type Params = Promise<{ orgId: string }>;

function formatKg(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatSocialScoreMetric(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export default async function SuperadminOrgDetailPage({ params }: { params: Params }) {
  const { orgId } = await params;
  const supabase = await createClient();
  const data = await getSuperadminOrgOverview(supabase, orgId);
  if (!data) notFound();

  return (
    <SuperadminPageMain>
      <SuperadminPageHeader
        actions={
          <>
            <Button asChild className="rounded-full" variant="outline">
              <Link href="/superadmin">
                <Icon name="arrow_back" className="text-base" />
                Terug
              </Link>
            </Button>
            <Button asChild className="rounded-full" variant="secondary">
              <Link href={`/${data.org.slug}/dashboard`}>
                <Icon name="dashboard" className="text-base" />
                Tenant-dashboard
              </Link>
            </Button>
            {data.org.publicShareEnabled && data.org.publicShareSlug ? (
              <Button asChild className="rounded-full" variant="brand">
                <Link href={`/p/${data.org.publicShareSlug}`}>
                  <Icon name="share" className="text-base" />
                  Publieke link
                </Link>
              </Button>
            ) : null}
          </>
        }
        description="Read-only tenantdetail voor support, onboarding en kwaliteitscontrole."
        eyebrow={`/${data.org.slug}`}
        title={data.org.name}
      />

      <SuperadminMetricGrid
        metrics={[
          {
            description: "Totale eco-impact van deze tenant.",
            icon: "eco",
            label: "CO₂ bespaard",
            tone: "tertiary",
            unit: "kg",
            value: formatKg(data.snapshot.totalCo2Kg),
          },
          {
            description: "Totale sociale score van deze tenant.",
            icon: "favorite",
            label: "Sociale score",
            tone: "primary",
            unit: "punten",
            value: formatSocialScoreMetric(data.snapshot.totalSocialScore),
          },
          {
            description: "Aantal registraties.",
            icon: "edit_note",
            label: "Registraties",
            tone: "neutral",
            value: String(data.snapshot.registrationCount),
          },
          {
            description: "Unieke medewerkers met minstens één registratie.",
            icon: "group",
            label: "Actieve collega's",
            tone: "neutral",
            value: String(data.snapshot.activeUserCount),
          },
          {
            description: "Berekende verschuiving t.o.v. de EOD-baseline.",
            icon: "calendar_month",
            label: "EOD opgeschoven",
            tone: "primary",
            unit: "dagen",
            value: String(data.snapshot.eodDays),
          },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardPanel
          description="Snelle checks voor support en onboarding."
          icon="settings"
          iconTone="neutral"
          title="Organisatie-status"
        >
          <dl className="space-y-3 text-sm">
            <StatusRow
              label="Publieke share-link"
              value={data.org.publicShareEnabled && data.org.publicShareSlug ? "Aan" : "Uit"}
            />
            <StatusRow
              label="Publieke slug"
              value={data.org.publicShareSlug ?? "Nog niet ingesteld"}
            />
            <StatusRow
              label="EOD-baseline"
              value={data.org.eodBaselineKg ? `${data.org.eodBaselineKg} kg` : "Placeholder"}
            />
          </dl>
        </DashboardPanel>

        <DashboardPanel
          description="Laatste 8 registraties binnen deze tenant."
          icon="history"
          iconTone="primary"
          title="Recente registraties"
        >
          {data.recentRegistrations.length === 0 ? (
            <p className="rounded-[1.5rem] bg-card p-6 text-sm text-muted-foreground shadow-[0_20px_40px_rgba(54,50,45,0.04)]">
              Nog geen registraties beschikbaar.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.recentRegistrations.map((registration) => (
                <li
                  key={registration.id}
                  className="rounded-[1.25rem] border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{registration.interventionLabel}</p>
                      <p className="text-sm text-muted-foreground">{registration.teamLabel}</p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-semibold">
                      <span className="text-tertiary">
                        {formatRegistrationCo2Kg(registration.co2KgCached)} kg
                      </span>
                      {" · "}
                      <span className="text-primary">
                        {formatRegistrationSocialScore(registration.socialScoreCached)} punten
                      </span>
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {registration.quantity} op {formatRegistrationDate(registration.happenedOn)}
                  </p>
                  {registration.note ? (
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {registration.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <BreakdownPanel
          emptyText="Nog geen teamdata beschikbaar."
          items={data.snapshot.teamBreakdown.slice(0, 6)}
          title="Top teams"
        />
        <BreakdownPanel
          emptyText="Nog geen categoriedata beschikbaar."
          items={data.snapshot.categoryBreakdown}
          title="Per categorie"
        />
      </section>

      <SuperadminResetRegistrationsPanel
        orgId={data.org.id}
        registrationCount={data.snapshot.registrationCount}
      />
    </SuperadminPageMain>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-[1rem] bg-card px-4 py-3 shadow-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function BreakdownPanel({
  emptyText,
  items,
  title,
}: {
  emptyText: string;
  items: Array<{
    co2SavedKg: number;
    id: string;
    name: string;
    registrationCount: number;
    socialScoreTotal: number;
  }>;
  title: string;
}) {
  const rows = items.filter((item) => item.registrationCount > 0);

  return (
    <DashboardPanel
      description="Impactverdeling binnen deze tenant."
      icon="leaderboard"
      title={title}
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-border/60 bg-card p-4 shadow-sm"
            >
              <p className="font-bold text-foreground">{item.name}</p>
              <div className="text-right text-sm">
                <p className="font-semibold">
                  <span className="text-tertiary">{formatKg(item.co2SavedKg)} kg</span>
                  {" · "}
                  <span className="text-primary">
                    {formatSocialScoreMetric(item.socialScoreTotal)} punten
                  </span>
                </p>
                <p className="text-muted-foreground">{item.registrationCount} registraties</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
