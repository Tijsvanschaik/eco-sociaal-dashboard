import { PublicDashboardView } from "@/components/public-dashboard-view";
import { getPublicDashboardBySlug } from "@/lib/public-dashboard";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export default async function PublicShareLinkPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const dashboard = await getPublicDashboardBySlug(supabase, slug);
  if (!dashboard) notFound();

  return (
    <PublicDashboardView
      categories={dashboard.categories}
      mode="public"
      teams={dashboard.teams}
      totals={dashboard.totals}
      timeseries={dashboard.timeseries}
    />
  );
}
