import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const insetPanelClassName = "rounded-[2rem] bg-card shadow-[0_20px_40px_rgba(54,50,45,0.04)]";

type MetricTone = "primary" | "tertiary" | "neutral";

export type SuperadminMetric = {
  description: string;
  icon: string;
  label: string;
  tone: MetricTone;
  unit?: string;
  value: string;
};

export function SuperadminMetricGrid({ metrics }: { metrics: SuperadminMetric[] }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <SuperadminMetricTile key={metric.label} {...metric} />
      ))}
    </dl>
  );
}

function SuperadminMetricTile({ description, icon, label, tone, unit, value }: SuperadminMetric) {
  const iconTone =
    tone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : tone === "primary"
        ? "bg-primary-container text-primary"
        : "bg-surface-container-high text-foreground";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5",
        insetPanelClassName,
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
