"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState, useTransition } from "react";

import {
  removeOrgLogo,
  updateOrgProfile,
  updateOrgSettings,
  uploadOrgLogo,
} from "@/app/(app)/[orgSlug]/beheer/actions";
import { EditableTextCell } from "@/components/settings/editable-cells";
import { EditableProfileTextareaCell } from "@/components/settings/editable-profile-field";
import { FormError } from "@/components/settings/form-fields";
import {
  cellTextClassName,
  sectionDescriptionClassName,
  sectionShellClassName,
  sectionTitleClassName,
  tableRowBorderClassName,
} from "@/components/settings/settings-styles";
import { getErrorMessage } from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import { ORG_LOGO_ACCEPTED_MIMES } from "@/lib/organizations/logo-upload";
import { cn } from "@/lib/utils";

export type GeneralTabContext = {
  description: string | null;
  eodBaselineDate: string | null;
  eodBaselineKg: number | null;
  impactDisclaimer: string | null;
  logoUrl: string | null;
  missionShort: string | null;
  name: string;
  publicShareEnabled: boolean;
  publicShareSlug: string | null;
  slug: string;
};

type ProfileField = "name" | "description" | "missionShort" | "impactDisclaimer";
type SettingsField = "publicShareSlug" | "eodBaselineKg" | "eodBaselineDate";

const PROFILE_FIELD_LIMITS = {
  missionShort: 280,
  description: 4000,
  impactDisclaimer: 2000,
} as const;

type GeneralTabProps = {
  context: GeneralTabContext;
};

