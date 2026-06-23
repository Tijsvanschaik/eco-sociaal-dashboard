"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { RegistrationListScope } from "@/lib/registrations/list-filters";
import { cn } from "@/lib/utils";

type RegistrationsScopeToggleProps = {
  orgSlug: string;
  scope: RegistrationListScope;
  selectedTeamId: string | null;
  year: number;
};

export function RegistrationsScopeToggle({
  orgSlug,
  scope,
  selectedTeamId,
  year,
}: RegistrationsScopeToggleProps) {
  const router = useRouter();

  function navigate(nextScope: RegistrationListScope) {
    const params = new URLSearchParams();
    params.set("year", String(year));
    if (selectedTeamId) params.set("team", selectedTeamId);
    if (nextScope === "mine") params.set("scope", "mine");
    router.push(`/${orgSlug}/activiteiten?${params.toString()}`);
  }

  return (
    <fieldset
      aria-label="Filter op eigenaar"
      className="flex w-full rounded-full border-0 bg-card p-1 shadow-sm sm:inline-flex sm:w-auto"
    >
      <ScopeButton
        active={scope === "mine"}
        label="Mijn registraties"
        onClick={() => navigate("mine")}
      />
      <ScopeButton
        active={scope === "all"}
        label="Alle registraties"
        onClick={() => navigate("all")}
      />
    </fieldset>
  );
}

function ScopeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "brand" : "ghost"}
      className={cn(
        "min-h-9 flex-1 rounded-full px-4 text-sm font-semibold sm:flex-none",
        !active && "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
