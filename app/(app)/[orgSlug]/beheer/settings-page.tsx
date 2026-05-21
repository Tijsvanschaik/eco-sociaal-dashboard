import Link from "next/link";
import { notFound } from "next/navigation";

import { GeneralTab } from "@/components/settings/general-tab";
import { InterventionsTab } from "@/components/settings/interventions-tab";
import { MembersTab } from "@/components/settings/members-tab";
import { TeamsTab } from "@/components/settings/teams-tab";
import { Icon } from "@/components/ui/icon";
import { getOrgContextBySlug } from "@/lib/organizations";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Params = Promise<{ orgSlug: string }>;
type SearchParams = Promise<{ tab?: string | string[] }>;

const TAB_IDS = ["algemeen", "medewerkers", "teams", "interventies"] as const;
type TabId = (typeof TAB_IDS)[number];

const TABS: Array<{ id: TabId; icon: string; label: string }> = [
  {
    id: "algemeen",
    icon: "tune",
    label: "Algemeen",
  },
  {
    id: "medewerkers",
    icon: "group",
    label: "Medewerkers",
  },
  {
    id: "teams",
    icon: "groups",
    label: "Teams",
  },
  {
    id: "interventies",
    icon: "eco",
    label: "Interventies",
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
      supabase
        .from("teams")
        .select("id, name")
        .eq("org_id", context.org.id)
        .eq("is_archived", false)
        .order("name"),
      supabase
        .from("categories")
        .select("id, name, color")
        .eq("org_id", context.org.id)
        .eq("is_archived", false)
        .order("name"),
      supabase
        .from("interventions")
        .select("id, name, category_id, eco_unit, social_unit, co2_factor_kg, social_score_factor")
        .eq("org_id", context.org.id)
        .eq("is_archived", false)
        .order("name"),
      supabase.from("memberships").select("user_id, role").eq("org_id", context.org.id),
      supabase.from("team_memberships").select("user_id, team_id").eq("org_id", context.org.id),
    ]);

  const teams = teamsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const interventions = interventionsQuery.data ?? [];
  const memberships = membershipsQuery.data ?? [];
  const teamMemberships = teamMembershipsQuery.data ?? [];
  const userIds = memberships.map((membership) => membership.user_id);
  const emailMap = await getEmailMap(userIds);

  return (
    <main className="relative min-h-dvh w-full min-w-0 space-y-8 bg-[color-mix(in_srgb,var(--card)_92%,var(--background)_8%)] px-10 pt-6 pb-28 sm:pt-10 sm:pb-28 md:py-10">
      <header className="w-full space-y-3 px-6 pt-6 sm:px-10 sm:pt-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {context.org.name}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">Instellingen</h1>
      </header>

      <SettingsTabsNav activeTab={activeTab} orgSlug={context.org.slug} />

      <div className="space-y-6">
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
            emailByUserId={Object.fromEntries(emailMap)}
            memberships={memberships}
            orgSlug={context.org.slug}
            teamMemberships={teamMemberships}
            teams={teams}
          />
        ) : null}
        {activeTab === "teams" ? (
          <TeamsTab
            orgSlug={context.org.slug}
            teamMemberships={teamMemberships}
            teams={teams}
          />
        ) : null}
        {activeTab === "interventies" ? (
          <InterventionsTab
            categories={categories}
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
  return (
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
  );
}

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
