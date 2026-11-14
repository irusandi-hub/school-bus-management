import test from "node:test";
import assert from "node:assert/strict";
import { defaultLocale, getDirection, isLocale, localeDisplayNames } from "../lib/i18n/config.ts";
import { translate } from "../lib/i18n/messages.ts";
import { translateNavigationLabel } from "../lib/i18n/navigation.ts";
import { translateAdminCopy } from "../lib/i18n/admin-copy.ts";

test("Indonesian remains the default locale", () => {
  assert.equal(defaultLocale, "id");
});

test("only the three supported locales are accepted", () => {
  assert.equal(isLocale("id"), true);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("ar"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(isLocale(undefined), false);
});

test("Arabic uses RTL while Indonesian and English use LTR", () => {
  assert.equal(getDirection("ar"), "rtl");
  assert.equal(getDirection("id"), "ltr");
  assert.equal(getDirection("en"), "ltr");
});

test("essential workspace labels exist in all locales", () => {
  for (const locale of ["id", "en", "ar"] as const) {
    assert.ok(translate(locale, "signOut").length > 0);
    assert.ok(translate(locale, "operator").length > 0);
    assert.ok(translate(locale, "parent").length > 0);
  }
});

test("shared navigation labels are translated without changing route identity", () => {
  assert.equal(translateNavigationLabel("Ringkasan", "en"), "Overview");
  assert.equal(translateNavigationLabel("Pengemudi", "ar"), "السائقون");
  assert.equal(translateNavigationLabel("Ringkasan", "id"), "Ringkasan");
  assert.equal(translateNavigationLabel("Unmapped custom label", "en"), "Unmapped custom label");
});

test("shared operational copy has Indonesian, English, and Arabic variants", () => {
  assert.equal(translateAdminCopy("Status layanan", "id"), "Status layanan");
  assert.equal(translateAdminCopy("Status layanan", "en"), "Service status");
  assert.equal(translateAdminCopy("Status layanan", "ar"), "حالة الخدمة");
});

test("unmapped operational copy remains unchanged instead of disappearing", () => {
  assert.equal(translateAdminCopy("Custom user-provided label", "ar"), "Custom user-provided label");
  assert.equal(translateAdminCopy(undefined, "en"), undefined);
});

test("dynamic operator confirmations preserve names across locales", () => {
  const message = "Nonaktifkan pengemudi Ahmad? Data dan riwayat penugasan tetap tersimpan.";
  assert.equal(
    translateAdminCopy(message, "en"),
    "Deactivate driver Ahmad? Driver data and assignment history will be retained.",
  );
  assert.equal(
    translateAdminCopy(message, "ar"),
    "هل تريد تعطيل السائق Ahmad؟ ستظل بيانات السائق وسجل التكليفات محفوظين.",
  );
});

test("language switcher navigation labels have localized self-names", () => {
  assert.equal(localeDisplayNames.id, "🇮🇩 Bahasa");
  assert.equal(localeDisplayNames.en, "🇬🇧 English");
  assert.equal(localeDisplayNames.ar, "🇸🇦 العربية");
});

test("specific account reactivation prompts are translated before generic prompts", () => {
  assert.equal(
    translateAdminCopy("Aktifkan kembali akun wali Amina?", "en"),
    "Reactivate guardian account Amina?",
  );
  assert.equal(
    translateAdminCopy("Aktifkan kembali pengemudi Omar?", "ar"),
    "هل تريد إعادة تفعيل السائق Omar؟",
  );
  assert.equal(translateAdminCopy("Aktifkan kembali Dammam?", "en"), "Reactivate Dammam?");
});

test("driver trip feedback is translated for all supported locales", () => {
  assert.equal(translateAdminCopy("Perjalanan dimulai.", "en"), "Trip started.");
  assert.equal(translateAdminCopy("Perjalanan dimulai.", "ar"), "بدأت الرحلة.");
  assert.equal(
    translateAdminCopy("Status Turun berhasil dicatat untuk 3 siswa. Status Tidak Ikut tetap dipertahankan.", "en"),
    "Drop-off was recorded for 3 students. Absent statuses were preserved.",
  );
  assert.equal(
    translateAdminCopy("Masih ada 2 siswa pada rute ini yang belum dicatat statusnya (naik, tidak ikut, atau turun).", "ar"),
    "لا تزال حالة 2 من الطلاب في هذا المسار غير مسجلة (صعد أو غائب أو نزل).",
  );
});

test("workspace loading and guardian map states have localized labels", () => {
  assert.equal(translateAdminCopy("Memuat data anak…", "en"), "Loading child data…");
  assert.equal(translateAdminCopy("Peta tidak dapat dimuat", "ar"), "تعذر تحميل الخريطة");
  assert.equal(translateAdminCopy("Posisi HP pengemudi", "en"), "Driver phone location");
});

test("safety checklist validation translates its embedded checklist label", () => {
  assert.equal(
    translateAdminCopy("Pemeriksaan keselamatan belum lengkap: Kabin sudah diperiksa, tidak ada penumpang yang tertinggal di dalam bus.", "en"),
    "The safety check is incomplete: The cabin has been checked and no passengers have been left behind on the bus.",
  );
});

test("guardian signup success feedback follows the selected locale", () => {
  const message = "Jika email tersebut terdaftar oleh Operator Utama dan memiliki siswa dengan layanan aktif, tautan verifikasi sudah dikirim. Periksa kotak masuk dan folder spam, lalu buka tautan untuk membuat kata sandi.";
  assert.match(translateAdminCopy(message, "en") ?? "", /verification link has been sent/i);
  assert.match(translateAdminCopy(message, "ar") ?? "", /تم إرسال رابط التحقق/);
  assert.equal(translateAdminCopy(message, "id"), message);
});

test("live camera and driver action feedback are localized", () => {
  assert.equal(translateAdminCopy("Data simulasi", "en"), "Demo data");
  assert.equal(translateAdminCopy("Perbesar", "ar"), "تكبير");
  assert.equal(translateAdminCopy("Tekan Esc atau", "en"), "Press Esc or");
  assert.equal(translateAdminCopy("untuk kembali.", "ar"), "للعودة.");
  assert.equal(
    translateAdminCopy("Status siswa tercatat pada perjalanan ini.", "en"),
    "Student status recorded for this trip.",
  );
});

test("development banner describes demo-only access accurately", () => {
  const message = "Akses demo hanya tersedia di lingkungan pengembangan. Pada layanan normal, masuk dan hak akses mengikuti akun Anda.";
  assert.match(translateAdminCopy(message, "en") ?? "", /only available in development environments/i);
  assert.match(translateAdminCopy(message, "ar") ?? "", /بيئات التطوير فقط/);
  assert.equal(translateAdminCopy(message, "id"), message);
});


test("operator student search copy is localized", () => {
  assert.equal(translateAdminCopy("Cari pada daftar ini", "en"), "Search this list");
  assert.equal(translateAdminCopy("Cari pada daftar ini", "ar"), "ابحث في هذه القائمة");
  assert.equal(translateAdminCopy("Belum ada siswa yang ditemukan. Coba nama lain.", "en"), "No students found. Try another name.");
  assert.equal(translateAdminCopy("Belum ada siswa yang ditemukan. Coba nama lain.", "ar"), "لم يتم العثور على طلاب. جرّب اسماً آخر.");
});
