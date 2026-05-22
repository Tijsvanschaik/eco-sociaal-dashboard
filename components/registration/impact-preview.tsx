import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { registrationInsetPanelClassName } from "@/components/registration/registration-section";
import { Icon } from "@/components/ui/icon";
import { calculateCo2, calculateSocialScore, treesEquivalent } from "@/lib/impact";
import type { InterventionOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

type ImpactPreviewProps = {
  className?: string;
  intervention?: InterventionOption;
  quantity: number;
  socialQuantity: number;
  variant?: "inline" | "sidebar";
};

export function ImpactPreview({
  className,
  intervention,
  quantity,
  socialQuantity,
  variant = "inline",
}: ImpactPreviewProps) {
  const ecoQty = Number(quantity);
  const socialQty = Number(socialQuantity);
  const showPreview =
    intervention &&
    Number.isFinite(ecoQty) &&
    ecoQty > 0 &&
    Number.isFinite(socialQty) &&
    socialQty > 0;

  const co2Kg = showPreview ? calculateCo2(ecoQty, intervention.factorKg) : 0;
  const socialScore = showPreview
    ? calculateSocialScore(socialQty, intervention.socialScoreFactor)
    : 0;
  const trees = showPreview ? treesEquivalent(co2Kg) : 0;

  return (
    <DashboardPanel
      className={cn(variant === "sidebar" && "lg:sticky lg:top-6", className)}
      contentClassName="space-y-4"
      description={
        showPreview
          ? "Geschat op basis van je invoer."
          : "Vul een activiteit en beide hoeveelheden in."
      }
      icon="insights"
      iconTone="primary"
      title="Jouw impact"
    >
      {showPreview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <FactTile
              icon="eco"
              label="Eco score"
              tone="tertiary"
              unit="kg CO₂"
              value={formatMetric(co2Kg)}
            />
            <FactTile
              icon="favorite"
              label="Sociale score"
              tone="primary"
              unit="punten"
              value={formatMetric(socialScore)}
            />
          </div>
          {trees > 0 ? (
            <div className={cn("flex items-center gap-3 p-4", registrationInsetPanelClassName)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-[0.875rem] bg-muted text-muted-foreground shadow-sm">
                <Icon name="forest" filled className="text-xl" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Bomen-equivalent</p>
                <p className="text-xs text-muted-foreground">
                  ≈ {trees} {trees === 1 ? "boom" : "bomen"} per jaar
                </p>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Zodra je een activiteit kiest en beide hoeveelheden invult, zie je hier je geschatte
          CO₂-besparing en sociale punten — net als op het dashboard.
        </p>
      )}
    </DashboardPanel>
  );
}

function FactTile({
  icon,
  label,
  tone,
  unit,
  value,
}: {
  icon: string;
  label: string;
  tone: "primary" | "tertiary";
  unit: string;
  value: string;
}) {
  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : "bg-primary-container text-primary";

  return (
    <div className={cn("flex flex-col gap-3 p-5", registrationInsetPanelClassName)}>
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-[0.875rem] shadow-sm",
          iconTone,
        )}
      >
        <Icon name={icon} filled className="text-xl" />
      </span>
      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5">
          <p className="text-3xl font-extrabold leading-none tracking-tight text-foreground">
            {value}
          </p>
          <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
        </div>
        <p className="text-sm font-bold tracking-tight text-foreground">{label}</p>
      </div>
    </div>
  );
}

function formatMetric(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}
