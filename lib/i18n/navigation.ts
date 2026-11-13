import type { Locale } from "./config";

const labels: Record<string, Record<Locale, string>> = {
  "Data induk": { id: "Data induk", en: "Core data", ar: "البيانات الأساسية" },
  "Operasional": { id: "Operasional", en: "Operations", ar: "العمليات" },
  "Operasional harian": { id: "Operasional harian", en: "Daily operations", ar: "العمليات اليومية" },
  "Armada & data": { id: "Armada & data", en: "Fleet & data", ar: "الأسطول والبيانات" },
  "Ringkasan": { id: "Ringkasan", en: "Overview", ar: "نظرة عامة" },
  "Sekolah": { id: "Sekolah", en: "Schools", ar: "المدارس" },
  "Area Operasional": { id: "Area Operasional", en: "Operational areas", ar: "مناطق التشغيل" },
  "Data siswa": { id: "Data siswa", en: "Student records", ar: "بيانات الطلاب" },
  "Akun wali": { id: "Akun wali", en: "Guardian accounts", ar: "حسابات أولياء الأمور" },
  "Bus": { id: "Bus", en: "Buses", ar: "الحافلات" },
  "Pengemudi": { id: "Pengemudi", en: "Drivers", ar: "السائقون" },
  "Rute & titik jemput": { id: "Rute & titik jemput", en: "Routes & pickup stops", ar: "المسارات ونقاط الصعود" },
  "Penugasan": { id: "Penugasan", en: "Assignments", ar: "التكليفات" },
  "Perjalanan": { id: "Perjalanan", en: "Trips", ar: "الرحلات" },
  "Laporan & audit": { id: "Laporan & audit", en: "Reports & audit", ar: "التقارير والتدقيق" },
  "Pusat operasi": { id: "Pusat operasi", en: "Operations center", ar: "مركز العمليات" },
  "Laporan": { id: "Laporan", en: "Reports", ar: "التقارير" },
  "Armada bus": { id: "Armada bus", en: "Bus fleet", ar: "أسطول الحافلات" },
  "Siswa": { id: "Siswa", en: "Students", ar: "الطلاب" },
  "Orang Tua": { id: "Orang Tua", en: "Parents", ar: "أولياء الأمور" },
  "Operasi": { id: "Operasi", en: "Operations", ar: "العمليات" },
  "Tugas": { id: "Tugas", en: "Tasks", ar: "المهام" },
  "Riwayat": { id: "Riwayat", en: "History", ar: "السجل" },
  "Anak saya": { id: "Anak saya", en: "My children", ar: "أبنائي" },
  "Menu": { id: "Menu", en: "Menu", ar: "القائمة" },
  "Semua menu": { id: "Semua menu", en: "All menus", ar: "كل القوائم" },
  "Tutup menu": { id: "Tutup menu", en: "Close menu", ar: "إغلاق القائمة" },
};

export function translateNavigationLabel(label: string, locale: Locale): string {
  const exact = labels[label];
  if (exact) return exact[locale];
  const normalized = Object.keys(labels).find((key) => key.toLocaleLowerCase() === label.toLocaleLowerCase());
  return normalized ? labels[normalized][locale] : label;
}
