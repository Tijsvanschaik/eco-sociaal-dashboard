import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { iconForCategory } from "@/lib/category-icons";
import { getOrgContextBySlug } from "@/lib/organizations";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import {
  createCategory,
  createIntervention,
  createTeam,
  provisionUser,
  updateOrgProfile,
  updateOrgSettings,
} from "./actions";

type Params = Promise<{ orgSlug: string }>;
type SearchParams = Promise<{ tab?: string | string[] }>;

const TAB_IDS = ["algemeen", "medewerkers", "teams", "interventies"] as const;
type TabId = (typeof TAB_IDS)[number];

const TABS: Array<{ id: TabId; icon: string; label: string; description: string }> = [
  {
    id: "algemeen",
    icon: "tune",
    label: "Algemeen",
    description: "Organisatieprofiel, publieke link en EOD-baseline.",
  },
  {
    id: "medewerkers",
    icon: "group",
    label: "Medewerkers",
    description: "Voeg admins en medewerkers toe en zie wie lid is.",
  },
  {
    id: "teams",
    icon: "groups",
    label: "Teams",
    description: "Organiseer medewerkers in teams voor registraties en rapportage.",
  },
  {
    id: "interventies",
    icon: "eco",
    label: "Interventies",
    description: "Categorieen en interventies die medewerkers kunnen registreren.",
  },
];

