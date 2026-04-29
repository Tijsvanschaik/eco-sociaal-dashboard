import { PublicSurface } from "@/components/public/public-surface";
import { parseEmbedQuery } from "@/lib/embed/query-schema";
import { getPublicDashboardBySlug } from "@/lib/public-dashboard";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Intranet embed view. Security headers (CSP frame-ancestors) zijn gezet in
// `next.config.ts`. Deze surface leest geen authenticated data.
export const revalidate = 60;

export default async function EmbedView({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const rawQuery = await searchParams;
  const supabase = await createClient();
  const dashboard = await getPublicDashboardBySlug(supabase, slug);
  if (!dashboard) notFound();

  const { mode, screens, intervalMs } = parseEmbedQuery(rawQuery);

  return (
    <PublicSurface
      data={dashboard}
      intervalMs={intervalMs}
      mode={mode === "rotate" ? "embed-rotate" : "embed-stack"}
      slideOrder={screens}
    />
  );
}
