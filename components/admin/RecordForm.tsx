"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { useConfirm } from "@/components/ui/DialogProvider";
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
  /** Menampilkan formulir tetap utuh, tetapi menonaktifkan semua kontrol. */
  disabledReason?: string;
};

export function RecordForm({ action, fields, submitLabel, hidden, note, secondary, confirmMessage, disabledReason }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, idleState);
  const confirm = useConfirm();
  const confirming = useRef(false);
  const approved = useRef(false);
  const formDisabled = Boolean(disabledReason);

  return (
    <form action={formAction} className="record-form" onSubmit={async (event) => {
      if (!confirmMessage) return;
      if (approved.current) { approved.current = false; return; }
      event.preventDefault();
      if (confirming.current || pending || formDisabled) return;
      const form = event.currentTarget;
      const submitter = (event.nativeEvent as SubmitEvent).submitter;
      confirming.current = true;
      const accepted = await confirm({ title: "Konfirmasi perubahan", message: confirmMessage, confirmText: "Simpan", cancelText: "Batal" });
      confirming.current = false;
      if (!accepted || !form.isConnected) return;
      approved.current = true;
      form.requestSubmit(submitter instanceof HTMLButtonElement ? submitter : undefined);
    }} noValidate aria-disabled={formDisabled || undefined}>
      {hidden &&
        Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}

      {disabledReason && (
        <p className="form-alert warning" role="status">
          {disabledReason}
        </p>
      )}

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
                  <input
                    type="checkbox"
                    name={field.name}
                    defaultChecked={Boolean(field.defaultValue)}
                    disabled={formDisabled}
                  />
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
                  disabled={formDisabled}
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
                  disabled={formDisabled}
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
                  disabled={formDisabled}
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
          disabled={pending || formDisabled}
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
