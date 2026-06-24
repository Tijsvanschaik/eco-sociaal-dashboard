import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartSkeleton({
  className,
  fillContainer = false,
  height = 260,
}: {
  className?: string;
  fillContainer?: boolean;
  height?: number;
}) {
  return (
    <Skeleton
      aria-hidden
      className={cn(
        "w-full rounded-[1.25rem]",
        fillContainer ? "min-h-[200px] flex-1" : undefined,
        className,
      )}
      style={fillContainer ? undefined : { height }}
    />
  );
}