function parseTab(value: string | string[] | undefined): TabId {
  const raw = Array.isArray(value) ? value[0] : value;
  return (TAB_IDS as readonly string[]).includes(raw ?? "") ? (raw as TabId) : "algemeen";
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { orgSlug } = await params;
  const { tab: rawTab } = (await searchParams) ?? {};
  const activeTab = parseTab(rawTab);

  const supabase = await createClient();
  const context = await getOrgContextBySlug(supabase, orgSlug);
  if (!context || (context.role !== "admin" && !context.isSuperadmin)) notFound();

  const [teamsQuery, categoriesQuery, interventionsQuery, membershipsQuery, teamMembershipsQuery] =
    await Promise.all([
      supabase.from("teams").select("id, name").eq("org_id", context.org.id).order("name"),
      supabase
        .from("categories")
        .select("id, name, color")
        .eq("org_id", context.org.id)
        .order("name"),
      supabase
        .from("interventions")
        .select("id, name, category_id, eco_unit, social_unit, co2_factor_kg, social_score_factor")
        .eq("org_id", context.org.id)
        .order("name"),
      supabase.from("memberships").select("user_id, role").eq("org_id", context.org.id),
      supabase.from("team_memberships").select("user_id, team_id").eq("org_id", context.org.id),
    ]);

  const teams = teamsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const interventions = interventionsQuery.data ?? [];
  const memberships = membershipsQuery.data ?? [];
  const teamMemberships = teamMembershipsQuery.data ?? [];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const userIds = memberships.map((membership) => membership.user_id);
  const emailMap = await getEmailMap(userIds);

  return (
    <main className="min-h-dvh w-full min-w-0 space-y-8 bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)] px-4 py-6 sm:px-10 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="max-w-2xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {context.org.name}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Instellingen</h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Richt je organisatie in zodat medewerkers kunnen registreren en jullie publieke
            dashboard live kan.
          </p>
        </header>

        <SettingsTabsNav activeTab={activeTab} orgSlug={context.org.slug} />

        {activeTab === "algemeen" ? (
          <GeneralTab
            context={{
              slug: context.org.slug,
              name: context.org.name,
              description: context.org.description,
              logoUrl: context.org.logoUrl,
              publicShareSlug: context.org.publicShareSlug,
              publicShareEnabled: context.org.publicShareEnabled,
              eodBaselineKg: context.org.eodBaselineKg,
              eodBaselineDate: context.org.eodBaselineDate,
            }}
          />
        ) : null}
        {activeTab === "medewerkers" ? (
          <MembersTab
            emailMap={emailMap}
            memberships={memberships}
            orgSlug={context.org.slug}
            teamMemberships={teamMemberships}
            teams={teams}
          />
        ) : null}
        {activeTab === "teams" ? (
          <TeamsTab
            memberships={memberships}
            orgSlug={context.org.slug}
            teamMemberships={teamMemberships}
            teams={teams}
          />
        ) : null}
        {activeTab === "interventies" ? (
          <InterventionsTab
            categories={categories}
            categoryMap={categoryMap}
            interventions={interventions}
            orgSlug={context.org.slug}
          />
        ) : null}
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Sub-tab nav
// -----------------------------------------------------------------------------

function SettingsTabsNav({ activeTab, orgSlug }: { activeTab: TabId; orgSlug: string }) {
  const activeMeta = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-3">
      <nav
        aria-label="Instellingen onderwerpen"
        className="rounded-[1.75rem] bg-surface-container-low p-2 shadow-[0_20px_40px_rgba(54,50,45,0.04)]"
      >
        <ul className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <li key={tab.id} className="flex-none">
                <Link
                  href={
                    tab.id === "algemeen"
                      ? `/${orgSlug}/instellingen`
                      : `/${orgSlug}/instellingen?tab=${tab.id}`
                  }
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon name={tab.icon} className="text-base" filled={isActive} />
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {activeMeta ? (
        <p className="px-1 text-xs text-muted-foreground">{activeMeta.description}</p>
      ) : null}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tab: Algemeen
// -----------------------------------------------------------------------------

function GeneralTab({
  context,
}: {
  context: {
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    publicShareSlug: string | null;
    publicShareEnabled: boolean;
    eodBaselineKg: number | null;
    eodBaselineDate: string | null;
  };
}) {
  const initials = getInitials(context.name);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-card p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8">
        <header className="mb-6 flex items-start gap-4">
          <span
            aria-hidden
            className="flex h-12 w-12 flex-none items-center justify-center rounded-[1rem] bg-primary-container text-primary"
          >
            <Icon name="apartment" filled className="text-2xl" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Organisatieprofiel
            </h2>
            <p className="text-sm text-muted-foreground">
              Naam, korte beschrijving en logo. Zichtbaar in de sidebar en op je publieke dashboard.
            </p>
          </div>
        </header>
        <form
          action={updateOrgProfile.bind(null, context.slug)}
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="space-y-5">
            <Field
              defaultValue={context.name}
              label="Organisatienaam"
              name="name"
              placeholder="Bijv. LEV Groep"
              required
            />
            <TextareaField
              defaultValue={context.description ?? ""}
              helper="Max 280 tekens. Korte omschrijving van jullie missie of werkgebied."
              label="Korte beschrijving"
              name="description"
              placeholder="Wat is de kernmissie van jullie organisatie?"
              rows={4}
            />
            <Field
              defaultValue={context.logoUrl ?? ""}
              helper="Plak een URL naar jullie logo (PNG of SVG, bij voorkeur transparante achtergrond)."
              label="Logo-URL"
              name="logoUrl"
              placeholder="https://..."
              type="url"
            />
            <div className="flex justify-end pt-1">
              <Button type="submit" variant="brand" className="min-h-11 rounded-full px-6">
                <Icon name="save" className="text-base" />
                Profiel opslaan
              </Button>
            </div>
          </div>
          <aside className="flex flex-col items-center justify-center gap-5 rounded-[1.5rem] bg-surface-container-low p-6 text-center">
            <div className="relative">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[1.5rem] border-4 border-card bg-card shadow-[0_12px_28px_rgba(54,50,45,0.08)]">
                {context.logoUrl ? (
                  <img
                    alt={`Logo van ${context.name}`}
                    src={context.logoUrl}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-extrabold text-primary">
                    {initials}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold">Voorbeeld</h3>
              <p className="text-xs text-muted-foreground">
                Preview update na opslaan. Geen logo? We laten initialen zien.
              </p>
            </div>
          </aside>
        </form>
      </section>

      <DashboardPanel
        description="Publieke link en EOD-baseline voor jullie /p-dashboard."
        icon="tune"
        iconTone="tertiary"
        title="Publieke dashboard & baseline"
      >
        <form action={updateOrgSettings.bind(null, context.slug)} className="space-y-5">
          <Field
            defaultValue={context.publicShareSlug ?? ""}
            helper="Hiermee is je publieke dashboard bereikbaar op /p/{slug}. Laat leeg om te deactiveren."
            label="Publieke slug"
            name="publicShareSlug"
            placeholder="bv. lev-groep"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              defaultValue={context.eodBaselineKg ?? ""}
              helper="Totale CO2-uitstoot waartegen besparingen worden afgezet."
              label="EOD-baseline (kg)"
              min="0"
              name="eodBaselineKg"
              step="0.001"
              type="number"
            />
            <Field
              defaultValue={context.eodBaselineDate ?? ""}
              helper="Datum waarop de baseline is vastgesteld."
              label="Baseline-datum"
              name="eodBaselineDate"
              type="date"
            />
          </div>

          <label className="flex items-start gap-3 rounded-[1rem] bg-surface-container-low p-4 text-sm">
            <input
              defaultChecked={context.publicShareEnabled}
              name="publicShareEnabled"
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded accent-primary"
            />
            <span className="space-y-0.5">
              <span className="block font-semibold text-foreground">
                Publieke share-link inschakelen
              </span>
              <span className="block text-xs text-muted-foreground">
                Alleen actief als er ook een slug is ingevuld. Externe bezoekers zien alleen
                geaggregeerde data.
              </span>
              {context.publicShareSlug ? (
                <span className="mt-1 block font-mono text-xs text-primary">
                  Live URL: /p/{context.publicShareSlug}
                </span>
              ) : null}
            </span>
          </label>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="brand" className="min-h-11 rounded-full px-6">
              <Icon name="save" className="text-base" />
              Instellingen opslaan
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tab: Medewerkers
// -----------------------------------------------------------------------------

function MembersTab({
  emailMap,
  memberships,
  orgSlug,
  teamMemberships,
  teams,
}: {
  emailMap: Map<string, string>;
  memberships: Array<{ user_id: string; role: string }>;
  orgSlug: string;
  teamMemberships: Array<{ user_id: string; team_id: string }>;
  teams: Array<{ id: string; name: string }>;
}) {
  const teamById = new Map(teams.map((team) => [team.id, team.name]));

  return (
    <div className="space-y-6">
      <DashboardPanel
        description="Voeg admins en medewerkers toe. Ze ontvangen geen mail en loggen zelf in via /login."
        icon="person_add"
        iconTone="primary"
        title="Nieuwe medewerker"
      >
        <form action={provisionUser.bind(null, orgSlug)} className="space-y-5">
          <Field
            label="E-mailadres"
            name="email"
            placeholder="collega@organisatie.nl"
            required
            type="email"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Rol"
              name="role"
              options={[
                { label: "Admin", value: "admin" },
                { label: "Medewerker", value: "worker" },
              ]}
            />
            <SelectField
              emptyOption="Kies team..."
              helper="Verplicht voor medewerkers."
              label="Team"
              name="teamId"
              options={teams.map((team) => ({ label: team.name, value: team.id }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="brand" className="min-h-11 rounded-full px-6">
              <Icon name="person_add" className="text-base" />
              Medewerker toevoegen
            </Button>
          </div>
        </form>
      </DashboardPanel>

      <section className="rounded-[2rem] bg-card p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">Leden</h3>
            <p className="text-sm text-muted-foreground">
              {memberships.length} {memberships.length === 1 ? "lid" : "leden"} in deze organisatie.
            </p>
          </div>
        </header>

        {memberships.length === 0 ? (
          <EmptyState
            icon="group_off"
            message="Nog geen leden. Voeg de eerste medewerker toe via het formulier hierboven."
          />
        ) : (
          <div className="-mx-6 overflow-x-auto sm:-mx-8">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-6 pb-3 text-xs font-bold uppercase tracking-widest sm:px-8">
                    Medewerker
                  </th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">Rol</th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">Teams</th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {memberships.map((membership) => {
                  const email = emailMap.get(membership.user_id) ?? membership.user_id;
                  const teamNames = teamMemberships
                    .filter((item) => item.user_id === membership.user_id)
                    .map((item) => teamById.get(item.team_id) ?? "Onbekend team");
                  const isAdmin = membership.role === "admin";
                  const displayName = email.split("@")[0] ?? email;
                  const initials = getInitials(displayName);
                  return (
                    <tr key={membership.user_id} className="align-middle">
                      <td className="px-6 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={cn(
                              "flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold",
                              isAdmin
                                ? "bg-primary-container text-primary"
                                : "bg-secondary-container text-secondary",
                            )}
                          >
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-foreground">{displayName}</p>
                            <p className="truncate text-xs text-muted-foreground">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-foreground">
                          {isAdmin ? "Admin" : "Medewerker"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {teamNames.length === 0 ? (
                          <span className="text-sm text-muted-foreground">Geen team</span>
                        ) : (
                          <span className="text-sm font-medium text-foreground">
                            {teamNames.join(" · ")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-container px-2.5 py-1 text-xs font-bold text-tertiary">
                          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                          Actief
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tab: Teams
// -----------------------------------------------------------------------------

function TeamsTab({
  memberships,
  orgSlug,
  teamMemberships,
  teams,
}: {
  memberships: Array<{ user_id: string; role: string }>;
  orgSlug: string;
  teamMemberships: Array<{ user_id: string; team_id: string }>;
  teams: Array<{ id: string; name: string }>;
}) {
  const memberCountByTeam = new Map<string, number>();
  for (const item of teamMemberships) {
    memberCountByTeam.set(item.team_id, (memberCountByTeam.get(item.team_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <DashboardPanel
        description="Teams verdelen medewerkers voor registraties en rapportage binnen deze organisatie."
        icon="group_add"
        iconTone="primary"
        title="Nieuw team"
      >
        <form action={createTeam.bind(null, orgSlug)} className="space-y-5">
          <Field label="Teamnaam" name="name" placeholder="Bijv. LEV Helmond" required />
          <div className="flex justify-end">
            <Button type="submit" variant="brand" className="min-h-11 rounded-full px-6">
              <Icon name="add" className="text-base" />
              Team toevoegen
            </Button>
          </div>
        </form>
      </DashboardPanel>

      <section className="rounded-[2rem] bg-card p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">Teams</h3>
            <p className="text-sm text-muted-foreground">
              {teams.length} {teams.length === 1 ? "team" : "teams"} · {memberships.length}{" "}
              {memberships.length === 1 ? "medewerker" : "medewerkers"} totaal.
            </p>
          </div>
        </header>

        {teams.length === 0 ? (
          <EmptyState
            icon="group_off"
            message="Nog geen teams. Voeg er een toe hierboven voordat medewerkers kunnen registreren."
          />
        ) : (
          <div className="-mx-6 overflow-x-auto sm:-mx-8">
            <table className="w-full min-w-[36rem] text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-6 pb-3 text-xs font-bold uppercase tracking-widest sm:px-8">
                    Team
                  </th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">
                    Medewerkers
                  </th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {teams.map((team) => {
                  const count = memberCountByTeam.get(team.id) ?? 0;
                  return (
                    <tr key={team.id} className="align-middle">
                      <td className="px-6 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="flex h-10 w-10 flex-none items-center justify-center rounded-[0.85rem] bg-tertiary-container text-tertiary"
                          >
                            <Icon name="groups" filled />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-foreground">{team.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              Team binnen {orgSlug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-foreground">
                          <Icon name="person" className="text-sm" filled />
                          {count} {count === 1 ? "medewerker" : "medewerkers"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-container px-2.5 py-1 text-xs font-bold text-tertiary">
                          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                          Actief
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tab: Interventies
// -----------------------------------------------------------------------------

function InterventionsTab({
  categories,
  categoryMap,
  interventions,
  orgSlug,
}: {
  categories: Array<{ id: string; name: string; color: string }>;
  categoryMap: Map<string, { id: string; name: string; color: string }>;
  interventions: Array<{
    category_id: string;
    co2_factor_kg: number;
    id: string;
    name: string;
    social_score_factor: number;
    eco_unit: string;
    social_unit: string;
  }>;
  orgSlug: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          description="Categorieen groeperen interventies en bepalen de kleur in grafieken."
          icon="palette"
          iconTone="primary"
          title="Nieuwe categorie"
        >
          <form action={createCategory.bind(null, orgSlug)} className="space-y-5">
            <Field label="Naam" name="name" placeholder="Bijv. Mobiliteit" required />
            <div className="flex items-end gap-3">
              <Field
                className="w-24"
                defaultValue="#6b7280"
                label="Kleur"
                name="color"
                required
                type="color"
              />
              <p className="pb-2 text-xs text-muted-foreground">
                Deze kleur gebruiken we voor bars, donut-segmenten en cards.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="brand" className="min-h-11 rounded-full px-6">
                <Icon name="add" className="text-base" />
                Categorie toevoegen
              </Button>
            </div>
          </form>
        </DashboardPanel>

        <DashboardPanel
          description="Interventies zijn concrete acties met aparte eco- en sociale eenheden plus factoren per eenheid."
          icon="eco"
          iconTone="tertiary"
          title="Nieuwe interventie"
        >
          {categories.length === 0 ? (
            <EmptyState
              icon="palette"
              message="Maak eerst een categorie aan voordat je interventies toevoegt."
            />
          ) : (
            <form action={createIntervention.bind(null, orgSlug)} className="space-y-5">
              <Field label="Naam" name="name" placeholder="Bijv. Met de fiets" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  emptyOption="Kies categorie..."
                  label="Categorie"
                  name="categoryId"
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />
                <Field
                  helper="Label voor de eco-hoeveelheid bij registratie (bijv. uur, km, kg)."
                  label="Eco-eenheid"
                  name="ecoUnit"
                  placeholder="uur"
                  required
                />
                <Field
                  helper="Label voor de sociale hoeveelheid bij registratie (bijv. personen, uur)."
                  label="Sociale eenheid"
                  name="socialUnit"
                  placeholder="personen"
                  required
                />
              </div>
              <Field
                helper="Hoeveel kg CO2 wordt bespaard per eco-eenheid."
                label="CO2-factor per eco-eenheid"
                min="0"
                name="co2FactorKg"
                placeholder="0.150"
                required
                step="0.001"
                type="number"
              />
              <Field
                helper="Relatieve score per sociale eenheid — jullie bepalen wat een punt inhoudt."
                label="Sociale score-factor per sociale eenheid"
                min="0"
                name="socialScoreFactor"
                placeholder="0"
                required
                step="0.001"
                type="number"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="brand" className="min-h-11 rounded-full px-6">
                  <Icon name="add" className="text-base" />
                  Interventie toevoegen
                </Button>
              </div>
            </form>
          )}
        </DashboardPanel>
      </div>

      <section className="rounded-[2rem] bg-card p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight">Interventies</h3>
            <p className="text-sm text-muted-foreground">
              {categories.length} {categories.length === 1 ? "categorie" : "categorieen"} ·{" "}
              {interventions.length} {interventions.length === 1 ? "interventie" : "interventies"}.
            </p>
          </div>
        </header>

        {interventions.length === 0 ? (
          <EmptyState
            icon="eco"
            message="Nog geen interventies. Maak er een aan via het formulier hierboven."
          />
        ) : (
          <div className="-mx-6 overflow-x-auto sm:-mx-8">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="px-6 pb-3 text-xs font-bold uppercase tracking-widest sm:px-8">
                    Interventie
                  </th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">
                    Categorie
                  </th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">Eco-eenheid</th>
                  <th className="px-3 pb-3 text-xs font-bold uppercase tracking-widest">
                    Sociale eenheid
                  </th>
                  <th className="px-3 pb-3 text-right text-xs font-bold uppercase tracking-widest">
                    CO2 / eco-eenheid
                  </th>
                  <th className="px-3 pb-3 text-right text-xs font-bold uppercase tracking-widest">
                    Score / soc. eenheid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {interventions.map((intervention) => {
                  const category = categoryMap.get(intervention.category_id);
                  const icon = iconForCategory(category?.name ?? "");
                  return (
                    <tr key={intervention.id} className="align-middle">
                      <td className="px-6 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="flex h-10 w-10 flex-none items-center justify-center rounded-[0.85rem] text-white"
                            style={{ backgroundColor: category?.color ?? "#6b7280" }}
                          >
                            <Icon name={icon} filled />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-foreground">
                              {intervention.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              Interventie binnen {orgSlug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {category ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-foreground">
                            <span
                              aria-hidden
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                            Onbekend
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-surface-container-high px-3 py-1 font-mono text-xs text-foreground">
                          {intervention.eco_unit}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-surface-container-high px-3 py-1 font-mono text-xs text-foreground">
                          {intervention.social_unit}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {intervention.co2_factor_kg}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          kg/{intervention.eco_unit}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {intervention.social_score_factor}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          score/{intervention.social_unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------

async function getEmailMap(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return new Map<string, string>();

  const admin = createServiceRoleClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const emails = new Map<string, string>();
  for (const user of data.users) {
    if (uniqueIds.includes(user.id) && user.email) emails.set(user.id, user.email);
  }
  return emails;
}

function getInitials(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  if (!cleaned) return "??";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) {
    return (parts[0] ?? "").slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[1.25rem] bg-surface-container-low p-5 text-sm text-muted-foreground">
      <Icon name={icon} className="text-2xl text-primary" filled />
      <p>{message}</p>
    </div>
  );
}

function Field({
  className,
  helper,
  label,
  name,
  type = "text",
  ...rest
}: {
  className?: string;
  helper?: string;
  label: string;
  name: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)} htmlFor={name}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        id={name}
        name={name}
        type={type}
        className="h-11 w-full rounded-[0.85rem] border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-[border,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        {...rest}
      />
      {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
    </label>
  );
}

function TextareaField({
  className,
  helper,
  label,
  name,
  rows = 3,
  ...rest
}: {
  className?: string;
  helper?: string;
  label: string;
  name: string;
  rows?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)} htmlFor={name}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className="w-full rounded-[0.85rem] border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm outline-none transition-[border,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        {...rest}
      />
      {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
    </label>
  );
}

function SelectField({
  emptyOption,
  helper,
  label,
  name,
  options,
  defaultValue,
}: {
  emptyOption?: string;
  helper?: string;
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={name}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <select
          aria-label={label}
          className="h-11 w-full appearance-none rounded-[0.85rem] border border-border bg-card px-3 pr-9 text-sm font-medium text-foreground shadow-sm outline-none transition-[border,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          defaultValue={defaultValue ?? ""}
          id={name}
          name={name}
        >
          {emptyOption ? <option value="">{emptyOption}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          aria-hidden
          name="expand_more"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
        />
      </div>
      {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
    </label>
  );
}
