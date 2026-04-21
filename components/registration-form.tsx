"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type RegistrationInput, registrationSchema } from "@/lib/registrations/schema";
import { cn } from "@/lib/utils";

import { createRegistration } from "@/app/(app)/[orgSlug]/registratie/actions";

const selectClasses =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

type TeamOption = {
  id: string;
  locationName: string;
  name: string;
};

type InterventionOption = {
  categoryName: string;
  factorKg: number;
  id: string;
  name: string;
  unit: string;
};

type UiState =
  | { status: "idle" }
  | { message: string; status: "error" }
  | { message: string; status: "success" };

function todayAsInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RegistrationForm({
  interventions,
  orgSlug,
  teams,
}: {
  interventions: InterventionOption[];
  orgSlug: string;
  teams: TeamOption[];
}) {
  const router = useRouter();
  const [state, setState] = useState<UiState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo<RegistrationInput>(
    () => ({
      happenedOn: todayAsInputValue(),
      interventionId: interventions[0]?.id ?? "",
      note: "",
      quantity: 0,
      teamId: teams[0]?.id ?? "",
    }),
    [interventions, teams],
  );

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
    mode: "onChange",
  });

  const selectedIntervention = interventions.find(
    (intervention) => intervention.id === form.watch("interventionId"),
  );
  const canSubmit = teams.length > 0 && interventions.length > 0;

  function onSubmit(values: RegistrationInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("teamId", values.teamId);
      formData.set("interventionId", values.interventionId);
      formData.set("quantity", String(values.quantity));
      formData.set("happenedOn", values.happenedOn);
      formData.set("note", values.note ?? "");

      const result = await createRegistration(orgSlug, formData);
      if (result.status === "ok") {
        setState({ status: "success", message: result.message });
        form.reset({
          ...values,
          happenedOn: todayAsInputValue(),
          note: "",
          quantity: 0,
        });
        router.refresh();
        return;
      }

      setState({ status: "error", message: result.message });
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <FormControl>
                <select {...field} className={cn(selectClasses, "min-h-11 text-base md:text-sm")}>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} · {team.locationName}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interventionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interventie</FormLabel>
              <FormControl>
                <select {...field} className={cn(selectClasses, "min-h-11 text-base md:text-sm")}>
                  {interventions.map((intervention) => (
                    <option key={intervention.id} value={intervention.id}>
                      {intervention.categoryName} · {intervention.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              {selectedIntervention && (
                <FormDescription>
                  Eenheid: {selectedIntervention.unit}. Factor: {selectedIntervention.factorKg} kg
                  CO2 per
                  {` ${selectedIntervention.unit}`}.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoeveelheid</FormLabel>
                <FormControl>
                  <Input min="0.001" step="0.001" type="number" inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="happenedOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datum</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notitie (optioneel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Bijvoorbeeld: 4 km met de fiets in plaats van de auto."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {state.status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}
        {state.status === "success" && (
          <p aria-live="polite" className="text-sm text-primary">
            {state.message}
          </p>
        )}

        <Button
          className="min-h-11 w-full"
          disabled={isPending || !form.formState.isValid || !canSubmit}
        >
          {isPending ? "Opslaan..." : "Registratie opslaan"}
        </Button>
      </form>
    </Form>
  );
}
