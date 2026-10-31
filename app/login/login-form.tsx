"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth-actions";
import { idleState, type ActionState } from "@/lib/validation";

export function LoginForm({ next, reason }: { next: string; reason?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, idleState);
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email">Alamat email</label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        aria-invalid={emailError ? true : undefined}
        aria-describedby={emailError ? "email-error" : undefined}
        placeholder="nama@contoh.com"
      />
      {emailError && (
        <p className="field-error" id="email-error">
          {emailError}
        </p>
      )}

      <label htmlFor="password">Kata sandi</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        aria-invalid={passwordError ? true : undefined}
        aria-describedby={passwordError ? "password-error" : undefined}
      />
      {passwordError && (
        <p className="field-error" id="password-error">
          {passwordError}
        </p>
      )}

      {state.status === "error" && (
        <p className="form-alert error" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "idle" && reason && (
        <p className="form-alert info" role="status">
          {reason}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
