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
        "group relative flex h-full min-h-[7.5rem] w-full flex-col items-center justify-between gap-2 rounded-[1.25rem] border-2 bg-card p-3 text-center shadow-[0_12px_30px_rgba(54,50,45,0.04)] transition-all",
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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] text-foreground transition-transform group-hover:scale-105"
        style={{
          backgroundColor: selected ? color : `${color}22`,
          color: selected ? "#fff" : color,
        }}
      >
        <Icon name={icon} filled className="text-2xl" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="line-clamp-2 text-sm font-extrabold leading-tight text-foreground">
          {intervention.name}
        </span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {intervention.categoryName}
        </span>
      </span>
    </button>
  );
}
