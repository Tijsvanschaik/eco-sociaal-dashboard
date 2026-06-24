import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PanelSkeleton({
  children,
  className,
  contentClassName,
}: {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      aria-busy="true"
      aria-label="Laden"
      className={cn(
        "rounded-[2rem] bg-surface-container-low p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-8",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-44 max-w-full sm:w-52" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </header>
      {children ? <div className={cn("mt-5", contentClassName)}>{children}</div> : null}
    </section>
  );
}
