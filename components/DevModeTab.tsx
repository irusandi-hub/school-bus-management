"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Section = "about" | "try" | "notes" | null;

const copy = {
  id: {
    title: "Informasi Demo",
    active: "Mode Demo Aktif",
    intro: "Kenali School Bus Management melalui lingkungan simulasi. Tidak diperlukan akun operasional.",
    about: "Tentang Demo",
    try: "Apa yang Bisa Dicoba",
    notes: "Catatan Penting",
    environment: "Lingkungan",
    access: "Akses",
    data: "Data",
    simulated: "Simulasi",
    open: "Terbuka untuk dicoba",
    profiles: "Kenali aplikasi melalui profil berikut:",
    operator: "Pengelola",
    operatorDesc: "Mengenal pengelolaan armada dan operasional layanan.",
    driver: "Pengemudi",
    driverDesc: "Mengenal tugas, daftar penumpang, dan alur perjalanan.",
    parent: "Orang Tua",
    parentDesc: "Mengenal pemantauan perjalanan anak.",
    school: "Sekolah",
    schoolDesc: "Mengenal pengelolaan layanan transportasi sekolah.",
    login: "Kode OTP Demo",
    otpHelp: "Gunakan kode sesuai profil yang ingin dicoba.",
    techTitle: "Teknologi dan integrasi",
    maps: "Navigasi saat ini menggunakan Google Maps. Layanan peta dan routing lain dapat diintegrasikan sesuai kebutuhan.",
    routing: "Perhitungan rute dapat dikembangkan dengan data lalu lintas terkini, urutan pemberhentian, dan kebutuhan operasional bus.",
    cameraTech: "Untuk Demo, kamera perangkat mobile dapat digunakan. Pada operasional, aplikasi dapat diintegrasikan dengan sistem kamera atau DVR yang sudah terpasang di bus.",
    gpsTech: "Lokasi dapat memanfaatkan GPS ponsel pengemudi atau perangkat GPS kendaraan yang kompatibel.",
    flexible: "Integrasi dapat disesuaikan dengan perangkat dan penyedia layanan yang dipilih, sehingga sistem tidak bergantung pada satu jenis perangkat.",
    mainOperator: "Pengelola",
    parentA: "Orang Tua A",
    parentB: "Orang Tua B",
    parentC: "Orang Tua C",
    children: "Anak",
    copy: "Salin",
    copied: "Kode OTP disalin",
    privacyTitle: "Privasi dan keamanan anak",
    privacy: "Pemantauan anak hanya tersedia saat anak sedang berada di dalam bus. Akses lokasi dan kamera hanya diberikan kepada orang tua yang terhubung dengan anak tersebut. Orang tua lain dan pengunjung umum tidak dapat mengakses pemantauan anak.",
    simulatedData: "Seluruh profil dan data yang ditampilkan merupakan simulasi, bukan data anak atau perjalanan sebenarnya.",
    gps: "Lokasi bus dalam Demo bukan posisi kendaraan sebenarnya.",
    camera: "Tampilan kamera dalam Demo tidak menjamin tersedianya siaran langsung.",
    operation: "Penggunaan operasional memerlukan akun resmi dan otorisasi.",
    close: "Tutup informasi mode demo",
    demoLabel: "DEMO",
  },
  en: {
    title: "Demo Information",
    active: "Demo Mode Active",
    intro: "Explore School Bus Management in a simulated environment. No operational account is required.",
    about: "About the Demo",
    try: "What You Can Explore",
    notes: "Important Notes",
    environment: "Environment",
    access: "Access",
    data: "Data",
    simulated: "Simulation",
    open: "Open to explore",
    profiles: "Explore the app through these profiles:",
    operator: "Operator",
    operatorDesc: "Explore fleet management and service operations.",
    driver: "Driver",
    driverDesc: "Explore assignments, passenger lists, and trip flow.",
    parent: "Parents",
    parentDesc: "Explore the child journey monitoring experience.",
    school: "School",
    schoolDesc: "Explore school transportation service management.",
    login: "Demo OTP Codes",
    otpHelp: "Use the code for the profile you want to explore.",
    techTitle: "Technology and integration",
    maps: "Navigation currently opens Google Maps. Other map and routing services can be integrated as needed.",
    routing: "Routing can be enhanced with live traffic data, planned stop order, and bus operational requirements.",
    cameraTech: "For the Demo, a mobile device camera can be used. In operation, the app can integrate with camera or DVR systems already installed on the bus.",
    gpsTech: "Location can use the driver phone GPS or a compatible vehicle GPS device.",
    flexible: "Integrations can be adapted to the selected devices and service providers, without depending on a single device type.",
    mainOperator: "Operator",
    parentA: "Parent A",
    parentB: "Parent B",
    parentC: "Parent C",
    children: "Children",
    copy: "Copy",
    copied: "OTP code copied",
    privacyTitle: "Child privacy and safety",
    privacy: "Child monitoring is available only while the child is on the bus. Location and camera access is limited to the parent linked to that child. Other parents and the public cannot access the child's monitoring.",
    simulatedData: "All profiles and displayed data are simulated, not real children or actual trips.",
    gps: "The bus location in the Demo is not the vehicle's actual position.",
    camera: "The Demo camera view does not guarantee a live stream.",
    operation: "Operational use requires an official account and authorization.",
    close: "Close demo information",
    demoLabel: "DEMO",
  },
  ar: {
    title: "معلومات العرض التجريبي",
    active: "العرض التجريبي نشط",
    intro: "تعرّف على School Bus Management في بيئة تجريبية. لا يلزم حساب تشغيلي.",
    about: "حول العرض التجريبي",
    try: "ما الذي يمكنك تجربته",
    notes: "ملاحظات مهمة",
    environment: "البيئة",
    access: "الوصول",
    data: "البيانات",
    simulated: "محاكاة",
    open: "متاح للتجربة",
    profiles: "تعرّف على التطبيق من خلال الملفات التالية:",
    operator: "المشغّل",
    operatorDesc: "تعرّف على إدارة الحافلات والعمليات.",
    driver: "السائق",
    driverDesc: "تعرّف على المهام وقائمة الركاب ومسار الرحلة.",
    parent: "أولياء الأمور",
    parentDesc: "تعرّف على متابعة رحلة الطفل.",
    school: "المدرسة",
    schoolDesc: "تعرّف على إدارة خدمات النقل المدرسي.",
    login: "رموز الدخول التجريبية",
    otpHelp: "استخدم الرمز الخاص بالملف الذي تريد تجربته.",
    techTitle: "التقنيات والتكامل",
    maps: "تستخدم الملاحة حالياً خرائط Google. ويمكن دمج خدمات خرائط وتوجيه أخرى حسب الحاجة.",
    routing: "يمكن تطوير حساب المسارات بالاستفادة من بيانات المرور المباشرة وترتيب المحطات ومتطلبات تشغيل الحافلات.",
    cameraTech: "يمكن استخدام كاميرا الهاتف في العرض التجريبي. وفي التشغيل الفعلي، يمكن ربط التطبيق بأنظمة الكاميرات أو أجهزة DVR المثبتة في الحافلة.",
    gpsTech: "يمكن تحديد الموقع باستخدام GPS هاتف السائق أو جهاز GPS متوافق في المركبة.",
    flexible: "يمكن تكييف التكامل مع الأجهزة ومزودي الخدمات المختارين، دون الاعتماد على نوع واحد من الأجهزة.",
    mainOperator: "المشغّل",
    parentA: "ولي الأمر أ",
    parentB: "ولي الأمر ب",
    parentC: "ولي الأمر ج",
    children: "الأطفال",
    copy: "نسخ",
    copied: "تم نسخ رمز التحقق",
    privacyTitle: "خصوصية الطفل وسلامته",
    privacy: "تتوفر متابعة الطفل فقط أثناء وجوده داخل الحافلة. ويقتصر الوصول إلى الموقع والكاميرا على ولي الأمر المرتبط بذلك الطفل. لا يمكن لأولياء الأمور الآخرين أو عامة الزوار الوصول إلى متابعة الطفل.",
    simulatedData: "جميع الملفات والبيانات المعروضة تجريبية وليست بيانات أطفال أو رحلات حقيقية.",
    gps: "موقع الحافلة في العرض التجريبي ليس موقع المركبة الفعلي.",
    camera: "لا يضمن عرض الكاميرا التجريبي توفر بث مباشر.",
    operation: "يتطلب الاستخدام التشغيلي حساباً رسمياً وتصريحاً.",
    close: "إغلاق معلومات العرض التجريبي",
    demoLabel: "DEMO",
  },
} as const;

