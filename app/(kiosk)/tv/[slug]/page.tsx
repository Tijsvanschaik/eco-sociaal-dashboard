import { PublicSurface } from "@/components/public/public-surface";
import { getPublicDashboardBySlug } from "@/lib/public-dashboard";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

// Refresh the full page every 60s so the TV always shows live data.
// We hint the browser via a meta refresh as a belt-and-braces fallback for
// browsers that ignore Next.js revalidate semantics on long-lived kiosk tabs.
export const revalidate = 60;

export default async function TvScreen({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const dashboard = await getPublicDashboardBySlug(supabase, slug);
  if (!dashboard) notFound();

  return (
    <>
      <meta content="60" httpEquiv="refresh" />
      <PublicSurface data={dashboard} mode="tv" />
    </>
  );
}
