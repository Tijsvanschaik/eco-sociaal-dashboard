import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Tone = "primary" | "tertiary" | "neutral";

export type DashboardPanelProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  icon?: string;
  iconTone?: Tone;
  title: ReactNode;
};

/**
 * Kaart-schil in dezelfde visuele taal als het impact-overzichtblok:
 * `bg-surface-container-low` (zelfde als sidebar / outer ImpactOverviewCard),
 * `rounded-[2rem]`, zachte shadow, warme icon-badge. Inset-content blijft
 * lichter via geneste `bg-card` waar nodig.
 */
export function DashboardPanel({
  action,
  children,
  className,
  contentClassName,
  description,
  icon,
  iconTone = "primary",
  title,
}: DashboardPanelProps) {
  const iconToneClass =
    iconTone === "tertiary"
      ? "bg-tertiary-container text-tertiary"
      : iconTone === "neutral"
        ? "bg-surface-container-high text-foreground"
        : "bg-primary-container text-primary";

  return (
    <section
      className={cn(
        "rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        {icon ? (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] shadow-sm",
              iconToneClass,
            )}
          >
            <Icon name={icon} filled />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex-none">{action}</div> : null}
      </header>
      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </section>
  );
}
