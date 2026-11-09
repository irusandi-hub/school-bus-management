/**
 * Landing page copy for every supported language.
 * Content is grouped by section so replacing text never requires touching markup.
 *
 * NOTE (Arabic): the `ar` copy was written for layout and accessibility testing.
 * It must be reviewed by a native Arabic speaker before production launch,
 * especially the role descriptions and the legal footer labels.
 */

export const LANGUAGES = [
  { code: "id", label: "Indonesia", short: "ID" },
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "AR" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

type Feature = { title: string; description: string };
type Role = { title: string; description: string; chips: [string, string] };

export type Dictionary = {
  dir: "ltr" | "rtl";
  pageTitle: string;
  a11y: { skip: string; language: string };
  brandAria: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    downloadAria: string;
    downloadVia: string;
    android: string;
    ios: string;
    web: string;
    imageAlt: string;
  };
  trust: { aria: string; items: [{ value: string; label: string }, { value: string; label: string }, { value: string; label: string }] };
  features: [Feature, Feature, Feature];
  roles: { eyebrow: string; title: string; items: [Role, Role, Role] };
  access: { title: string; signIn: string; signUp: string; note: string; noteLink: string };
  demo: {
    tab: string;
    open: string;
    title: string;
    kicker: string;
    environmentLabel: string;
    environment: string;
    versionLabel: string;
    noteTitle: string;
    note: string;
    hint: string;
  };
  footer: { copyright: string; privacy: string; terms: string; help: string };
};

const id: Dictionary = {
  dir: "ltr",
  pageTitle: "SchoolBus — Manajemen Transportasi Sekolah",
  a11y: {
    skip: "Lewati ke konten utama",
    language: "Bahasa: Indonesia. Pilih bahasa",
  },
  brandAria: "SchoolBus — beranda",
  hero: {
    eyebrow: "Manajemen transportasi sekolah",
    title: "Perjalanan sekolah yang lebih aman untuk setiap anak.",
    subtitle:
      "SchoolBus menghubungkan sekolah, pengemudi, dan orang tua dalam satu alur yang jelas — dari penjemputan hingga anak tiba dengan selamat.",
    downloadAria: "Unduh aplikasi SchoolBus",
    downloadVia: "Unduh di",
    android: "Google Play",
    ios: "App Store",
    web: "Buka versi web",
    imageAlt: "Ilustrasi bus sekolah kuning di depan gedung sekolah",
  },
  trust: {
    aria: "Bukti kepercayaan sekolah",
    // Placeholder figures — replace with verified production numbers.
    items: [
      { value: "120+", label: "Sekolah bermitra" },
      { value: "48.000+", label: "Perjalanan aman" },
      { value: "98%", label: "Ketepatan waktu" },
    ],
  },
  features: [
    { title: "Lacak langsung", description: "Posisi bus dan status perjalanan diperbarui sepanjang rute." },
    { title: "Notifikasi", description: "Kabar saat bus mendekat, anak naik, dan tiba di sekolah." },
    { title: "Keamanan", description: "Akses sesuai peran, catatan perjalanan, dan pengemudi terverifikasi." },
  ],
  roles: {
    eyebrow: "Peran",
    title: "Untuk setiap orang di perjalanan",
    items: [
      {
        title: "Orang Tua",
        description: "Pantau posisi bus, status anak, dan riwayat perjalanan tanpa menebak-nebak.",
        chips: ["Lacak langsung", "Notifikasi"],
      },
      {
        title: "Pengemudi",
        description: "Rute, daftar siswa, dan pemeriksaan keselamatan dalam satu layar.",
        chips: ["Rute harian", "Checklist"],
      },
      {
        title: "Pengelola",
        description: "Kelola armada, pengemudi, jadwal, dan laporan lintas sekolah.",
        chips: ["Keamanan", "Laporan"],
      },
    ],
  },
  access: {
    title: "Hadirkan rasa aman dan tenang untuk sekolah Anda.",
    signIn: "Masuk",
    signUp: "Daftar",
    note: "Belum punya akun?",
    noteLink: "Daftar di sini",
  },
  demo: {
    tab: "Demo",
    open: "Buka informasi lingkungan demo",
    title: "Lingkungan demo",
    kicker: "Pratinjau produk",
    environmentLabel: "Status lingkungan",
    environment: "Vercel · Pratinjau",
    versionLabel: "Versi",
    noteTitle: "Catatan data",
    note: "Data di halaman ini adalah data contoh. Bukan data perjalanan, siswa, atau sekolah yang sebenarnya.",
    hint: "Ketuk di luar panel atau geser untuk menutup.",
  },
  footer: {
    copyright: "© 2026 School Bus Management",
    privacy: "Kebijakan Privasi",
    terms: "Syarat",
    help: "Bantuan",
  },
};