export function GeneralTab({ context }: GeneralTabProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [editingProfileField, setEditingProfileField] = useState<ProfileField | null>(null);
  const [editingSettingsField, setEditingSettingsField] = useState<SettingsField | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isSettingsPending, startSettingsTransition] = useTransition();
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isLogoPending, startLogoTransition] = useTransition();

  const initials = getInitials(context.name);

  function saveProfileField(field: ProfileField, rawValue: string) {
    if (isProfilePending) return;

    const currentValues = {
      name: context.name,
      description: context.description ?? "",
      missionShort: context.missionShort ?? "",
      impactDisclaimer: context.impactDisclaimer ?? "",
    };

    const nextValues = {
      ...currentValues,
      [field]: rawValue,
    };

    if (nextValues[field] === currentValues[field]) {
      setEditingProfileField(null);
      return;
    }

    const formData = new FormData();
    formData.set("name", nextValues.name);
    formData.set("description", nextValues.description);
    formData.set("missionShort", nextValues.missionShort);
    formData.set("impactDisclaimer", nextValues.impactDisclaimer);

    startProfileTransition(async () => {
      try {
        await updateOrgProfile(context.slug, formData);
        setEditingProfileField(null);
        setProfileError(null);
        router.refresh();
      } catch (error) {
        setProfileError(getErrorMessage(error));
      }
    });
  }

  function handleLogoUpload(file: File | null) {
    if (!file || isLogoPending) return;

    const formData = new FormData();
    formData.set("logo", file);

    startLogoTransition(async () => {
      try {
        await uploadOrgLogo(context.slug, formData);
        setLogoError(null);
        router.refresh();
      } catch (error) {
        setLogoError(getErrorMessage(error));
      }
    });
  }

  function handleLogoRemove() {
    if (isLogoPending || !context.logoUrl) return;

    startLogoTransition(async () => {
      try {
        await removeOrgLogo(context.slug);
        setLogoError(null);
        router.refresh();
      } catch (error) {
        setLogoError(getErrorMessage(error));
      }
    });
  }

  const logoAccept = Array.from(ORG_LOGO_ACCEPTED_MIMES).join(",");

  function saveSettingsField(field: SettingsField, rawValue: string) {
    if (isSettingsPending) return;

    const currentValues = {
      publicShareSlug: context.publicShareSlug ?? "",
      eodBaselineKg: context.eodBaselineKg == null ? "" : String(context.eodBaselineKg),
      eodBaselineDate: context.eodBaselineDate ?? "",
    };

    const nextValues = {
      ...currentValues,
      [field]: rawValue,
    };

    if (nextValues[field] === currentValues[field]) {
      setEditingSettingsField(null);
      return;
    }

    submitSettings(nextValues, context.publicShareEnabled);
  }

  function saveShareEnabled(enabled: boolean) {
    if (isSettingsPending) return;

    submitSettings(
      {
        publicShareSlug: context.publicShareSlug ?? "",
        eodBaselineKg: context.eodBaselineKg == null ? "" : String(context.eodBaselineKg),
        eodBaselineDate: context.eodBaselineDate ?? "",
      },
      enabled,
    );
  }

  function submitSettings(
    values: {
      eodBaselineDate: string;
      eodBaselineKg: string;
      publicShareSlug: string;
    },
    publicShareEnabled: boolean,
  ) {
    const formData = new FormData();
    if (publicShareEnabled) formData.set("publicShareEnabled", "on");
    formData.set("publicShareSlug", values.publicShareSlug);
    formData.set("eodBaselineKg", values.eodBaselineKg);
    formData.set("eodBaselineDate", values.eodBaselineDate);

    startSettingsTransition(async () => {
      try {
        await updateOrgSettings(context.slug, formData);
        setEditingSettingsField(null);
        setSettingsError(null);
        router.refresh();
      } catch (error) {
        setSettingsError(getErrorMessage(error));
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className={sectionShellClassName}>
        <header className="space-y-1 pb-6">
          <h3 className={sectionTitleClassName}>Organisatieprofiel</h3>
          <p className={sectionDescriptionClassName}>
            Naam, missie, disclaimer en logo. Klik op een waarde om te bewerken. Uitgebreide missie
            en disclaimer ondersteunen eenvoudige Markdown.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
          <div className={cn("order-2 divide-y lg:order-1", tableRowBorderClassName)}>
            <SettingsRow
              helper="Zichtbaar in de sidebar en op het dashboard."
              label="Organisatienaam"
            >
              <EditableTextCell
                editing={editingProfileField === "name"}
                isPending={isProfilePending}
                label="Organisatienaam"
                onCancel={() => setEditingProfileField(null)}
                onSave={(value) => saveProfileField("name", value)}
                onStartEdit={() => {
                  setProfileError(null);
                  setEditingProfileField("name");
                }}
                value={context.name}
              >
                <span className={cellTextClassName}>{context.name}</span>
              </EditableTextCell>
            </SettingsRow>

            <SettingsRow
              helper="Max. 280 tekens. Korte pitch voor op slides en dashboard."
              label="Missie kort"
            >
              <EditableProfileTextareaCell
                editing={editingProfileField === "missionShort"}
                emptyLabel="Geen missie kort"
                isPending={isProfilePending}
                label="Missie kort"
                maxLength={PROFILE_FIELD_LIMITS.missionShort}
                onCancel={() => setEditingProfileField(null)}
                onSave={(value) => saveProfileField("missionShort", value)}
                onStartEdit={() => {
                  setProfileError(null);
                  setEditingProfileField("missionShort");
                }}
                rows={3}
                value={context.missionShort ?? ""}
              />
            </SettingsRow>

            <SettingsRow
              helper="Uitgebreide toelichting: waarom doen jullie dit? Markdown mag."
              label="Missie (uitgebreid)"
            >
              <EditableProfileTextareaCell
                editing={editingProfileField === "description"}
                emptyLabel="Geen missie (uitgebreid)"
                isPending={isProfilePending}
                label="Missie (uitgebreid)"
                markdown
                maxLength={PROFILE_FIELD_LIMITS.description}
                onCancel={() => setEditingProfileField(null)}
                onSave={(value) => saveProfileField("description", value)}
                onStartEdit={() => {
                  setProfileError(null);
                  setEditingProfileField("description");
                }}
                rows={5}
                value={context.description ?? ""}
              />
            </SettingsRow>

            <SettingsRow
              helper="Indicatieve cijfers; tonen op publieke surfaces volgt later."
              label="Impact-disclaimer"
            >
              <EditableProfileTextareaCell
                editing={editingProfileField === "impactDisclaimer"}
                emptyLabel="Geen disclaimer ingesteld"
                isPending={isProfilePending}
                label="Impact-disclaimer"
                markdown
                maxLength={PROFILE_FIELD_LIMITS.impactDisclaimer}
                onCancel={() => setEditingProfileField(null)}
                onSave={(value) => saveProfileField("impactDisclaimer", value)}
                onStartEdit={() => {
                  setProfileError(null);
                  setEditingProfileField("impactDisclaimer");
                }}
                rows={5}
                value={context.impactDisclaimer ?? ""}
              />
            </SettingsRow>
          </div>

          <aside className="order-first flex flex-col items-center justify-center gap-4 rounded-sm border border-border/40 bg-card/50 p-5 text-center lg:order-2">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-sm border border-border/40 bg-card shadow-sm">
              {context.logoUrl ? (
                <img
                  alt={`Logo van ${context.name}`}
                  src={context.logoUrl}
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-2">
              <input
                ref={logoInputRef}
                accept={logoAccept}
                className="sr-only"
                disabled={isLogoPending}
                type="file"
                onChange={(event) => {
                  setLogoError(null);
                  handleLogoUpload(event.currentTarget.files?.[0] ?? null);
                  event.currentTarget.value = "";
                }}
              />
              <Button
                className="w-full"
                disabled={isLogoPending}
                type="button"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
              >
                {isLogoPending ? "Bezig…" : context.logoUrl ? "Logo vervangen" : "Logo uploaden"}
              </Button>
              {context.logoUrl ? (
                <Button
                  className="w-full"
                  disabled={isLogoPending}
                  type="button"
                  variant="ghost"
                  onClick={handleLogoRemove}
                >
                  Logo verwijderen
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, SVG of WEBP, max. 5 MB. Zichtbaar in de sidebar.
            </p>
            {logoError ? <FormError message={logoError} /> : null}
          </aside>
        </div>

        {profileError ? (
          <div className="pt-4">
            <FormError message={profileError} />
          </div>
        ) : null}
      </section>

      <section className={sectionShellClassName}>
        <header className="space-y-1 pb-6">
          <h3 className={sectionTitleClassName}>Publiek dashboard</h3>
          <p className={sectionDescriptionClassName}>
            Deel jullie impact extern via /p/[slug] en stel de EOD-baseline in.
          </p>
        </header>

        <div className={cn("divide-y", tableRowBorderClassName)}>
          <SettingsRow
            helper="Bereikbaar op /p/[slug]. Alleen kleine letters, cijfers en koppeltekens."
            label="Publieke slug"
          >
            <EditableTextCell
              allowEmpty
              editing={editingSettingsField === "publicShareSlug"}
              isPending={isSettingsPending}
              label="Publieke slug"
              onCancel={() => setEditingSettingsField(null)}
              onSave={(value) => saveSettingsField("publicShareSlug", value)}
              onStartEdit={() => {
                setSettingsError(null);
                setEditingSettingsField("publicShareSlug");
              }}
              value={context.publicShareSlug ?? ""}
            >
              <span className={cellTextClassName}>
                {context.publicShareSlug?.trim() ? context.publicShareSlug : "Niet ingesteld"}
              </span>
            </EditableTextCell>
          </SettingsRow>

          <SettingsRow
            helper="Externe bezoekers zien alleen geaggregeerde data."
            label="Share-link actief"
          >
            <label className="inline-flex min-h-9 cursor-pointer items-center gap-3">
              <input
                checked={context.publicShareEnabled}
                className="h-5 w-5 rounded accent-primary"
                disabled={isSettingsPending}
                type="checkbox"
                onChange={(event) => saveShareEnabled(event.currentTarget.checked)}
              />
              <span className={cellTextClassName}>
                {context.publicShareEnabled ? "Ingeschakeld" : "Uitgeschakeld"}
              </span>
            </label>
            {context.publicShareEnabled && context.publicShareSlug ? (
              <p className="mt-2 font-mono text-xs text-primary">/p/{context.publicShareSlug}</p>
            ) : null}
          </SettingsRow>

          <SettingsRow
            helper="Totale CO₂-uitstoot waartegen besparingen worden afgezet."
            label="EOD-baseline (kg)"
          >
            <EditableTextCell
              allowEmpty
              editing={editingSettingsField === "eodBaselineKg"}
              inputType="number"
              isPending={isSettingsPending}
              label="EOD-baseline"
              min="0"
              onCancel={() => setEditingSettingsField(null)}
              onSave={(value) => saveSettingsField("eodBaselineKg", value)}
              onStartEdit={() => {
                setSettingsError(null);
                setEditingSettingsField("eodBaselineKg");
              }}
              step="0.001"
              value={context.eodBaselineKg == null ? "" : String(context.eodBaselineKg)}
            >
              <span className={cellTextClassName}>
                {context.eodBaselineKg == null ? "Niet ingesteld" : `${context.eodBaselineKg} kg`}
              </span>
            </EditableTextCell>
          </SettingsRow>

          <SettingsRow helper="Datum waarop de baseline is vastgesteld." label="Baseline-datum">
            <EditableTextCell
              allowEmpty
              editing={editingSettingsField === "eodBaselineDate"}
              inputType="date"
              isPending={isSettingsPending}
              label="Baseline-datum"
              onCancel={() => setEditingSettingsField(null)}
              onSave={(value) => saveSettingsField("eodBaselineDate", value)}
              onStartEdit={() => {
                setSettingsError(null);
                setEditingSettingsField("eodBaselineDate");
              }}
              value={context.eodBaselineDate ?? ""}
            >
              <span className={cellTextClassName}>
                {context.eodBaselineDate?.trim()
                  ? formatDutchDate(context.eodBaselineDate)
                  : "Niet ingesteld"}
              </span>
            </EditableTextCell>
          </SettingsRow>
        </div>

        {settingsError ? (
          <div className="pt-4">
            <FormError message={settingsError} />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SettingsRow({
  children,
  helper,
  label,
}: {
  children: ReactNode;
  helper?: string;
  label: string;
}) {
  return (
    <div className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(8rem,11rem)_minmax(0,1fr)] sm:items-start">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {helper ? <p className="text-xs leading-relaxed text-muted-foreground">{helper}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function getInitials(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  if (!cleaned) return "??";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) {
    return (parts[0] ?? "").slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function formatDutchDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