const demoAccounts = [
  { label: "mainOperator", code: "123456", children: [] as string[] },
  { label: "driver", code: "234567", children: [] as string[] },
  { label: "parentA", code: "345001", children: ["Anak 1", "Anak 2", "Anak 3"] },
  { label: "parentB", code: "345002", children: ["Anak 4"] },
  { label: "parentC", code: "345003", children: ["Anak 5"] },
] as const;

// Panel demo hanya ditampilkan di landing page.
export function DevModeTab({ environment }: { environment: string; sha?: string; branch?: string }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("about");
  const [copied, setCopied] = useState<string | null>(null);
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    close.current?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const toggleSection = (next: Exclude<Section, null>) => setSection((current) => current === next ? null : next);
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied((current) => current === code ? null : current), 1800);
    } catch {
      setCopied(null);
    }
  };

  if (pathname !== "/") return null;

  return <div className="dev-mode-banner" ref={root} data-open={open} data-environment={environment}>
    <button ref={trigger} type="button" className="dev-mode-tab" aria-label={t.demoLabel} aria-expanded={open} aria-controls={open ? "dev-mode-panel" : undefined} onClick={() => setOpen(!open)}>
      <span className="dev-mode-tab-face"><span className="dev-mode-indicator" aria-hidden="true" /><span className="dev-mode-short" aria-hidden="true">DEMO</span></span>
    </button>
    {open && <section className="dev-mode-panel" id="dev-mode-panel" aria-labelledby="dev-mode-title">
      <header>
        <h2 id="dev-mode-title">{t.title}</h2>
        <button ref={close} className="dev-mode-close" type="button" aria-label={t.close} onClick={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }}>×</button>
      </header>
      <div className="dev-mode-status"><span className="dev-mode-status-dot" />{t.active}</div>
      <p>{t.intro}</p>

      <section className="dev-mode-section">
        <button className="dev-mode-section-toggle" type="button" aria-expanded={section === "about"} onClick={() => toggleSection("about")}>
          <span>01. {t.about}</span><span aria-hidden="true">{section === "about" ? "−" : "+"}</span>
        </button>
        {section === "about" && <div className="dev-mode-section-content">
          <dl>
            <div><dt>{t.environment}</dt><dd>{t.simulated}</dd></div>
            <div><dt>{t.access}</dt><dd>{t.open}</dd></div>
            <div><dt>{t.data}</dt><dd>{t.simulated}</dd></div>
          </dl>
        </div>}
      </section>

      <section className="dev-mode-section">
        <button className="dev-mode-section-toggle" type="button" aria-expanded={section === "try"} onClick={() => toggleSection("try")}>
          <span>02. {t.try}</span><span aria-hidden="true">{section === "try" ? "−" : "+"}</span>
        </button>
        {section === "try" && <div className="dev-mode-section-content">
          <p className="dev-mode-muted">{t.profiles}</p>
          <ul className="dev-mode-profile-list">
            <li><strong>{t.operator}</strong><span>{t.operatorDesc}</span></li>
            <li><strong>{t.driver}</strong><span>{t.driverDesc}</span></li>
            <li><strong>{t.parent}</strong><span>{t.parentDesc}</span></li>
          </ul>
          <div className="dev-mode-login">
            <h3>{t.login}</h3>
            <p className="dev-mode-muted">{t.otpHelp}</p>
            <ul className="dev-mode-account-list">
              {demoAccounts.map((account) => {
                const label = t[account.label as keyof typeof t] as string;
                return <li key={account.code}>
                  <div className="dev-mode-account-main">
                    <strong>{label}</strong>
                    {account.children.length > 0 && <span>{account.children.join(" · ")}</span>}
                  </div>
                  <div className="dev-mode-code">
                    <code>{account.code}</code>
                    <button type="button" className="dev-mode-copy" aria-label={t.copy + " " + label} onClick={() => void copyCode(account.code)}>{copied === account.code ? "✓" : "⧉"}</button>
                  </div>
                </li>;
              })}
            </ul>
            {copied && <p className="dev-mode-copy-feedback" role="status">{t.copied}</p>}
          </div>
          <div className="dev-mode-tech">
            <h3>{t.techTitle}</h3>
            <ul className="dev-mode-notes">
              <li>{t.maps}</li>
              <li>{t.routing}</li>
              <li>{t.cameraTech}</li>
              <li>{t.gpsTech}</li>
              <li>{t.flexible}</li>
            </ul>
          </div>
        </div>}
      </section>

      <section className="dev-mode-section">
        <button className="dev-mode-section-toggle" type="button" aria-expanded={section === "notes"} onClick={() => toggleSection("notes")}>
          <span>03. {t.notes}</span><span aria-hidden="true">{section === "notes" ? "−" : "+"}</span>
        </button>
        {section === "notes" && <div className="dev-mode-section-content">
          <div className="dev-mode-privacy">
            <strong>{t.privacyTitle}</strong>
            <p>{t.privacy}</p>
          </div>
          <ul className="dev-mode-notes">
            <li>{t.simulatedData}</li>
            <li>{t.gps}</li>
            <li>{t.camera}</li>
            <li>{t.operation}</li>
          </ul>
        </div>}
      </section>
    </section>}
  </div>;
}
