export type Language = "id" | "en" | "ar";
// Ganti angka contoh ini dengan metrik terverifikasi sebelum peluncuran.
export const trustMetrics = { schools: "25+", trips: "10.000+" };
export const dictionaries = {
  id: {
    language: "Bahasa", headline: "Perjalanan sekolah, lebih tenang.", lead: "Pantau perjalanan anak, bantu pengemudi menjalankan rute, dan kelola bus sekolah dalam satu aplikasi.",
    apple: "Unduh di App Store", google: "Dapatkan di Google Play", unavailable: "Unduh aplikasi belum tersedia", access: "Daftar atau masuk dulu untuk mengakses", trust: "Data contoh", schools: "sekolah", trips: "perjalanan",
    features: ["Perjalanan lebih aman", "Lokasi bus langsung", "Notifikasi instan"], rolesTitle: "Satu aplikasi, untuk semua",
    roles: ["Orang Tua", "Pengemudi", "Pengelola"], descriptions: ["Pantau perjalanan anak secara langsung, kapan saja.", "Dapatkan tugas dan navigasi rute dengan mudah.", "Kelola armada, pengemudi, dan jadwal perjalanan."],
    chips: [["Lacak langsung", "Notifikasi", "Keamanan"], ["Tugas harian", "Navigasi", "Rute"], ["Armada", "Jadwal", "Pengemudi"]], enter: "Masuk sebagai", busAlt: "Bus sekolah kuning di jalan", roleAlt: ["Orang tua bersama anak", "Pengemudi bus sekolah", "Armada bus sekolah"],
    cta: "Hadirkan rasa aman dan ketenangan bagi sekolah Anda.", signIn: "Masuk", register: "Daftar", newAccount: "Belum punya akun?", registerHere: "Daftar di sini", privacy: "Kebijakan Privasi", terms: "Syarat", help: "Bantuan", pending: "Informasi ini belum tersedia.", close: "Tutup", copyright: "© 2026 School Bus Management",
    demo: "DEMO", preview: "Pratinjau Vercel", local: "Lokal", demoTitle: "Lingkungan demo", environment: "Lingkungan", version: "Versi", demoNote: "Data yang ditampilkan adalah data contoh, bukan data sungguhan.", demoOpen: "Buka informasi demo", demoGrip: "Geser untuk membuka informasi demo",
  },
  en: {
    language: "Language", headline: "School journeys. Peace of mind.", lead: "Follow your child’s journey, help drivers navigate their routes, and manage school buses in one app.",
    apple: "Download on the App Store", google: "Get it on Google Play", unavailable: "App downloads are not available yet", access: "Register or sign in to access", trust: "Sample figures", schools: "schools", trips: "journeys",
    features: ["Safer journeys", "Live bus location", "Instant notifications"], rolesTitle: "One app, for everyone",
    roles: ["Parents", "Drivers", "Managers"], descriptions: ["Follow your child’s journey live, wherever you are.", "Receive assignments and navigate your route with ease.", "Manage buses, drivers, and journey schedules."],
    chips: [["Live tracking", "Alerts", "Safety"], ["Daily tasks", "Navigation", "Routes"], ["Fleet", "Schedules", "Drivers"]], enter: "Sign in as", busAlt: "Yellow school bus on the road", roleAlt: ["Parent with a child", "School bus driver", "School bus fleet"],
    cta: "Bring safety and peace of mind to your school.", signIn: "Sign in", register: "Register", newAccount: "Don’t have an account?", registerHere: "Register here", privacy: "Privacy Policy", terms: "Terms", help: "Help", pending: "This information is not available yet.", close: "Close", copyright: "© 2026 School Bus Management",
    demo: "DEMO", preview: "Vercel Preview", local: "Local", demoTitle: "Demo environment", environment: "Environment", version: "Version", demoNote: "The information shown is sample data, not real records.", demoOpen: "Open demo information", demoGrip: "Swipe to open demo information",
  },
  // Terjemahan Arab perlu ditinjau penutur asli sebelum peluncuran.
  ar: {
    language: "اللغة", headline: "رحلات مدرسية، وراحة بال.", lead: "تابع رحلة طفلك، وساعد السائقين على اتباع مساراتهم، وأدر الحافلات المدرسية في تطبيق واحد.",
    apple: "تنزيل من App Store", google: "احصل عليه من Google Play", unavailable: "تنزيل التطبيق غير متاح حاليًا", access: "سجّل أو سجّل الدخول للوصول", trust: "أرقام توضيحية", schools: "مدرسة", trips: "رحلة",
    features: ["رحلات أكثر أمانًا", "موقع الحافلة مباشرة", "إشعارات فورية"], rolesTitle: "تطبيق واحد للجميع",
    roles: ["أولياء الأمور", "السائقون", "المشرفون"], descriptions: ["تابع رحلة طفلك مباشرة في أي وقت ومن أي مكان.", "استلم مهامك واتبع مسارك بسهولة.", "أدر الحافلات والسائقين ومواعيد الرحلات."],
    chips: [["تتبع مباشر", "إشعارات", "أمان"], ["مهام يومية", "الملاحة", "المسارات"], ["الحافلات", "المواعيد", "السائقون"]], enter: "تسجيل الدخول بصفة", busAlt: "حافلة مدرسية صفراء على الطريق", roleAlt: ["أحد الوالدين مع طفل", "سائق حافلة مدرسية", "مجموعة حافلات مدرسية"],
    cta: "امنح مدرستك الأمان وراحة البال.", signIn: "تسجيل الدخول", register: "إنشاء حساب", newAccount: "ليس لديك حساب؟", registerHere: "سجّل هنا", privacy: "سياسة الخصوصية", terms: "الشروط", help: "المساعدة", pending: "هذه المعلومات غير متاحة حاليًا.", close: "إغلاق", copyright: "© 2026 School Bus Management",
    demo: "تجريبي", preview: "معاينة Vercel", local: "محلي", demoTitle: "البيئة التجريبية", environment: "البيئة", version: "الإصدار", demoNote: "المعلومات المعروضة بيانات توضيحية وليست سجلات حقيقية.", demoOpen: "فتح معلومات النسخة التجريبية", demoGrip: "اسحب لفتح معلومات النسخة التجريبية",
  },
};
export function resolveLanguage(value: string | null): Language {
  const code = value?.toLowerCase().split(/[-_]/)[0];
  return code === "ar" || code === "en" ? code : "id";
}
