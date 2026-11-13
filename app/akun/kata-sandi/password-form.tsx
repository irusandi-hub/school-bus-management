"use client";

import { useActionState } from "react";
import { completeAccountAction } from "@/lib/auth-actions";
import { idleState, type ActionState } from "@/lib/validation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function PasswordForm() {
  const { t, locale } = useLocale();
  const copy = (value: string | undefined) => translateAdminCopy(value, locale) ?? value;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(completeAccountAction, idleState);
  const passwordError = state.fieldErrors?.password;
  const confirmationError = state.fieldErrors?.password_confirmation;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <label htmlFor="password">{t("newPassword")}</label>
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
        {t("passwordRequirements")}
      </p>
      {passwordError && <p className="field-error">{copy(passwordError)}</p>}

      <label htmlFor="password_confirmation">{t("repeatPassword")}</label>
      <input
        id="password_confirmation"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        aria-invalid={confirmationError ? true : undefined}
      />
      {confirmationError && <p className="field-error">{copy(confirmationError)}</p>}

      {state.status === "error" && (
        <p className="form-alert error" role="alert">
          {copy(state.message)}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? t("savingLabel") : (locale === "id" ? "Simpan kata sandi" : locale === "en" ? "Save password" : "حفظ كلمة المرور")}
      </button>
    </form>
  );
}
