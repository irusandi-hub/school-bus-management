"use client";

import { useActionState } from "react";
import { completeAccountAction } from "@/lib/auth-actions";
import { idleState, type ActionState } from "@/lib/validation";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(completeAccountAction, idleState);
  const passwordError = state.fieldErrors?.password;
  const confirmationError = state.fieldErrors?.password_confirmation;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <label htmlFor="password">Kata sandi baru</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        aria-invalid={passwordError ? true : undefined}
        aria-describedby="password-hint"
      />
      <p className="field-hint" id="password-hint">
        Minimal 8 karakter. Gunakan kombinasi yang tidak dipakai di layanan lain.
      </p>
      {passwordError && <p className="field-error">{passwordError}</p>}

      <label htmlFor="password_confirmation">Ulangi kata sandi</label>
      <input
        id="password_confirmation"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        aria-invalid={confirmationError ? true : undefined}
      />
      {confirmationError && <p className="field-error">{confirmationError}</p>}

      {state.status === "error" && (
        <p className="form-alert error" role="alert">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan kata sandi"}
      </button>
    </form>
  );
}
