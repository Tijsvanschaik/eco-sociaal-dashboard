import { Icon } from "@/components/ui/icon";
import { iconForCategory } from "@/lib/category-icons";
import type { InterventionOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

export function InterventionCard({
  cardRef,
  intervention,
  onSelect,
  selected,
}: {
  cardRef?: React.RefObject<HTMLButtonElement | null>;
  intervention: InterventionOption;
  onSelect: () => void;
  selected: boolean;
}) {
  const color = intervention.categoryColor ?? "#af1e7b";
  const icon = iconForCategory(intervention.categoryName);

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full w-full flex-col items-center justify-between gap-2 rounded-[1.25rem] border-2 bg-card p-3 text-center shadow-[0_12px_30px_rgba(54,50,45,0.04)] transition-all",
        "max-sm:flex-row max-sm:items-center max-sm:justify-start max-sm:gap-2.5 max-sm:rounded-xl max-sm:p-2.5 max-sm:text-left sm:min-h-[7.5rem]",
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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] text-foreground transition-transform group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-[0.9rem]"
        style={{
          backgroundColor: selected ? color : `${color}22`,
          color: selected ? "#fff" : color,
        }}
      >
        <Icon name={icon} filled className="text-xl sm:text-2xl" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-xs font-extrabold leading-tight text-foreground sm:text-sm">
          {intervention.name}
        </span>
        <span className="hidden text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground sm:block">
          {intervention.categoryName}
        </span>
      </span>
    </button>
  );
}
