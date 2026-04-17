type Params = Promise<{ slug: string }>;

// Intranet embed view. Security headers (CSP frame-ancestors) are set in
// `next.config.ts`. Never read authenticated data here.
export const revalidate = 60;

export default async function EmbedView({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-3 p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Intranet embed - {slug}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Eco-sociaal Dashboard</h1>
      <p className="text-muted-foreground">
        Placeholder voor de intranet-embed. Toont alleen publieke cijfers.
      </p>
    </main>
  );
}
