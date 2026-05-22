import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const impactInsetPanelClassName = "rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)]";

function formatKg(kg: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: kg >= 100 ? 0 : 1,
  }).format(kg);
}

function formatScore(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 }).format(value);
}

export type TeamImpactHeroProps = {
  periodLabel: string;
  registrationCount: number;
  teamName: string;
  totalCo2Kg: number;
  totalSocialScore: number;
};

export function TeamImpactHero({
  periodLabel,
  registrationCount,
  teamName,
  totalCo2Kg,
  totalSocialScore,
}: TeamImpactHeroProps) {
  return (
    <section className="rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <Icon name="groups" className="text-base" filled /> Team-impact
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {teamName}
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            Overzicht van activiteiten en impact · {periodLabel}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <FactTile
            description="Som van alle eco-impact van dit team."
            icon="eco"
            label="Eco score"
            tone="tertiary"
            unit="kg CO₂"
            value={formatKg(totalCo2Kg)}
          />
          <FactTile
            description="Som van alle sociale impact van dit team."
            icon="favorite"
            label="Sociale score"
            tone="primary"
            unit="punten"
            value={formatScore(totalSocialScore)}
          />
          <FactTile
            description="Aantal geregistreerde activiteiten dit jaar."
            icon="edit_note"
            label="Registraties"
            tone="neutral"
            unit=""
            value={formatInteger(registrationCount)}
          />
        </dl>
      </div>
    </section>
  );
}

function FactTile({
  description,
  icon,
  label,
  tone,
  unit,
  value,
}: {
  description: string;
  icon: string;
  label: string;
  tone: "primary" | "tertiary" | "neutral";
  unit: string;
  value: string;
}) {
  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : tone === "primary"
        ? "bg-primary-container text-primary"
        : "bg-surface-container-high text-foreground";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden p-5 transition-transform hover:-translate-y-0.5",
        impactInsetPanelClassName,
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-[0.875rem] shadow-sm",
          iconTone,
        )}
      >
        <Icon name={icon} filled className="text-xl" />
      </span>
      <div className="space-y-2">
        <div className="flex items-baseline gap-1.5">
          <dd className="text-2xl font-extrabold leading-none tracking-tight text-foreground sm:text-3xl">
            {value}
          </dd>
          {unit ? (
            <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
          ) : null}
        </div>
        <dt className="text-sm font-bold tracking-tight text-foreground">{label}</dt>
        <p className="text-xs leading-relaxed text-muted-foreground/90">{description}</p>
      </div>
    </div>
  );
}
