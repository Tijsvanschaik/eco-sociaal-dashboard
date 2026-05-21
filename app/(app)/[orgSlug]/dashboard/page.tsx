import { InternalDashboard } from "@/components/internal-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getTenantDashboardData } from "@/lib/tenant-dashboard-data";
import { notFound } from "next/navigation";

type Params = Promise<{ orgSlug: string }>;

export default async function DashboardPage({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const data = await getTenantDashboardData(supabase, orgSlug);
  if (!data) notFound();

  return (
    <InternalDashboard
      orgSlug={orgSlug}
      orgName={data.context.org.name}
      year={data.year}
      recentRegistrations={data.recentRegistrations}
      snapshot={data.snapshot}
      timeseries={data.timeseries}
    />
  );
}
