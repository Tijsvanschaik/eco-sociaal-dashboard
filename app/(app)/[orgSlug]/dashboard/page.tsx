import { InternalDashboard } from "@/components/internal-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getTenantDashboardData } from "@/lib/tenant-dashboard-data";
import { parseDashboardPeriod } from "@/lib/timeseries";
import { notFound } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;
type SearchParams = Promise<{ period?: string }>;

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orgSlug } = await params;
  const { period: rawPeriod } = await searchParams;
  const period = parseDashboardPeriod(rawPeriod);
  const supabase = await createClient();
  const data = await getTenantDashboardData(supabase, orgSlug, period);
  if (!data) notFound();

  return (
    <InternalDashboard
      categoryTimeseries={data.categoryTimeseries}
      orgName={data.context.org.name}
      orgSlug={data.context.org.slug}
      period={data.period}
      recentRegistrations={data.recentRegistrations}
      roleLabel={data.context.role === "admin" ? "admin" : "medewerker"}
      snapshot={data.snapshot}
      timeseries={data.timeseries}
    />
  );
}
