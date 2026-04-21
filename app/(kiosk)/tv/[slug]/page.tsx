import { PublicDashboardView } from "@/components/public-dashboard-view";
import { getPublicDashboardBySlug } from "@/lib/public-dashboard";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

// Refresh the full page every 60s so the TV always shows live data.
// We also hint the browser via a meta refresh as a belt-and-braces fallback.
export const revalidate = 60;

export default async function TvScreen({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const dashboard = await getPublicDashboardBySlug(supabase, slug);
  if (!dashboard) notFound();

  return (
    <PublicDashboardView
      categories={dashboard.categories}
      mode="tv"
      teams={dashboard.teams}
      totals={dashboard.totals}
      timeseries={dashboard.timeseries}
    />
  );
}
