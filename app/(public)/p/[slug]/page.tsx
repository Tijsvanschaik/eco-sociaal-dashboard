type Params = Promise<{ slug: string }>;

export default async function PublicShareLinkPage({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Publieke dashboard</h1>
      <p className="text-muted-foreground">
        Placeholder voor share-link <span className="font-mono">{slug}</span>. Leest uitsluitend uit
        de publieke Postgres-views.
      </p>
    </main>
  );
}
