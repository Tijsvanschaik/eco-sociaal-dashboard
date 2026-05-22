"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import {
  editableCellShellClassName,
  editableTriggerClassName,
  inlineInputClassName,
  inlineSelectClassName,
} from "@/components/settings/settings-styles";

function EditableCellTrigger({
  align = "left",
  children,
  disabled,
  label,
  onClick,
  truncateContent = true,
  value,
}: {
  align?: "left" | "right";
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  truncateContent?: boolean;
  value: string;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} bewerken: ${value}`}
      className={cn(editableTriggerClassName, align === "right" && "justify-end text-right")}
      disabled={disabled}
      onClick={onClick}
      title="Klik om te bewerken"
    >
      <span
        className={cn(
          "min-w-0 w-full",
          truncateContent && "truncate",
          align === "right" && "text-right",
        )}
      >
        {children}
      </span>
    </button>
  );
}

export function EditableTextCell({
  align = "left",
  allowEmpty = false,
  children,
  editing,
  inputType = "text",
  isPending,
  label,
  min,
  onCancel,
  onSave,
  onStartEdit,
  step,
  value,
}: {
  align?: "left" | "right";
  allowEmpty?: boolean;
  children: ReactNode;
  editing: boolean;
  inputType?: "text" | "url" | "date" | "number";
  isPending: boolean;
  label: string;
  min?: string;
  onCancel: () => void;
  onSave: (value: string) => void;
  onStartEdit: () => void;
  step?: string;
  value: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className={editableCellShellClassName}>
      {editing ? (
        <input
          ref={inputRef}
          aria-label={`${label} bewerken`}
          className={cn(inlineInputClassName, align === "right" && "text-right")}
          defaultValue={value}
          disabled={isPending}
          min={min}
          step={step}
          type={inputType}
          onBlur={(event) => {
            const nextValue = event.currentTarget.value.trim();
            if (!nextValue && !allowEmpty && inputType !== "date" && inputType !== "number") {
              onCancel();
              return;
            }
            onSave(nextValue);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      ) : (
        <EditableCellTrigger
          align={align}
          disabled={isPending}
          label={label}
          onClick={onStartEdit}
          value={value || "—"}
        >
          {children}
        </EditableCellTrigger>
      )}
    </div>
  );
}

export function EditableTextareaCell({
  children,
  editing,
  isPending,
  label,
  onCancel,
  onSave,
  onStartEdit,
  rows = 3,
  value,
}: {
  children: ReactNode;
  editing: boolean;
  isPending: boolean;
  label: string;
  onCancel: () => void;
  onSave: (value: string) => void;
  onStartEdit: () => void;
  rows?: number;
  value: string;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className={cn(editableCellShellClassName, "h-auto min-h-9 items-start")}>
      {editing ? (
        <textarea
          ref={inputRef}
          aria-label={`${label} bewerken`}
          className={cn(inlineInputClassName, "min-h-[5.5rem] resize-y py-2")}
          defaultValue={value}
          disabled={isPending}
          rows={rows}
          onBlur={(event) => onSave(event.currentTarget.value.trim())}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
        />
      ) : (
        <EditableCellTrigger
          disabled={isPending}
          label={label}
          onClick={onStartEdit}
          truncateContent={false}
          value={value || "—"}
        >
          {children}
        </EditableCellTrigger>
      )}
    </div>
  );
}

export function EditableSelectCell({
  children,
  editing,
  isPending,
  label,
  onCancel,
  onSave,
  onStartEdit,
  options,
  value,
}: {
  children: ReactNode;
  editing: boolean;
  isPending: boolean;
  label: string;
  onCancel: () => void;
  onSave: (value: string) => void;
  onStartEdit: () => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const displayLabel = options.find((option) => option.value === value)?.label ?? value;

  useEffect(() => {
    if (editing) selectRef.current?.focus();
  }, [editing]);

  return (
    <div className={editableCellShellClassName}>
      {editing ? (
        <div className="relative w-full">
          <select
            ref={selectRef}
            aria-label={`${label} bewerken`}
            className={inlineSelectClassName}
            defaultValue={value}
            disabled={isPending}
            onBlur={(event) => {
              if (event.currentTarget.value === value) onCancel();
            }}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              if (nextValue && nextValue !== value) onSave(nextValue);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            aria-hidden
            name="expand_more"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          />
        </div>
      ) : (
        <EditableCellTrigger
          disabled={isPending}
          label={label}
          onClick={onStartEdit}
          value={displayLabel}
        >
          {children}
        </EditableCellTrigger>
      )}
    </div>
  );
}

export function formatDecimal(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 3,
  }).format(value);
}

export function MetricValue({ unit, value }: { unit: string; value: number }) {
  return (
    <span className="text-sm">
      <span className="font-semibold text-foreground">{formatDecimal(value)}</span>
      <span className="ml-1.5 text-sm text-muted-foreground">{unit}</span>
    </span>
  );
}

export function EditableNumberCell({
  align = "left",
  editing,
  isPending,
  label,
  onCancel,
  onSave,
  onStartEdit,
  suffix,
  value,
}: {
  align?: "left" | "right";
  editing: boolean;
  isPending: boolean;
  label: string;
  onCancel: () => void;
  onSave: (value: string) => void;
  onStartEdit: () => void;
  suffix: string;
  value: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = String(value);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <div className={cn(editableCellShellClassName, align === "right" && "justify-end")}>
      {editing ? (
        <div
          className={cn(
            "flex h-9 w-full items-center",
            align === "right" ? "justify-end gap-1.5" : "gap-1.5",
          )}
        >
          <input
            ref={inputRef}
            aria-label={`${label} bewerken`}
            className={cn(
              inlineInputClassName,
              "w-[5.5rem] shrink-0",
              align === "right" && "text-right",
            )}
            defaultValue={displayValue}
            disabled={isPending}
            min="0"
            step="0.001"
            type="number"
            onBlur={(event) => onSave(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
          <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>
        </div>
      ) : (
        <EditableCellTrigger
          align={align}
          disabled={isPending}
          label={label}
          onClick={onStartEdit}
          truncateContent={false}
          value={`${formatDecimal(value)} ${suffix}`}
        >
          <MetricValue unit={suffix} value={value} />
        </EditableCellTrigger>
      )}
    </div>
  );
}
