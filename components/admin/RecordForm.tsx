"use client";

import Link from "next/link";
import { useActionState } from "react";
import { idleState, type ActionState } from "@/lib/validation";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean | null;
  step?: string;
  min?: string;
  max?: string;
  maxLength?: number;
  autoComplete?: string;
  fullWidth?: boolean;
  readOnly?: boolean;
};

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: FieldDef[];
  submitLabel: string;
  hidden?: Record<string, string>;
  note?: string;
  secondary?: { href: string; label: string };
  confirmMessage?: string;
};

export function RecordForm({ action, fields, submitLabel, hidden, note, secondary, confirmMessage }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, idleState);

  return (
    <form action={formAction} className="record-form" noValidate>
      {hidden &&
        Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}

      <div className="record-grid">
        {fields.map((field) => {
          const type = field.type ?? "text";
          const error = state.fieldErrors?.[field.name];
          const errorId = `${field.name}-error`;
          const helpId = `${field.name}-help`;
          const describedBy = [error ? errorId : null, field.help ? helpId : null].filter(Boolean).join(" ");

          if (type === "checkbox") {
            return (
              <div className="field field-wide" key={field.name}>
                <label className="checkbox-field">
                  <input type="checkbox" name={field.name} defaultChecked={Boolean(field.defaultValue)} />
                  <span>{field.label}</span>
                </label>
                {field.help && (
                  <p className="field-hint" id={helpId}>
                    {field.help}
                  </p>
                )}
                {error && (
                  <p className="field-error" id={errorId}>
                    {error}
                  </p>
                )}
              </div>
            );
          }

          return (
            <div className={field.fullWidth ? "field field-wide" : "field"} key={field.name}>
              <label htmlFor={field.name}>
                {field.label}
                {field.required ? " *" : ""}
              </label>

              {type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  required={field.required}
                  readOnly={field.readOnly}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  defaultValue={(field.defaultValue as string | null) ?? ""}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy || undefined}
                />
              ) : type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  defaultValue={(field.defaultValue as string | null) ?? ""}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy || undefined}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={type}
                  required={field.required}
                  readOnly={field.readOnly}
                  placeholder={field.placeholder}
                  step={field.step ?? (type === "number" ? "any" : undefined)}
                  min={field.min}
                  max={field.max}
                  maxLength={field.maxLength}
                  autoComplete={field.autoComplete}
                  defaultValue={
                    field.defaultValue === null || field.defaultValue === undefined
                      ? ""
                      : String(field.defaultValue)
                  }
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy || undefined}
                />
              )}

              {field.help && (
                <p className="field-hint" id={helpId}>
                  {field.help}
                </p>
              )}
              {error && (
                <p className="field-error" id={errorId}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {note && <p className="form-note">{note}</p>}

      {state.status === "error" && (
        <p className="form-alert error" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="form-alert success" role="status">
          {state.message}
        </p>
      )}

      <div className="form-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={pending}
          onClick={(event) => {
            if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
          }}
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
        {secondary && (
          <Link className="btn btn-ghost" href={secondary.href}>
            {secondary.label}
          </Link>
        )}
      </div>
    </form>
  );
}
