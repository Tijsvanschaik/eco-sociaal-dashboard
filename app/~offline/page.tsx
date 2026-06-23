import Link from "next/link";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Geen verbinding</p>
      <h1 className="text-2xl font-bold text-foreground">Je bent offline</h1>
      <p className="max-w-sm text-muted-foreground">
        Controleer je internetverbinding en probeer het opnieuw. Nieuwe registraties kun je pas
        toevoegen wanneer je weer online bent.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        Opnieuw proberen
      </Link>
    </main>
  );
}
