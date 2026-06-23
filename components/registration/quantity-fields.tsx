"use client";

import { useEffect, useState } from "react";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { formatRegistrationUnit } from "@/components/dashboard/registration-card";
import { registrationInsetPanelClassName } from "@/components/registration/registration-section";
import { Icon } from "@/components/ui/icon";
import { InfoHint } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import {
  type MetricsHelpContent,
  QUANTITIES_PANEL_HELP,
  getEcoQuantityHelp,
  getSocialQuantityHelp,
} from "@/lib/copy/eco-social-metrics-help";
import type { InterventionOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

export const inputSurfaceClassName =
  "rounded-[1rem] border border-border/60 bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/25";

type QuantityFieldsProps = {
  onEcoBlur: () => void;
  onEcoChange: (value: number) => void;
  onSocialBlur: () => void;
  onSocialChange: (value: number) => void;
  quantity: number;
  selectedIntervention?: InterventionOption;
  socialQuantity: number;
};

export function QuantityFields({
  onEcoBlur,
  onEcoChange,
  onSocialBlur,
  onSocialChange,
  quantity,
  selectedIntervention,
  socialQuantity,
}: QuantityFieldsProps) {
  return (
    <DashboardPanel
      action={
        <InfoHint
          content={QUANTITIES_PANEL_HELP}
          label="Uitleg hoeveelheden bij registratie"
          side="left"
        />
      }
      contentClassName="grid gap-4 lg:grid-cols-2"
      description="Eco en sociaal tellen apart — vul beide velden in."
      icon="speed"
      iconTone="neutral"
      title="Hoeveelheden"
    >
      <QuantityInset
        ariaLabel="Eco-hoeveelheid"
        description="Voor de CO₂-berekening van deze activiteit."
        helpContent={getEcoQuantityHelp(selectedIntervention?.ecoUnit)}
        factorHint={
          selectedIntervention
            ? `× ${formatFactor(selectedIntervention.factorKg)} kg CO₂`
            : undefined
        }
        icon="eco"
        label="Eco-hoeveelheid"
        onBlur={onEcoBlur}
        onChange={onEcoChange}
        tone="tertiary"
        unitLabel={selectedIntervention?.ecoUnit}
        value={quantity}
      />
      <QuantityInset
        ariaLabel="Sociale hoeveelheid"
        description="Voor de sociale score (kan afwijken van eco)."
        helpContent={getSocialQuantityHelp(selectedIntervention?.ecoUnit)}
        factorHint={
          selectedIntervention
            ? `× ${formatFactor(selectedIntervention.socialScoreFactor)} punten`
            : undefined
        }
        icon="favorite"
        label="Sociale hoeveelheid"
        onBlur={onSocialBlur}
        onChange={onSocialChange}
        tone="primary"
        unitLabel={selectedIntervention?.socialUnit}
        value={socialQuantity}
      />
    </DashboardPanel>
  );
}

function QuantityInset({
  ariaLabel,
  description,
  factorHint,
  helpContent,
  icon,
  label,
  onBlur,
  onChange,
  tone,
  unitLabel,
  value,
}: {
  ariaLabel: string;
  description: string;
  factorHint?: string;
  helpContent: MetricsHelpContent;
  icon: string;
  label: string;
  onBlur: () => void;
  onChange: (value: number) => void;
  tone: "primary" | "tertiary";
  unitLabel?: string;
  value: number;
}) {
  const [draft, setDraft] = useState(() => formatQuantityDisplay(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(formatQuantityDisplay(value));
    }
  }, [isFocused, value]);

  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : "bg-primary-container text-primary";

  return (
    <div className={cn("flex flex-col gap-4 p-5", registrationInsetPanelClassName)}>
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-[0.875rem] shadow-sm",
          iconTone,
        )}
      >
        <Icon name={icon} filled className="text-xl" />
      </span>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold tracking-tight text-foreground">{label}</p>
          <InfoHint content={helpContent} label={`Uitleg ${label.toLowerCase()}`} side="top" />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Input
          aria-label={ariaLabel}
          className={cn("h-14 min-w-0 flex-1 text-2xl font-extrabold", inputSurfaceClassName)}
          inputMode="decimal"
          name={ariaLabel}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw !== "" && !/^[\d.,]*$/.test(raw)) return;

            setDraft(raw);

            const parsed = parseQuantityInput(raw);
            if (parsed === null) {
              if (raw === "") onChange(0);
              return;
            }

            onChange(parsed);
          }}
          onFocus={() => {
            setIsFocused(true);
            setDraft(formatQuantityDisplay(value));
          }}
          type="text"
          value={isFocused ? draft : formatQuantityDisplay(value)}
        />
        {unitLabel ? (
          <span className="flex min-w-[4rem] flex-col items-center justify-center px-2 text-center text-sm font-semibold text-muted-foreground">
            <span>{formatRegistrationUnit(unitLabel)}</span>
            {factorHint ? (
              <span className="mt-0.5 block text-[0.68rem] font-medium leading-snug text-muted-foreground/80">
                {factorHint}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function formatFactor(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatQuantityDisplay(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return String(value);
}

function parseQuantityInput(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "" || normalized === ".") return null;
  if (!/^\d*(\.\d*)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
