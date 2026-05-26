import Link from "next/link";
import { notFound } from "next/navigation";

import { tenantPageMainClassName } from "@/components/app-shell/tenant-page-layout";
import { GeneralTab } from "@/components/settings/general-tab";
import { InterventionsTab } from "@/components/settings/interventions-tab";
import { MembersTab } from "@/components/settings/members-tab";
import { TeamsTab } from "@/components/settings/teams-tab";
import { Icon } from "@/components/ui/icon";
import { getOrgContextBySlug } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";
import { getEmailMap } from "@/lib/user-emails";
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
    <main className={tenantPageMainClassName}>
      <header className="w-full space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {context.org.name}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Instellingen
        </h1>
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
          <TeamsTab orgSlug={context.org.slug} teamMemberships={teamMemberships} teams={teams} />
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
