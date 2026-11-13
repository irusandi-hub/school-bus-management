"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyDemoOtp } from "./actions";

const DEMO_CODES = [
  { label: "Operator Utama", code: "123456", detail: "Akses pengelolaan aplikasi" },
  { label: "Pengemudi", code: "234567", detail: "Akses operasional perjalanan" },
  { label: "Orang Tua 1", code: "345001", detail: "Terhubung dengan 3 anak" },
  { label: "Orang Tua 2", code: "345002", detail: "Terhubung dengan 1 anak" },
  { label: "Orang Tua 3", code: "345003", detail: "Terhubung dengan 1 anak" },
];

export function LoginForm({ next, reason }: { next: string; reason?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setNotice("Masukkan nomor simulasi minimal 10 digit, misalnya 0123456789.");
      return;
    }
    setNotice("");
    setStep("otp");
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = otp.split("");
    nextOtp[index] = digit;
    const updated = Array.from({ length: 6 }, (_, position) => nextOtp[position] ?? "").join("");
    setOtp(updated);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setOtp(pasted);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Tampilan OTP simulasi siap. Validasi kode dan pembuatan sesi autentikasi akan dihubungkan pada tahap implementasi auth.");
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className="auth-otp-flow">
      {step === "phone" ? (
        <form className="auth-form" onSubmit={requestCode} noValidate>
          <label htmlFor="phone">Nomor HP (simulasi)</label>
          <div className="auth-phone-field">
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0123456789"
              aria-describedby="phone-hint"
              required
            />
          </div>
          <p className="auth-input-hint" id="phone-hint">
            Nomor ini hanya untuk membuka form OTP simulasi. Tidak digunakan untuk mencari akun atau mengirim SMS.
          </p>
          {notice && <p className="form-alert error" role="alert">{notice}</p>}
          {reason && <p className="form-alert info" role="status">{reason}</p>}
          <button type="submit">Kirim Kode OTP <span aria-hidden="true">→</span></button>

          <section className="auth-demo-codes" aria-label="Kode OTP demo">
            <div className="auth-demo-heading">
              <span className="auth-demo-icon" aria-hidden="true">⌘</span>
              <div>
                <strong>Kode OTP untuk demo</strong>
                <small>Pilih kode sesuai akun simulasi</small>
              </div>
              <span className="auth-demo-tag">DEMO</span>
            </div>
            <div className="auth-demo-list">
              {DEMO_CODES.map((item) => (
                <div className="auth-demo-row" key={item.code}>
                  <span className="auth-demo-account">
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <code>{item.code}</code>
                  <button type="button" className="auth-copy-code" onClick={() => copyCode(item.code)} aria-label={`Salin kode ${item.label}`}>
                    {copied === item.code ? "Tersalin" : "Salin"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </form>
      ) : (
        <form className="auth-form" onSubmit={verifyCode} noValidate>
          <div className="auth-otp-destination">
            <span className="auth-otp-destination-icon" aria-hidden="true">✓</span>
            <p>Form OTP simulasi dibuka untuk nomor</p>
            <strong>{phone}</strong>
            <button type="button" onClick={() => { setStep("phone"); setOtp(""); setNotice(""); }}>Ubah nomor</button>
          </div>
          <label htmlFor="otp-0">Masukkan kode OTP 6 digit</label>
          <div className="auth-otp-inputs" onPaste={handlePaste}>
            {Array.from({ length: 6 }, (_, index) => (
              <input
                key={index}
                ref={(element) => { inputRefs.current[index] = element; }}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                pattern="[0-9]*"
                maxLength={1}
                value={otp[index] ?? ""}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
                  if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
                  if (event.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
                }}
                aria-label={`Digit OTP ke-${index + 1}`}
              />
            ))}
          </div>
          <p className="auth-input-hint">Masukkan salah satu kode OTP tetap yang sudah tersedia di sistem demo.</p>
          {notice && <p className="form-alert info" role="status">{notice}</p>}
          <button type="submit" disabled={otp.length !== 6}>Verifikasi &amp; Masuk <span aria-hidden="true">→</span></button>
          <button type="button" className="auth-text-button" onClick={() => { setOtp(""); setNotice("Kode OTP demo tetap berlaku. Masukkan kembali kode akun Anda."); }}>
            Kirim ulang kode
          </button>
        </form>
      )}
      <input type="hidden" name="next" value={next} />
    </div>
  );
}