const en: Dictionary = {
  dir: "ltr",
  pageTitle: "SchoolBus — School Transport Management",
  a11y: {
    skip: "Skip to main content",
    language: "Language: English. Choose a language",
  },
  brandAria: "SchoolBus — home",
  hero: {
    eyebrow: "School transport management",
    title: "A safer school run for every child.",
    subtitle:
      "SchoolBus brings schools, drivers, and parents into one clear flow — from pickup to a safe arrival home.",
    downloadAria: "Download the SchoolBus app",
    downloadVia: "Download on",
    android: "Google Play",
    ios: "App Store",
    web: "Open the web app",
    imageAlt: "Illustration of a yellow school bus outside a school building",
  },
  trust: {
    aria: "School trust indicators",
    // Placeholder figures — replace with verified production numbers.
    items: [
      { value: "120+", label: "Partner schools" },
      { value: "48,000+", label: "Safe trips" },
      { value: "98%", label: "On-time arrivals" },
    ],
  },
  features: [
    { title: "Live tracking", description: "Bus location and trip status update along the whole route." },
    { title: "Notifications", description: "Know when the bus is near, your child boards, and arrives." },
    { title: "Safety", description: "Role-based access, trip records, and verified drivers." },
  ],
  roles: {
    eyebrow: "Roles",
    title: "For everyone on the journey",
    items: [
      {
        title: "Parents",
        description: "Follow the bus, your child's status, and trip history without guesswork.",
        chips: ["Live tracking", "Notifications"],
      },
      {
        title: "Drivers",
        description: "Route, student list, and safety checks on one screen.",
        chips: ["Daily route", "Checklist"],
      },
      {
        title: "Administrators",
        description: "Manage fleet, drivers, schedules, and reports across schools.",
        chips: ["Safety", "Reports"],
      },
    ],
  },
  access: {
    title: "Bring Safety and Peace of Mind to Your School",
    signIn: "Sign in",
    signUp: "Sign up",
    note: "Don't have an account?",
    noteLink: "Sign up here",
  },
  demo: {
    tab: "Demo",
    open: "Open demo environment details",
    title: "Demo environment",
    kicker: "Product preview",
    environmentLabel: "Environment status",
    environment: "Vercel · Preview",
    versionLabel: "Version",
    noteTitle: "About this data",
    note: "Data on this page is sample data. It is not real trip, student, or school data.",
    hint: "Tap outside the panel or swipe to close it.",
  },
  footer: {
    copyright: "© 2026 School Bus Management",
    privacy: "Privacy Policy",
    terms: "Terms",
    help: "Help",
  },
};

const ar: Dictionary = {
  dir: "rtl",
  pageTitle: "SchoolBus — إدارة النقل المدرسي",
  a11y: {
    skip: "تجاوز إلى المحتوى الرئيسي",
    language: "اللغة: العربية. اختر لغة",
  },
  brandAria: "SchoolBus — الصفحة الرئيسية",
  hero: {
    eyebrow: "إدارة النقل المدرسي",
    title: "رحلة مدرسية أكثر أمانًا لكل طفل.",
    subtitle:
      "يجمع SchoolBus المدرسة والسائق وأولياء الأمور في مسار واضح واحد — من الصعود إلى الوصول بأمان.",
    downloadAria: "حمّل تطبيق SchoolBus",
    downloadVia: "حمّل من",
    android: "Google Play",
    ios: "App Store",
    web: "افتح نسخة الويب",
    imageAlt: "رسم توضيحي لحافلة مدرسية صفراء أمام مبنى المدرسة",
  },
  trust: {
    aria: "مؤشرات ثقة المدارس",
    // Placeholder figures — replace with verified production numbers.
    items: [
      { value: "120+", label: "مدرسة شريكة" },
      { value: "48,000+", label: "رحلة آمنة" },
      { value: "98%", label: "الالتزام بالمواعيد" },
    ],
  },
  features: [
    { title: "تتبّع مباشر", description: "موقع الحافلة وحالة الرحلة محدّثان طوال المسار." },
    { title: "إشعارات", description: "تنبيهات عند اقتراب الحافلة وصعود الطفل ووصوله." },
    { title: "الأمان", description: "صلاحيات حسب الدور وسجل رحلات وسائقون موثّقون." },
  ],
  roles: {
    eyebrow: "الأدوار",
    title: "لكل من يشارك في الرحلة",
    items: [
      {
        title: "أولياء الأمور",
        description: "تابع موقع الحافلة وحالة طفلك وسجل الرحلات دون تخمين.",
        chips: ["تتبّع مباشر", "إشعارات"],
      },
      {
        title: "السائقون",
        description: "المسار وقائمة الطلاب وقائمة فحص السلامة في شاشة واحدة.",
        chips: ["مسار اليوم", "قائمة الفحص"],
      },
      {
        title: "الإدارة",
        description: "إدارة الأسطول والسائقين والجداول والتقارير عبر المدارس.",
        chips: ["الأمان", "التقارير"],
      },
    ],
  },
  access: {
    title: "امنح مدرستك الأمان وراحة البال.",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    note: "ليس لديك حساب؟",
    noteLink: "سجّل هنا",
  },
  demo: {
    tab: "تجريبي",
    open: "فتح معلومات البيئة التجريبية",
    title: "البيئة التجريبية",
    kicker: "معاينة المنتج",
    environmentLabel: "حالة البيئة",
    environment: "Vercel · معاينة",
    versionLabel: "الإصدار",
    noteTitle: "ملاحظة عن البيانات",
    note: "البيانات في هذه الصفحة بيانات توضيحية وليست رحلات أو طلابًا أو مدارس حقيقية.",
    hint: "اضغط خارج اللوحة أو اسحب لإغلاقها.",
  },
  footer: {
    copyright: "© 2026 School Bus Management",
    privacy: "سياسة الخصوصية",
    terms: "الشروط",
    help: "المساعدة",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { id, en, ar };

const STORAGE_KEY = "schoolbus-language";

/** Read the saved preference, then fall back to the device language. */
export function detectLanguage(): Lang {
  if (typeof window === "undefined") return "id";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "id" || saved === "en" || saved === "ar") return saved;
  } catch {
    // Storage can be unavailable (private mode / blocked cookies); detect instead.
  }

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const locale of locales) {
    const base = locale.toLowerCase().split("-")[0];
    if (base === "ar" || base === "en" || base === "id") return base;
  }
  return "id";
}

export function saveLanguage(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be unavailable in private mode; the UI still works for this visit.
  }
}
