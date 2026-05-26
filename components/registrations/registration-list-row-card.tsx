import {
  formatRegistrationCo2Kg,
  formatRegistrationDate,
  formatRegistrationQuantity,
  formatRegistrationSocialScore,
  formatRegistrationUnit,
} from "@/components/dashboard/registration-card";
import { RowIconButton } from "@/components/settings/settings-ui";
import { Icon } from "@/components/ui/icon";
import type { RegistrationListRow } from "@/lib/tenant-registrations-list-data";
import { cn } from "@/lib/utils";

type RegistrationListRowCardProps = {
  onDelete: () => void;
  onEdit: () => void;
  row: RegistrationListRow;
  showAuthor: boolean;
};

export function RegistrationListRowCard({
  onDelete,
  onEdit,
  row,
  showAuthor,
}: RegistrationListRowCardProps) {
  const accentColor = row.categoryColor ?? "var(--primary)";

  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-border/60 bg-card shadow-[0_12px_28px_rgba(54,50,45,0.05)]">
      <div className="flex min-w-0">
        <span aria-hidden className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start gap-2">
            <h2 className="min-w-0 flex-1 text-base font-extrabold leading-snug tracking-tight text-foreground">
              {row.interventionName}
            </h2>
            {row.canEdit ? (
              <div className="flex shrink-0 gap-0.5 rounded-full border border-border/50 bg-surface-container-low/80 p-0.5">
                <RowIconButton icon="edit" label="Registratie bewerken" onClick={onEdit} />
                <RowIconButton
                  icon="delete"
                  label="Registratie verwijderen"
                  onClick={onDelete}
                  tone="destructive"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-2.5 space-y-1.5">
            <MetaItem icon="event" label={formatRegistrationDate(row.happenedOn)} />
            <MetaItem icon="groups" label={row.teamName} />
            {showAuthor && row.authorEmail ? (
              <MetaItem icon="person" label={row.authorEmail} />
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <ImpactPill
              icon="eco"
              label={`${formatRegistrationCo2Kg(row.co2KgCached)} kg CO₂`}
              tone="eco"
            />
            <ImpactPill
              icon="favorite"
              label={`${formatRegistrationSocialScore(row.socialScoreCached)} punten`}
              tone="social"
            />
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-tertiary">Eco</span>
            {" · "}
            {formatRegistrationQuantity(row.quantity)}
            {row.ecoUnit ? ` ${formatRegistrationUnit(row.ecoUnit)}` : ""}
            {" · "}
            <span className="font-semibold text-primary">Sociaal</span>
            {" · "}
            {formatRegistrationQuantity(row.socialQuantity)}
            {row.socialUnit ? ` ${formatRegistrationUnit(row.socialUnit)}` : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

function MetaItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon name={icon} filled className="shrink-0 text-sm text-primary" />
      <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function ImpactPill({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: "eco" | "social";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold shadow-sm",
        tone === "eco"
          ? "bg-tertiary-container/70 text-tertiary"
          : "bg-primary-container/70 text-primary",
      )}
    >
      <Icon name={icon} filled className="shrink-0 text-sm" />
      {label}
    </span>
  );
}
