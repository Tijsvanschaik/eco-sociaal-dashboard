import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-start justify-center gap-6 px-6 py-12">
      <p className="text-sm font-medium text-muted-foreground">LEF Groep - MVP</p>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Eco-sociaal Dashboard
      </h1>
      <p className="max-w-prose text-pretty text-lg text-muted-foreground">
        Registreer eco-sociale activiteiten, bereken de CO2-impact en zie hoe jullie Earth Overshoot
        Day opschuift.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/login">Inloggen</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/p/demo">Bekijk demo-dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
