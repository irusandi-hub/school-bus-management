"use client";

import { useActionState } from "react";
import { requestSignupAction } from "@/lib/auth-actions";
import { idleState, type ActionState } from "@/lib/validation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(requestSignupAction, idleState);
  const { t, locale } = useLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
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
          {copy(emailError)}
        </p>
      )}

      {state.status === "error" && (
        <p className="form-alert error" role="alert">
          {copy(state.message)}
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
