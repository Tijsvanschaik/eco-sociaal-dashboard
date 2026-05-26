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
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className={mobileRowCardFieldClassName}>
      <p className={mobileRowCardLabelClassName}>{label}</p>
      {children}
    </div>
  );
}
