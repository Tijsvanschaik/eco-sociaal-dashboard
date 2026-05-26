"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createRegistration } from "@/app/(app)/[orgSlug]/registratie/actions";
import { updateRegistration } from "@/app/(app)/[orgSlug]/registraties/actions";
import { ImpactPreview } from "@/components/registration/impact-preview";
import { InterventionPicker } from "@/components/registration/intervention-picker";
import { PhotoField } from "@/components/registration/photo-field";
import { QuantityFields } from "@/components/registration/quantity-fields";
import { RegistrationDetailsFields } from "@/components/registration/registration-details-fields";
import type { FormUiState, PhotoState } from "@/components/registration/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import {
  deleteRegistrationPhoto,
  uploadRegistrationPhoto,
  validatePhotoFile,
} from "@/lib/registrations/photo-upload";
import { type RegistrationInput, registrationSchema } from "@/lib/registrations/schema";
import { createClient } from "@/lib/supabase/client";
import type { InterventionOption, TeamOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

function todayAsInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

type RegistrationFormProps = {
  interventions: InterventionOption[];
  orgId: string;
  orgSlug: string;
  teams: TeamOption[];
  userId: string;
  mode?: "create" | "edit";
  registrationId?: string;
  initialValues?: RegistrationInput;
  initialPhotoUrl?: string | null;
};

export function RegistrationForm({
  interventions,
  initialPhotoUrl = null,
  initialValues,
  mode = "create",
  orgId,
  orgSlug,
  registrationId,
  teams,
  userId,
}: RegistrationFormProps) {
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const initialPhotoPathRef = useRef<string | null>(initialValues?.photoPath ?? null);
  const [state, setState] = useState<FormUiState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();
  const [photo, setPhoto] = useState<PhotoState>(() => {
    if (mode === "edit" && initialValues?.photoPath && initialPhotoUrl) {
      return {
        status: "ready",
        path: initialValues.photoPath,
        previewUrl: initialPhotoUrl,
      };
    }
    return { status: "idle" };
  });
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const defaultValues = useMemo<RegistrationInput>(
    () =>
      initialValues ?? {
        happenedOn: todayAsInputValue(),
        interventionId: interventions[0]?.id ?? "",
        note: "",
        photoPath: undefined,
        quantity: 0,
        socialQuantity: 0,
        teamId: teams[0]?.id ?? "",
      },
    [initialValues, interventions, teams],
  );

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
    mode: "onChange",
  });

  const selectedInterventionId = form.watch("interventionId");
  const quantity = form.watch("quantity");
  const socialQuantity = form.watch("socialQuantity");
  const selectedIntervention = interventions.find(
    (intervention) => intervention.id === selectedInterventionId,
  );
  const selectedTeamId = form.watch("teamId");
  const canSubmit = teams.length > 0 && interventions.length > 0 && photo.status !== "uploading";
  const submitDisabled = isPending || !form.formState.isValid || !canSubmit;
  const isEdit = mode === "edit";

  useEffect(() => {
    const current =
      photo.status === "uploading" || photo.status === "ready" ? photo.previewUrl : null;
    return () => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
    };
  }, [photo]);

  async function deleteUploadedPhoto(path: string) {
    if (path === initialPhotoPathRef.current) return;
    await deleteRegistrationPhoto({ path, supabase: getSupabase() });
  }

  async function handlePhotoChange(file: File | null) {
    if (!file) return;

    const validation = validatePhotoFile(file);
    if (!validation.ok) {
      setPhoto({ status: "error", message: validation.message });
      return;
    }

    if (photo.status === "ready") {
      await deleteUploadedPhoto(photo.path);
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
      await deleteUploadedPhoto(photo.path);
    }
    if ("previewUrl" in photo && photo.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhoto({ status: "idle" });
    form.setValue("photoPath", undefined, { shouldValidate: true, shouldDirty: true });
  }

  function handleRegisterAnother() {
    setState({ status: "idle" });
    form.reset(defaultValues);
    setPhoto({ status: "idle" });
    formTopRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  function onSubmit(values: RegistrationInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("teamId", values.teamId);
      formData.set("interventionId", values.interventionId);
      formData.set("quantity", String(values.quantity));
      formData.set("socialQuantity", String(values.socialQuantity));
      formData.set("happenedOn", values.happenedOn);
      formData.set("note", values.note ?? "");
      if (values.photoPath) {
        formData.set("photoPath", values.photoPath);
      }

      if (isEdit && registrationId) {
        formData.set("registrationId", registrationId);
        const result = await updateRegistration(orgSlug, registrationId, formData);
        if (result.status === "ok") {
          initialPhotoPathRef.current = values.photoPath ?? null;
          router.push(`/${orgSlug}/registraties`);
          router.refresh();
          return;
        }
        setState({ status: "error", message: result.message });
        return;
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
          socialQuantity: 0,
        });
        setPhoto({ status: "idle" });
        router.refresh();
        formTopRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
        return;
      }

      setState({ status: "error", message: result.message });
    });
  }

  return (
    <div ref={formTopRef}>
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="interventionId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InterventionPicker
                        interventions={interventions}
                        onSelect={field.onChange}
                        selectedId={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field: ecoField }) => (
                    <FormField
                      control={form.control}
                      name="socialQuantity"
                      render={({ field: socialField }) => (
                        <>
                          <QuantityFields
                            onEcoBlur={ecoField.onBlur}
                            onEcoChange={ecoField.onChange}
                            onSocialBlur={socialField.onBlur}
                            onSocialChange={socialField.onChange}
                            quantity={ecoField.value}
                            selectedIntervention={selectedIntervention}
                            socialQuantity={socialField.value}
                          />
                          <FormMessage>{form.formState.errors.quantity?.message}</FormMessage>
                          <FormMessage>{form.formState.errors.socialQuantity?.message}</FormMessage>
                        </>
                      )}
                    />
                  )}
                />
              </div>

              <ImpactPreview
                className="xl:hidden"
                intervention={selectedIntervention}
                quantity={quantity}
                socialQuantity={socialQuantity}
                variant="inline"
              />

              <FormField
                control={form.control}
                name="happenedOn"
                render={({ field: dateField }) => (
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field: noteField }) => (
                      <div className="space-y-3">
                        <RegistrationDetailsFields
                          happenedOn={dateField.value}
                          note={noteField.value}
                          onDateBlur={dateField.onBlur}
                          onDateChange={dateField.onChange}
                          onNoteBlur={noteField.onBlur}
                          onNoteChange={noteField.onChange}
                          onTeamSelect={(teamId) =>
                            form.setValue("teamId", teamId, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          photoField={
                            <PhotoField
                              onChange={handlePhotoChange}
                              onRemove={handleRemovePhoto}
                              state={photo}
                            />
                          }
                          selectedTeamId={selectedTeamId}
                          teams={teams}
                        />
                        <FormMessage>{form.formState.errors.happenedOn?.message}</FormMessage>
                        <FormMessage>{form.formState.errors.note?.message}</FormMessage>
                      </div>
                    )}
                  />
                )}
              />

              {teams.length <= 1 ? (
                <input type="hidden" {...form.register("teamId")} value={selectedTeamId} />
              ) : null}

              {state.status === "error" ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-[1rem] border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                >
                  <Icon name="error" className="text-base" filled />
                  <span>{state.message}</span>
                </div>
              ) : null}

              {!isEdit && state.status === "success" ? (
                <SuccessBanner
                  message={state.message}
                  onRegisterAnother={handleRegisterAnother}
                  orgSlug={orgSlug}
                />
              ) : null}
            </div>

            <ImpactPreview
              className="hidden xl:block"
              intervention={selectedIntervention}
              quantity={quantity}
              socialQuantity={socialQuantity}
              variant="sidebar"
            />
          </div>

          <div className="hidden justify-center gap-3 pt-2 md:flex">
            {isEdit ? (
              <Button
                asChild
                type="button"
                variant="outline"
                className="min-h-12 rounded-full border-border/70 bg-card px-6"
              >
                <Link href={`/${orgSlug}/registraties`}>Annuleren</Link>
              </Button>
            ) : null}
            <SubmitButton disabled={submitDisabled} isEdit={isEdit} isPending={isPending} />
          </div>

          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
            {isEdit ? (
              <Button
                asChild
                type="button"
                variant="outline"
                className="pointer-events-auto min-h-12 rounded-full border-border/70 bg-card px-5"
              >
                <Link href={`/${orgSlug}/registraties`}>Annuleren</Link>
              </Button>
            ) : null}
            <SubmitButton
              className="pointer-events-auto max-w-sm flex-1"
              disabled={submitDisabled}
              isEdit={isEdit}
              isPending={isPending}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

