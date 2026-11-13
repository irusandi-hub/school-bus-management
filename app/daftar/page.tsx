import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { SignupForm } from "./signup-form";

export default function DaftarPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-locale"><LocaleSwitcher compact /></div>
        <BrandLogo className="auth-logo" />
        <p className="eyebrow"><LocalizedText k="activateGuardian" /></p>
        <h1><LocalizedText k="activationTitle" /></h1>
        <p className="auth-copy"><LocalizedText k="activationIntro" /></p>

        <SignupForm />

        <ol className="auth-steps">
          <li><LocalizedText k="activationStep1" /></li>
          <li><LocalizedText k="activationStep2" /></li>
          <li><LocalizedText k="activationStep3" /></li>
        </ol>

        <p className="auth-footnote"><LocalizedText k="activationFootnote" /></p>

        <div className="auth-links">
          <Link className="auth-back" href="/login">
            <LocalizedText k="alreadyHavePassword" />
          </Link>
          <Link className="auth-back" href="/">
            <LocalizedText k="backHome" />
          </Link>
        </div>
      </section>
    </main>
  );
}
