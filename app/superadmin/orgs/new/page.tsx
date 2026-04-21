import Link from "next/link";

import { SuperadminOrgForm } from "@/components/superadmin-org-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSuperadminOrgPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Nieuwe organisatie</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Maak een nieuwe tenant aan en verstuur meteen een magic-link naar de eerste admin.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/superadmin">Terug</Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tenant aanmaken</CardTitle>
          <CardDescription>
            De eerste admin krijgt na opslaan direct een login-link per e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuperadminOrgForm />
        </CardContent>
      </Card>
    </main>
  );
}