function SubmitButton({
  className,
  disabled,
  isEdit,
  isPending,
}: {
  className?: string;
  disabled: boolean;
  isEdit: boolean;
  isPending: boolean;
}) {
  return (
    <Button
      type="submit"
      variant="brand"
      size="lg"
      className={cn(
        "min-h-12 w-full gap-2 rounded-full text-base font-bold md:max-w-sm",
        className,
      )}
      disabled={disabled}
    >
      <Icon name={isEdit ? "save" : "eco"} filled className="text-lg" />
      {isPending ? "Opslaan..." : isEdit ? "Wijzigingen opslaan" : "Impact opslaan"}
      {!isEdit ? <Icon name="arrow_forward" className="text-lg" /> : null}
    </Button>
  );
}

function SuccessBanner({
  message,
  onRegisterAnother,
  orgSlug,
}: {
  message: string;
  onRegisterAnother: () => void;
  orgSlug: string;
}) {
  return (
    <div
      aria-live="polite"
      className="space-y-4 rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-tertiary-container text-tertiary shadow-sm">
          <Icon name="check_circle" filled className="text-xl" />
        </span>
        <div className="space-y-1">
          <p className="text-lg font-extrabold text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            Je impact staat nu op het dashboard en de publieke schermen.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="brand" className="min-h-11 flex-1 rounded-full">
          <Link href={`/${orgSlug}/dashboard`}>
            <Icon name="dashboard" className="text-base" />
            Bekijk dashboard
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1 rounded-full border-border/70 bg-card"
          onClick={onRegisterAnother}
        >
          <Icon name="add" className="text-base" />
          Nog een registratie
        </Button>
      </div>
    </div>
  );
}
