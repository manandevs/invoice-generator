"use client";

import React, { createContext, useContext, useId, useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { fieldId } from "@/lib/invoice/schema";
import { cn } from "@/lib/utils";

/* ---------- validation context ---------- */

interface FormState {
  /** The message to show for a path, or undefined if it's valid or not yet shown. */
  errorFor: (path: string) => string | undefined;
  touch: (path: string) => void;
  /** Every error currently shown, keyed by path. */
  visible: Record<string, string>;
  /** Bumped on each blocked Continue so collapsed sections can open themselves. */
  revealToken: number;
}

export const FormContext = createContext<FormState>({
  errorFor: () => undefined,
  touch: () => {},
  visible: {},
  revealToken: 0,
});
export const useFormField = (path: string) => {
  const ctx = useContext(FormContext);
  return { error: ctx.errorFor(path), onBlur: () => ctx.touch(path), id: fieldId(path) };
};

/* ---------- layout ---------- */

export const inputClass =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-[15px] text-ink shadow-xs transition placeholder:text-slate-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/20 aria-invalid:border-destructive aria-invalid:ring-destructive/15 disabled:bg-slate-50";

export function Field({
  label,
  htmlFor,
  error,
  help,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : help ? (
        <p id={`${htmlFor}-help`} className="text-xs text-slate-600">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, help?: React.ReactNode) {
  return error ? `${id}-error` : help ? `${id}-help` : undefined;
}

/* ---------- inputs bound to a schema path ---------- */

type TextProps = {
  path: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  help?: React.ReactNode;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id" | "className">;

export function TextField({ path, label, value, onChange, required, help, className, ...rest }: TextProps) {
  const { error, onBlur, id } = useFormField(path);
  return (
    <Field label={label} htmlFor={id} error={error} help={help} required={required} className={className}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy(id, error, help)}
        className={inputClass}
        {...rest}
      />
    </Field>
  );
}

export function TextAreaField({
  path,
  label,
  value,
  onChange,
  help,
  rows = 3,
  placeholder,
  className,
}: {
  path: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: React.ReactNode;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const { error, onBlur, id } = useFormField(path);
  return (
    <Field label={label} htmlFor={id} error={error} help={help} className={className}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, help)}
        className={cn(inputClass, "h-auto resize-y py-2.5 leading-relaxed")}
      />
    </Field>
  );
}

/** Parse what the user typed; empty or partial input becomes NaN so validation can flag it. */
export function parseNumber(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return Number.NaN;
  return Number(cleaned);
}

/**
 * A decimal input that keeps the user's text while typing ("1." stays "1.") and
 * selects everything on focus so the default 0 doesn't need deleting.
 */
export function NumberInput({
  id,
  value,
  onValueChange,
  prefix,
  suffix,
  error,
  className,
  inputClassName,
  allowEmpty = false,
  ...rest
}: {
  id: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  /** Empty input maps to null instead of NaN. */
  allowEmpty?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id" | "prefix">) {
  const format = (v: number | null) => (v === null || Number.isNaN(v) ? "" : String(v));
  const [text, setText] = useState(format(value));
  const [lastValue, setLastValue] = useState(value);
  // Follow outside changes (reset, duplicate) without clobbering in-progress typing.
  if (!Object.is(value, lastValue)) {
    setLastValue(value);
    if (!Object.is(parseNumber(text), value)) setText(format(value));
  }
  return (
    <div className={cn("relative", className)}>
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        aria-invalid={!!error}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^-?[\d,]*\.?\d*$/.test(raw)) return;
          setText(raw);
          const parsed = parseNumber(raw);
          const next = allowEmpty && raw.trim() === "" ? null : parsed;
          setLastValue(next);
          onValueChange(next);
        }}
        className={cn(inputClass, "tabular-nums", prefix && "pl-9", suffix && "pr-8", inputClassName)}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function NumberField({
  path,
  label,
  value,
  onChange,
  prefix,
  suffix,
  help,
  className,
  placeholder,
}: {
  path: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  help?: React.ReactNode;
  className?: string;
  placeholder?: string;
}) {
  const { error, onBlur, id } = useFormField(path);
  return (
    <Field label={label} htmlFor={id} error={error} help={help} className={className}>
      <NumberInput
        id={id}
        value={value}
        onValueChange={(v) => onChange(v ?? Number.NaN)}
        onBlur={onBlur}
        prefix={prefix}
        suffix={suffix}
        error={error}
        placeholder={placeholder}
        aria-describedby={describedBy(id, error, help)}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  path,
  label,
  value,
  onChange,
  options,
  help,
  className,
}: {
  path: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  help?: React.ReactNode;
  className?: string;
}) {
  const { error, id } = useFormField(path);
  return (
    <Field label={label} htmlFor={id} error={error} help={help} className={className}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-describedby={describedBy(id, error, help)}
          className={cn(inputClass, "appearance-none pr-9")}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden />
      </div>
    </Field>
  );
}

/* ---------- collapsible form section ---------- */

export function Section({
  title,
  description,
  open,
  onToggle,
  errorCount = 0,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  errorCount?: number;
  children: React.ReactNode;
}) {
  const contentId = useId();
  return (
    <section className="rounded-xl border border-border bg-white shadow-card">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left sm:px-5"
        >
          <span className="min-w-0">
            <span className="block font-semibold text-ink">{title}</span>
            {description && <span className="block truncate text-sm text-slate-600">{description}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {errorCount > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-destructive">
                {errorCount} to fix
              </span>
            )}
            <ChevronDown className={cn("size-5 text-slate-500 transition-transform", open && "rotate-180")} aria-hidden />
          </span>
        </button>
      </h3>
      <div id={contentId} hidden={!open} className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
        {children}
      </div>
    </section>
  );
}
