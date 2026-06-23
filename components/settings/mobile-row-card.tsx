import type { ReactNode } from "react";

import {
  mobileRowCardClassName,
  mobileRowCardFieldClassName,
  mobileRowCardLabelClassName,
} from "@/components/settings/settings-styles";
import { cn } from "@/lib/utils";

export function SettingsMobileRowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <article className={cn(mobileRowCardClassName, className)}>{children}</article>;
}

export function MobileRowActionGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 gap-0.5 rounded-full border border-border/50 bg-surface-container-low/80 p-0.5">
      {children}
    </div>
  );
}

export function SettingsMobileField({
  children,
  label,
  stretch = false,
}: {
  children: ReactNode;
  label: string;
  stretch?: boolean;
}) {
  return (
    <div className={cn(mobileRowCardFieldClassName, stretch && "flex h-full min-h-0 flex-col")}>
      <p className={mobileRowCardLabelClassName}>{label}</p>
      <div className={cn(stretch && "flex min-h-0 flex-1 flex-col")}>{children}</div>
    </div>
  );
}
