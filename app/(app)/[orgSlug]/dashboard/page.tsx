import { InternalDashboard } from "@/components/internal-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getTenantDashboardData } from "@/lib/tenant-dashboard-data";
import { notFound } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;
type SearchParams = Promise<{
  period?: string | string[];
  team?: string | string[];
}>;

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug } = await params;
  const filters = await searchParams;
  const supabase = await createClient();
  const data = await getTenantDashboardData(supabase, orgSlug, filters);
  if (!data) notFound();

  return (
    <InternalDashboard
      feedFilters={data.feedFilters}
      orgSlug={orgSlug}
      orgName={data.context.org.name}
      recentRegistrations={data.recentRegistrations}
      showTeamFilter={data.teams.length > 0}
      snapshot={data.snapshot}
      teams={data.teams}
      timeseries={data.timeseries}
      year={data.year}
    />
  );
}
