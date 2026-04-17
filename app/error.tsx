"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">Er ging iets mis</h1>
      <p className="text-muted-foreground">
        We konden deze pagina niet laden. Probeer het opnieuw; als het blijft gebeuren, neem contact
        op met je beheerder.
      </p>
      <Button onClick={reset}>Opnieuw proberen</Button>
    </main>
  );
}
