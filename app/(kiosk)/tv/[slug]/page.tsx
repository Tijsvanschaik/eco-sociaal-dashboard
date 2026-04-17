type Params = Promise<{ slug: string }>;

// Refresh the full page every 60s so the TV always shows live data.
// We also hint the browser via a meta refresh as a belt-and-braces fallback.
export const revalidate = 60;

export default async function TvScreen({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-12 text-center">
      <meta httpEquiv="refresh" content="60" />
      <p className="text-sm uppercase tracking-widest text-muted-foreground">TV-modus - {slug}</p>
      <h1 className="text-balance text-6xl font-semibold tracking-tight">Eco-sociaal Dashboard</h1>
      <p className="max-w-2xl text-pretty text-xl text-muted-foreground">
        Placeholder voor het TV-scherm. Wordt elke 60 seconden ververst.
      </p>
    </main>
  );
}
