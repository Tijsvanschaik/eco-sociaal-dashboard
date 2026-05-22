import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { formatRegistrationUnit } from "@/components/dashboard/registration-card";
import { registrationInsetPanelClassName } from "@/components/registration/registration-section";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import type { InterventionOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

export const inputSurfaceClassName =
  "rounded-[1rem] border border-border/60 bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/25";

type QuantityFieldsProps = {
  onEcoBlur: () => void;
  onEcoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSocialBlur: () => void;
  onSocialChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
      contentClassName="grid gap-4 lg:grid-cols-2"
      description="Eco en sociaal tellen apart — vul beide velden in."
      icon="speed"
      iconTone="neutral"
      title="Hoeveelheden"
    >
      <QuantityInset
        ariaLabel="Eco-hoeveelheid"
        description="Voor de CO₂-berekening van deze activiteit."
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
  icon: string;
  label: string;
  onBlur: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  tone: "primary" | "tertiary";
  unitLabel?: string;
  value: number;
}) {
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
        <p className="text-sm font-bold tracking-tight text-foreground">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Input
          aria-label={ariaLabel}
          className={cn("h-14 min-w-0 flex-1 text-2xl font-extrabold", inputSurfaceClassName)}
          inputMode="decimal"
          min="0.001"
          name={ariaLabel}
          onBlur={onBlur}
          onChange={onChange}
          step="0.001"
          type="number"
          value={Number.isFinite(value) && value > 0 ? value : ""}
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
