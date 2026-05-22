"use client";

import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import {
  modalFieldHelperClassName,
  modalFieldInputClassName,
  modalFieldLabelClassName,
  modalFieldSelectClassName,
} from "@/components/settings/settings-styles";

export function FormError({ message }: { message: string }) {
  return (
    <p
      className="rounded-[0.85rem] bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="mt-6 flex flex-col items-start gap-2 rounded-sm bg-card p-5 shadow-sm">
      <Icon name={icon} className="text-xl text-primary" filled />
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}

export function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-4 border-t border-border/40 pt-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function Field({
  className,
  defaultValue,
  helper,
  label,
  name,
  type = "text",
  ...rest
}: {
  className?: string;
  defaultValue?: string | number;
  helper?: string;
  label: string;
  name: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue">) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)} htmlFor={name}>
      <span className={modalFieldLabelClassName}>{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className={modalFieldInputClassName}
        {...rest}
      />
      {helper ? <span className={modalFieldHelperClassName}>{helper}</span> : null}
    </label>
  );
}

export function SelectField({
  defaultValue,
  emptyOption,
  helper,
  label,
  name,
  onChange,
  options,
  required = true,
}: {
  defaultValue?: string;
  emptyOption?: string;
  helper?: string;
  label: string;
  name: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={name}>
      <span className={modalFieldLabelClassName}>{label}</span>
      <div className="relative">
        <select
          aria-label={label}
          className={modalFieldSelectClassName}
          defaultValue={defaultValue ?? ""}
          id={name}
          name={name}
          onChange={onChange}
          required={required}
        >
          {emptyOption ? <option value="">{emptyOption}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          aria-hidden
          name="expand_more"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
        />
      </div>
      {helper ? <span className={modalFieldHelperClassName}>{helper}</span> : null}
    </label>
  );
}
