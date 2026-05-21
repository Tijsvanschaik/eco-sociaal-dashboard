"use client";

import { type ReactNode, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal, ModalActions } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import { FormError } from "@/components/settings/form-fields";
import {
  sectionDescriptionClassName,
  sectionShellClassName,
  sectionTitleClassName,
} from "@/components/settings/settings-styles";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Er ging iets mis. Probeer het opnieuw.";
}

export function SettingsSection({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className={sectionShellClassName}>
      <header className="space-y-5 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className={sectionTitleClassName}>{title}</h3>
            <p className={sectionDescriptionClassName}>{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function MemberCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-foreground">
      <Icon name="person" className="text-sm" filled />
      {count} {count === 1 ? "medewerker" : "medewerkers"}
    </span>
  );
}

export function RowIconButton({
  icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: string;
  label: string;
  onClick: () => void;
  tone?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        tone === "destructive"
          ? "text-muted-foreground hover:text-destructive"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      <Icon name={icon} className="text-base" />
    </button>
  );
}

export function ConfirmArchiveModal({
  confirmLabel = "Verwijderen",
  description,
  onClose,
  onConfirm,
  open,
  pendingLabel = "Verwijderen...",
  title,
}: {
  confirmLabel?: string;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  open: boolean;
  pendingLabel?: string;
  title: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm();
      } catch (confirmError) {
        setError(getErrorMessage(confirmError));
      }
    });
  }

  return (
    <Modal
      description={description}
      footer={
        <ModalActions>
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Annuleren
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-full"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </ModalActions>
      }
      onClose={onClose}
      open={open}
      title={title}
    >
      {error ? <FormError message={error} /> : null}
    </Modal>
  );
}
