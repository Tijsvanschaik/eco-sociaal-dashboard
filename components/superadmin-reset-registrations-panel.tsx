"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { superadminClearOrgRegistrations } from "@/app/superadmin/orgs/[orgId]/actions";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Button } from "@/components/ui/button";

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
    <DashboardPanel
      className="border border-destructive/30"
      description="Verwijdert alle registraties van deze tenant. Leden, teams en activiteiten blijven bestaan. Storage-foto's worden niet automatisch opgeruimd."
      icon="warning"
      iconTone="neutral"
      title="Gevarenzone"
    >
      <div className="space-y-4 rounded-[1.5rem] bg-card p-5 shadow-[0_20px_40px_rgba(54,50,45,0.04)]">
        <p className="text-sm text-muted-foreground">
          Huidig aantal registraties:{" "}
          <span className="font-semibold text-foreground">{registrationCount}</span>
        </p>

        {!armed ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-destructive/60 text-destructive hover:bg-destructive/10"
            onClick={() => {
              setMessage(null);
              setArmed(true);
            }}
          >
            Alle registraties wissen…
          </Button>
        ) : (
          <div className="space-y-3 rounded-[1.25rem] border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive">
              Dit kan niet ongedaan worden gemaakt. Weet je het zeker?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => setArmed(false)}
                disabled={pending}
              >
                Annuleren
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-full"
                onClick={runClear}
                disabled={pending}
              >
                {pending ? "Bezig…" : "Ja, alles wissen"}
              </Button>
            </div>
          </div>
        )}

        {message ? <p className="text-sm text-foreground">{message}</p> : null}
      </div>
    </DashboardPanel>
  );
}
