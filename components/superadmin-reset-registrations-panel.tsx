"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { superadminClearOrgRegistrations } from "@/app/superadmin/orgs/[orgId]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  orgId: string;
  registrationCount: number;
};

export function SuperadminResetRegistrationsPanel({ orgId, registrationCount }: Props) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const runClear = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await superadminClearOrgRegistrations(orgId);
      if (result.ok) {
        setArmed(false);
        setMessage("Alle registraties zijn verwijderd.");
        router.refresh();
        return;
      }
      setMessage(result.message);
    });
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Gevarenzone</CardTitle>
        <CardDescription>
          Verwijdert <strong>alle registraties</strong> van deze tenant. Leden, teams en
          interventies blijven bestaan. Storage-foto’s aan registraties worden niet automatisch uit
          de bucket gehaald.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Huidig aantal registraties:{" "}
          <span className="font-medium text-foreground">{registrationCount}</span>
        </p>

        {!armed ? (
          <Button
            type="button"
            variant="outline"
            className="border-destructive/60 text-destructive hover:bg-destructive/10"
            onClick={() => {
              setMessage(null);
              setArmed(true);
            }}
          >
            Alle registraties wissen…
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              Dit kan niet ongedaan worden gemaakt. Weet je het zeker?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setArmed(false)}
                disabled={pending}
              >
                Annuleren
              </Button>
              <Button type="button" variant="destructive" onClick={runClear} disabled={pending}>
                {pending ? "Bezig…" : "Ja, alles wissen"}
              </Button>
            </div>
          </div>
        )}

        {message && <p className="text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}
