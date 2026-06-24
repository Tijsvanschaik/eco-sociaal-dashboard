import type { ReactNode } from "react";

import { tenantPageMainClassName } from "@/components/app-shell/tenant-page-layout";
import { PanelSkeleton } from "@/components/loading/panel-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const FILTER_PLACEHOLDERS = ["all", "mobility", "food", "energy", "social"] as const;
const INTERVENTION_PLACEHOLDERS = ["a", "b", "c", "d", "e", "f"] as const;
const REGISTRATION_PLACEHOLDERS = ["r1", "r2", "r3", "r4"] as const;
const SETTINGS_TABS = ["algemeen", "medewerkers", "teams", "activiteiten"] as const;
const SETTINGS_ROWS = ["name", "mission", "disclaimer", "logo", "share"] as const;
const LIST_ROWS = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"] as const;

function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cn(tenantPageMainClassName, className)}
      aria-busy="true"
      aria-label="Pagina laden"
    >
      {children}
    </main>
  );
}

/** Matches the registration form layout (activiteit/nieuw, bewerken). */
export function RegistrationFormSkeleton({ showHeader = false }: { showHeader?: boolean }) {
  return (
    <PageShell>
      {showHeader ? (
        <header className="space-y-4">
          <Skeleton className="h-10 w-44 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-72 max-w-full sm:h-10" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </header>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-8">
          <PanelSkeleton contentClassName="space-y-5">
            <Skeleton className="h-11 w-full rounded-[1rem]" />
            <div className="flex flex-wrap gap-2">
              {FILTER_PLACEHOLDERS.map((id) => (
                <Skeleton key={id} className="h-9 w-24 rounded-full" />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INTERVENTION_PLACEHOLDERS.map((id) => (
                <Skeleton key={id} className="h-[4.5rem] rounded-[1.25rem] sm:h-24" />
              ))}
            </div>
          </PanelSkeleton>

          <PanelSkeleton contentClassName="space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-[1.25rem]" />
              <Skeleton className="h-24 rounded-[1.25rem]" />
            </div>
          </PanelSkeleton>

          <PanelSkeleton contentClassName="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11 w-full rounded-[1rem]" />
            <Skeleton className="h-28 w-full rounded-[1.25rem]" />
          </PanelSkeleton>
        </div>

        <PanelSkeleton className="hidden xl:block" contentClassName="space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-20 w-full rounded-[1.25rem]" />
          <Skeleton className="h-20 w-full rounded-[1.25rem]" />
        </PanelSkeleton>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <Skeleton className="h-12 w-56 rounded-full" />
      </div>
    </PageShell>
  );
}

export function DashboardPageSkeleton() {
  return (
    <PageShell>
      <header className="w-full px-6 sm:px-10">
        <Skeleton className="h-10 w-full max-w-2xl sm:h-12" />
      </header>

      <PanelSkeleton className="mx-0" contentClassName="space-y-6">
        <Skeleton className="mx-auto aspect-[4/3] w-full max-w-3xl rounded-[1.5rem] lg:aspect-[16/9]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-[1.25rem]" />
          <Skeleton className="h-24 rounded-[1.25rem]" />
        </div>
      </PanelSkeleton>

      <section className="grid gap-6 lg:grid-cols-2">
        <PanelSkeleton contentClassName="space-y-3">
          <Skeleton className="h-[260px] w-full rounded-[1.25rem]" />
        </PanelSkeleton>
        <PanelSkeleton contentClassName="space-y-3">
          <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
        </PanelSkeleton>
      </section>

      <PanelSkeleton contentClassName="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {REGISTRATION_PLACEHOLDERS.map((id) => (
            <Skeleton key={id} className="h-40 rounded-[1.5rem]" />
          ))}
        </div>
      </PanelSkeleton>
    </PageShell>
  );
}

export function SettingsPageSkeleton() {
  return (
    <PageShell>
      <header className="space-y-2">
        <Skeleton className="h-9 w-48 sm:h-10" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </header>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {SETTINGS_TABS.map((id) => (
          <Skeleton key={id} className="h-11 rounded-full" />
        ))}
      </div>

      <PanelSkeleton contentClassName="space-y-4">
        {SETTINGS_ROWS.map((id) => (
          <div
            key={id}
            className="flex items-center justify-between gap-4 border-b border-border/40 pb-4 last:border-0"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48 max-w-[50%]" />
          </div>
        ))}
      </PanelSkeleton>
    </PageShell>
  );
}

export function ListPageSkeleton() {
  return (
    <PageShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40 sm:h-10" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-11 w-44 rounded-full" />
      </header>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      <PanelSkeleton contentClassName="space-y-3">
        {LIST_ROWS.map((id) => (
          <Skeleton key={id} className="h-14 w-full rounded-xl" />
        ))}
      </PanelSkeleton>
    </PageShell>
  );
}

export function GenericTenantPageSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-9 w-56 max-w-full sm:h-10" />
      <PanelSkeleton contentClassName="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </PanelSkeleton>
    </PageShell>
  );
}

export function LoginPageSkeleton() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background lg:grid lg:grid-cols-2"
      aria-busy="true"
      aria-label="Inlogpagina laden"
    >
      <div className="hidden flex-col justify-center gap-6 bg-primary-container/30 p-10 lg:flex">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-5/6 max-w-md" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
