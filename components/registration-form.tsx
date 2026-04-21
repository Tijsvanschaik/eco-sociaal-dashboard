"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { iconForCategory } from "@/lib/category-icons";
import {
  deleteRegistrationPhoto,
  uploadRegistrationPhoto,
  validatePhotoFile,
} from "@/lib/registrations/photo-upload";
import {
  PHOTO_UPLOAD_ACCEPT,
  type RegistrationInput,
  registrationSchema,
} from "@/lib/registrations/schema";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { createRegistration } from "@/app/(app)/[orgSlug]/registratie/actions";

/** Zelfde oppervlak als het hoeveelheidveld: geen aparte kaart, `bg-input`. */
const inputSurfaceClassName =
  "rounded-[1rem] border-0 bg-input shadow-none focus-visible:ring-2 focus-visible:ring-ring/50";

type TeamOption = {
  id: string;
  name: string;
};

type InterventionOption = {
  categoryColor: string | null;
  categoryId?: string;
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

type PhotoState =
  | { status: "idle" }
  | { status: "uploading"; previewUrl: string }
  | { status: "ready"; path: string; previewUrl: string }
  | { status: "error"; message: string };

function todayAsInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RegistrationForm({
  interventions,
  orgId,
  orgSlug,
  teams,
  userId,
}: {
  interventions: InterventionOption[];
  orgId: string;
  orgSlug: string;
  teams: TeamOption[];
  userId: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<UiState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();
  const [photo, setPhoto] = useState<PhotoState>({ status: "idle" });
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const defaultValues = useMemo<RegistrationInput>(
    () => ({
      happenedOn: todayAsInputValue(),
      interventionId: interventions[0]?.id ?? "",
      note: "",
      photoPath: undefined,
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

  const selectedInterventionId = form.watch("interventionId");
  const selectedIntervention = interventions.find(
    (intervention) => intervention.id === selectedInterventionId,
  );
  const selectedTeamId = form.watch("teamId");
  const canSubmit = teams.length > 0 && interventions.length > 0 && photo.status !== "uploading";

  // Revoke object URLs on unmount / change to prevent memory leaks.
  useEffect(() => {
    const current =
      photo.status === "uploading" || photo.status === "ready" ? photo.previewUrl : null;
    return () => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
    };
  }, [photo]);

  async function handlePhotoChange(file: File | null) {
    if (!file) return;

    const validation = validatePhotoFile(file);
    if (!validation.ok) {
      setPhoto({ status: "error", message: validation.message });
      return;
    }

    // Voorkom stapelen van oude uploads: als er al eentje klaar staat, gooien we
    // die eerst opzij (best effort delete).
    if (photo.status === "ready") {
      await deleteRegistrationPhoto({ path: photo.path, supabase: getSupabase() });
    }

    const previewUrl = URL.createObjectURL(file);
    setPhoto({ status: "uploading", previewUrl });

    const result = await uploadRegistrationPhoto({
      file,
      orgId,
      supabase: getSupabase(),
      userId,
    });

    if (result.status === "error") {
      URL.revokeObjectURL(previewUrl);
      setPhoto({ status: "error", message: result.message });
      return;
    }

    setPhoto({ status: "ready", path: result.path, previewUrl });
    form.setValue("photoPath", result.path, { shouldValidate: true, shouldDirty: true });
  }

  async function handleRemovePhoto() {
    if (photo.status === "ready") {
      await deleteRegistrationPhoto({ path: photo.path, supabase: getSupabase() });
    }
    if ("previewUrl" in photo && photo.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhoto({ status: "idle" });
    form.setValue("photoPath", undefined, { shouldValidate: true, shouldDirty: true });
  }

  function onSubmit(values: RegistrationInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("teamId", values.teamId);
      formData.set("interventionId", values.interventionId);
      formData.set("quantity", String(values.quantity));
      formData.set("happenedOn", values.happenedOn);
      formData.set("note", values.note ?? "");
      if (values.photoPath) {
        formData.set("photoPath", values.photoPath);
      }

      const result = await createRegistration(orgSlug, formData);
      if (result.status === "ok") {
        setState({ status: "success", message: result.message });
        form.reset({
          ...values,
          happenedOn: todayAsInputValue(),
          note: "",
          photoPath: undefined,
          quantity: 0,
        });
        setPhoto({ status: "idle" });
        router.refresh();
        return;
      }

      setState({ status: "error", message: result.message });
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {/* Stap 1 — activiteit */}
        <FormField
          control={form.control}
          name="interventionId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <StepHeader number={1} title="Kies je activiteit" />
              <FormControl>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {interventions.map((intervention) => (
                    <li key={intervention.id}>
                      <InterventionCard
                        intervention={intervention}
                        onSelect={() => field.onChange(intervention.id)}
                        selected={field.value === intervention.id}
                      />
                    </li>
                  ))}
                </ul>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stap 2 + 3 — hoeveelheid + wanneer (naast elkaar op desktop) */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <StepHeader
                  number={2}
                  subtitle="Hoeveel van de activiteit heb je gedaan?"
                  title="Hoeveel heb je hiervan gedaan?"
                />
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input
                      aria-label="Hoeveelheid"
                      className={cn(
                        "h-14 min-w-0 flex-1 text-2xl font-extrabold",
                        inputSurfaceClassName,
                      )}
                      inputMode="decimal"
                      min="0.001"
                      step="0.001"
                      type="number"
                      {...field}
                    />
                    {selectedIntervention ? (
                      <span className="flex min-w-[4rem] flex-col items-center justify-center px-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        <span>{selectedIntervention.unit}</span>
                        <span className="mt-0.5 text-xs font-medium normal-case text-muted-foreground/70">
                          × {formatFactor(selectedIntervention.factorKg)} kg CO₂
                        </span>
                      </span>
                    ) : null}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="happenedOn"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <StepHeader
                  number={3}
                  subtitle="Op welke datum is de activiteit uitgevoerd."
                  title="Wanneer?"
                />
                <FormControl>
                  <Input
                    className={cn("h-14 w-full text-base font-medium", inputSurfaceClassName)}
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Stap 4 — team (alleen bij meerdere teams) */}
        {teams.length > 1 ? (
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <StepHeader number={4} title="Voor welk team?" />
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team) => {
                      const selected = field.value === team.id;
                      return (
                        <button
                          key={team.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => field.onChange(team.id)}
                          className={cn(
                            "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                            selected
                              ? "border-primary bg-primary-container text-on-primary-container"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          <Icon
                            name={selected ? "check_circle" : "groups"}
                            className="text-base"
                            filled={selected}
                          />
                          {team.name}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <input type="hidden" {...form.register("teamId")} value={selectedTeamId} />
        )}

        {/* Stap 5 / 4 — notitie */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <StepHeader
                number={teams.length > 1 ? 5 : 4}
                optional
                title="Notitie"
                subtitle="Deel kort wat je hebt gedaan of wat je opviel."
              />
              <FormControl>
                <Textarea
                  className={cn("min-h-24 w-full text-base md:text-base", inputSurfaceClassName)}
                  placeholder="Bijvoorbeeld: 4 km met de fiets in plaats van de auto."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stap 6 / 5 — foto */}
        <PhotoField
          number={teams.length > 1 ? 6 : 5}
          onChange={handlePhotoChange}
          onRemove={handleRemovePhoto}
          state={photo}
        />

        {state.status === "error" ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[1rem] bg-destructive/10 p-3 text-sm text-destructive"
          >
            <Icon name="error" className="text-base" filled />
            <span>{state.message}</span>
          </div>
        ) : null}
        {state.status === "success" ? (
          <div
            aria-live="polite"
            className="flex items-start gap-2 rounded-[1rem] bg-tertiary-container p-3 text-sm font-semibold text-on-tertiary-container"
          >
            <Icon name="check_circle" className="text-base" filled />
            <span>{state.message}</span>
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            variant="brand"
            size="lg"
            className="min-h-12 w-full max-w-sm rounded-full text-base font-bold"
            disabled={isPending || !form.formState.isValid || !canSubmit}
          >
            <Icon name="eco" filled className="mr-1 text-lg" />
            {isPending ? "Opslaan..." : "Impact opslaan"}
            <Icon name="arrow_forward" className="ml-1 text-lg" />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function StepHeader({
  number,
  optional,
  subtitle,
  title,
}: {
  number: number;
  optional?: boolean;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="space-y-1">
      <FormLabel className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg font-extrabold text-foreground sm:text-xl">
        <span className="text-primary">{number}.</span>
        <span>{title}</span>
        {optional ? (
          <span className="text-sm font-semibold text-muted-foreground sm:text-base">
            (Optioneel)
          </span>
        ) : null}
      </FormLabel>
      {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

function InterventionCard({
  intervention,
  onSelect,
  selected,
}: {
  intervention: InterventionOption;
  onSelect: () => void;
  selected: boolean;
}) {
  const color = intervention.categoryColor ?? "#af1e7b";
  const icon = iconForCategory(intervention.categoryName);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full min-h-[7.5rem] w-full flex-col items-center justify-between gap-2 rounded-[1.25rem] border-2 bg-card p-3 text-center transition-all",
        selected
          ? "shadow-[0_12px_30px_rgba(54,50,45,0.12)]"
          : "border-transparent hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(54,50,45,0.08)]",
      )}
      style={{
        borderColor: selected ? color : undefined,
        backgroundColor: selected ? `${color}1a` : undefined,
      }}
    >
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] text-foreground transition-transform group-hover:scale-105"
        style={{
          backgroundColor: selected ? color : `${color}22`,
          color: selected ? "#fff" : color,
        }}
      >
        <Icon name={icon} filled className="text-2xl" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="line-clamp-2 text-sm font-extrabold leading-tight text-foreground">
          {intervention.name}
        </span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {intervention.categoryName}
        </span>
      </span>
    </button>
  );
}

function PhotoField({
  number,
  onChange,
  onRemove,
  state,
}: {
  number: number;
  onChange: (file: File | null) => void;
  onRemove: () => void;
  state: PhotoState;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasPreview = state.status === "uploading" || state.status === "ready";

  return (
    <div className="space-y-3">
      <StepHeader
        number={number}
        optional
        subtitle="Laat de community zien wat je hebt bereikt."
        title="Heb je een foto?"
      />
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange(file);
          // Laat het input-element leeg achter zodat dezelfde file opnieuw
          // kiezen wel een change-event triggert.
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      {hasPreview ? (
        <div className="relative overflow-hidden rounded-[1.25rem] bg-surface-container-low">
          <img
            alt="Voorbeeld van je foto"
            src={state.previewUrl}
            className="h-56 w-full object-cover"
          />
          {state.status === "uploading" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Icon name="progress_activity" className="animate-spin text-base" />
                Uploaden…
              </div>
            </div>
          ) : (
            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
                onClick={() => inputRef.current?.click()}
              >
                <Icon name="cached" className="text-base" />
                Andere foto
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full shadow-sm"
                onClick={onRemove}
              >
                <Icon name="close" className="text-base" />
                <span className="sr-only">Foto verwijderen</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border-2 border-dashed border-muted-foreground/30 bg-surface-container-low px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary-container/30"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <Icon name="photo_camera" filled className="text-2xl" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Klik om een foto te uploaden
          </span>
          <span className="text-xs text-muted-foreground">JPG, PNG of WEBP · max 5 MB</span>
        </button>
      )}
      {state.status === "error" ? (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <Icon name="error" className="text-base" filled />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function formatFactor(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(value);
}
