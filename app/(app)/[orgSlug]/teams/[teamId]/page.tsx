import { TeamDetailDashboard } from "@/components/team/team-detail-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getTenantTeamDetailData } from "@/lib/tenant-team-data";
import { notFound } from "next/navigation";

type Params = Promise<{ orgSlug: string; teamId: string }>;

export default async function TeamDetailPage({ params }: { params: Params }) {
  const { orgSlug, teamId } = await params;
  const supabase = await createClient();
  const data = await getTenantTeamDetailData(supabase, orgSlug, teamId);
  if (!data) notFound();

  return (
    <TeamDetailDashboard
      orgSlug={orgSlug}
      teamName={data.team.name}
      year={data.year}
      snapshot={data.snapshot}
      timeseries={data.timeseries}
      recentRegistrations={data.recentRegistrations}
    />
  );
}
