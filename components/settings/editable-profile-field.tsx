"use client";

import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { SafeMarkdown } from "@/components/ui/safe-markdown";
import { cn } from "@/lib/utils";

import {
  cellTextClassName,
  editableCellShellClassName,
  editableTriggerClassName,
  inlineInputClassName,
} from "@/components/settings/settings-styles";

type EditableProfileTextareaCellProps = {
  editing: boolean;
  emptyLabel: string;
  isPending: boolean;
  label: string;
  markdown?: boolean;
  maxLength: number;
  onCancel: () => void;
  onSave: (value: string) => void;
  onStartEdit: () => void;
  rows?: number;
  value: string;
};

export function EditableProfileTextareaCell({
  editing,
  emptyLabel,
  isPending,
  label,
  markdown = false,
  maxLength,
  onCancel,
  onSave,
  onStartEdit,
  rows = 4,
  value,
}: EditableProfileTextareaCellProps) {
  const fieldId = useId();
  const counterId = `${fieldId}-counter`;
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (editing) setDraft(value);
  }, [editing, value]);

  function handleSave() {
    onSave(draft.trim());
  }

  if (editing) {
    const remaining = maxLength - draft.length;

    return (
      <div className="space-y-2">
        <textarea
          aria-describedby={counterId}
          aria-label={`${label} bewerken`}
          className={cn(inlineInputClassName, "min-h-[6.5rem] h-auto resize-y py-2.5")}
          disabled={isPending}
          id={fieldId}
          maxLength={maxLength}
          rows={rows}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              handleSave();
            }
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground" id={counterId}>
            {remaining} tekens over · Ctrl+Enter om op te slaan
          </p>
          <div className="flex items-center gap-2">
            <Button disabled={isPending} size="sm" type="button" variant="ghost" onClick={onCancel}>
              Annuleren
            </Button>
            <Button disabled={isPending} size="sm" type="button" onClick={handleSave}>
              {isPending ? "Opslaan…" : "Opslaan"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasValue = value.trim().length > 0;

  return (
    <div className={cn(editableCellShellClassName, "h-auto min-h-9 items-start")}>
      <button
        type="button"
        aria-label={`${label} bewerken${hasValue ? `: ${value.slice(0, 80)}` : ""}`}
        className={cn(editableTriggerClassName, "h-auto min-h-9 py-2.5")}
        disabled={isPending}
        onClick={onStartEdit}
        title="Klik om te bewerken"
      >
        {hasValue ? (
          markdown ? (
            <SafeMarkdown className="text-left" content={value} />
          ) : (
            <span className={cn(cellTextClassName, "whitespace-pre-wrap text-left")}>{value}</span>
          )
        ) : (
          <span className="text-sm font-medium text-muted-foreground">{emptyLabel}</span>
        )}
      </button>
    </div>
  );
}
