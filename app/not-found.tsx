import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-6 py-12">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Pagina niet gevonden</h1>
      <p className="text-muted-foreground">De pagina die je zocht bestaat niet of is verplaatst.</p>
      <Button asChild>
        <Link href="/">Terug naar start</Link>
      </Button>
    </main>
  );
}
