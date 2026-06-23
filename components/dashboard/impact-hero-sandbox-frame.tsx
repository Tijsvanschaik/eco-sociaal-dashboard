import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ImpactHeroSandboxViewport = "desktop" | "mobile" | "tv";

const cardShellClassName =
  "overflow-hidden rounded-[2rem] bg-surface-container-low shadow-[0_20px_40px_rgba(54,50,45,0.04)]";

type ImpactHeroSandboxFrameProps = {
  children: ReactNode;
  viewport: ImpactHeroSandboxViewport;
};

/** Wraps `ImpactHeroSection` in the same layout shells as dashboard / TV. */
export function ImpactHeroSandboxFrame({ children, viewport }: ImpactHeroSandboxFrameProps) {
  if (viewport === "desktop") {
    return (
      <div className="w-full max-w-6xl">
        <section className={cn(cardShellClassName, "p-6 sm:p-10")}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-12">
            {children}
            <SandboxTeamPanelPlaceholder />
          </div>
        </section>
      </div>
    );
  }

  if (viewport === "tv") {
    return (
      <div className="flex h-[min(720px,85dvh)] w-full max-w-5xl flex-col">
        <section className={cn(cardShellClassName, "flex min-h-0 flex-1 flex-col p-6 sm:p-10")}>
          {children}
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <section className={cn(cardShellClassName, "p-6 sm:p-8")}>{children}</section>
    </div>
  );
}

function SandboxTeamPanelPlaceholder() {
  return (
    <div
      className={cn(
        "hidden min-h-[20rem] flex-col gap-5 rounded-[2rem] bg-card p-6 shadow-[0_20px_40px_rgba(54,50,45,0.04)] sm:p-7 lg:flex",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-surface-container-high text-primary shadow-sm">
          <Icon name="groups" filled />
        </span>
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">Top teams</h3>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            Placeholder · zelfde grid als dashboard (lg+)
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 rounded-[1.25rem] border border-dashed border-border bg-surface-container-low p-5 text-sm text-muted-foreground">
        <p>Teamkolom alleen zichtbaar in Desktop-weergave.</p>
        <p>Helpt beoordelen hoe breed de hero-kolom blijft naast Top teams.</p>
      </div>
    </div>
  );
}
