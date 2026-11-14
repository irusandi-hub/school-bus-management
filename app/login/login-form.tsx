"use client";

import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { DEMO_OTP_DESTINATIONS, isDemoOtpValid, type DemoOtpRole } from "@/lib/demo-otp";

const OTP_LENGTH = 6;

export function LoginForm({
  role,
  simulationEnabled,
}: {
  role: DemoOtpRole;
  simulationEnabled: boolean;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function fillFrom(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!value) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    const next = [...digits];
    [...value].forEach((digit, offset) => {
      if (index + offset < OTP_LENGTH) next[index + offset] = digit;
    });
    setDigits(next);
    setError("");
    const focusIndex = Math.min(index + value.length, OTP_LENGTH - 1);
    inputs.current[focusIndex]?.focus();
  }

  function handleChange(index: number, value: string) {
    fillFrom(index, value);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!/\d/.test(pasted)) return;
    event.preventDefault();
    fillFrom(0, pasted);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!simulationEnabled || pending) return;

    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setError(t("otpIncomplete"));
      return;
    }
    if (!isDemoOtpValid(role, code)) {
      setError(t("otpInvalid"));
      return;
    }

    setError("");
    setPending(true);
    router.replace(DEMO_OTP_DESTINATIONS[role]);
    router.refresh();
  }

  return (
    <form className="auth-form otp-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="otp-fieldset" disabled={!simulationEnabled || pending}>
        <legend className="sr-only">{t("otpTitle")}</legend>
        <div className="otp-code-grid" dir="ltr">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => { inputs.current[index] = element; }}
              className="otp-code-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={OTP_LENGTH}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`OTP ${index + 1}`}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onPaste={handlePaste}
              onKeyDown={(event) => handleKeyDown(index, event)}
            />
          ))}
        </div>
      </fieldset>

      {error && <p className="form-alert error" role="alert">{error}</p>}
      {!simulationEnabled && <p className="form-alert info" role="status">{t("otpUnavailable")}</p>}

      <button type="submit" disabled={!simulationEnabled || pending || digits.some((digit) => !digit)}>
        {pending ? t("checking") : t("otpVerify")}
      </button>
    </form>
  );
}
