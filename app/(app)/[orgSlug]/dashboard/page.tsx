type Params = Promise<{ orgSlug: string }>;

export default async function DashboardPage({ params }: { params: Params }) {
  const { orgSlug } = await params;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Placeholder voor organisatie <span className="font-mono">{orgSlug}</span>. KPI-kaarten, Top
        Teams en impact-widgets komen hier in een latere fase.
      </p>
    </main>
  );
}
