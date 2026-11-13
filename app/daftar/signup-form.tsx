"use client";

import { useActionState } from "react";
import { requestSignupAction } from "@/lib/auth-actions";
import { idleState, type ActionState } from "@/lib/validation";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(requestSignupAction, idleState);
  const { t } = useLocale();
  const emailError = state.fieldErrors?.email;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <label htmlFor="email">{t("registeredGuardianEmail")}</label>
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

      <button type="submit" disabled={pending}>
        {pending ? t("sending") : t("sendVerificationLink")}
      </button>
    </form>
  );
}
