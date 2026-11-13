"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth-actions";
import { idleState, type ActionState } from "@/lib/validation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function LoginForm({ next, reason }: { next: string; reason?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, idleState);
  const { t, locale } = useLocale();
  const copy = (value: string | undefined) => value ? translateAdminCopy(value, locale) ?? value : undefined;
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email">{t("emailAddress")}</label>
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
          {copy(emailError)}
        </p>
      )}

      <label htmlFor="password">{t("password")}</label>
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
          {copy(passwordError)}
        </p>
      )}

      {state.status === "error" && (
        <p className="form-alert error" role="alert">
          {copy(state.message)}
        </p>
      )}
      {state.status === "idle" && reason && (
        <p className="form-alert info" role="status">
          {copy(reason)}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? t("checking") : t("signIn")}
      </button>
    </form>
  );
}
