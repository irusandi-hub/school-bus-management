import type { IconName } from "./Icon";

export type NavItem = { href: string; label: string; icon: IconName; short?: string };
export type NavGroup = { label: string; items: NavItem[] };

export const adminGroups: NavGroup[] = [
  {
    label: "Data induk",
    items: [
      { href: "/admin", label: "Ringkasan", icon: "dashboard", short: "Ringkasan" },
      { href: "/admin/sekolah", label: "Sekolah", icon: "school", short: "Sekolah" },
      { href: "/admin/operator", label: "Operator", icon: "operator", short: "Operator" },
      { href: "/admin/siswa", label: "Data siswa", icon: "students", short: "Siswa" },
      { href: "/admin/wali", label: "Akun wali", icon: "guardian", short: "Wali" },
      { href: "/admin/bus", label: "Bus", icon: "bus", short: "Bus" },
      { href: "/admin/pengemudi", label: "Pengemudi", icon: "driver", short: "Driver" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/rute", label: "Rute & titik jemput", icon: "route", short: "Rute" },
      { href: "/admin/penugasan", label: "Penugasan", icon: "assignment", short: "Tugas" },
      { href: "/admin/perjalanan", label: "Perjalanan", icon: "trip", short: "Jalan" },
      { href: "/admin/laporan", label: "Laporan & audit", icon: "report", short: "Laporan" },
    ],
  },
];

export const operatorGroups: NavGroup[] = [
  {
    label: "Operasional harian",
    items: [
      { href: "/operator", label: "Ringkasan", icon: "dashboard", short: "Ringkasan" },
      { href: "/operator/operasional", label: "Pusat operasi", icon: "dashboard", short: "Operasi" },
      { href: "/operator/perjalanan", label: "Perjalanan", icon: "trip", short: "Jalan" },
      { href: "/operator/penugasan", label: "Penugasan", icon: "assignment", short: "Tugas" },
      { href: "/operator/laporan", label: "Laporan", icon: "report", short: "Laporan" },
    ],
  },
  {
    label: "Armada & data",
    items: [
      { href: "/operator/bus", label: "Armada bus", icon: "bus", short: "Bus" },
      { href: "/operator/pengemudi", label: "Pengemudi", icon: "driver", short: "Driver" },
      { href: "/operator/rute", label: "Rute & titik jemput", icon: "route", short: "Rute" },
      { href: "/operator/siswa", label: "Siswa", icon: "students", short: "Siswa" },
      { href: "/operator/sekolah", label: "Sekolah", icon: "school", short: "Sekolah" },
      { href: "/operator/wali", label: "Orang Tua", icon: "guardian", short: "Wali" },
    ],
  },
];

/** Empat menu utama di navigasi bawah agar setiap area tetap terjangkau satu ketukan. */
export const adminBottomNav: NavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: "dashboard" },
  { href: "/admin/siswa", label: "Siswa", icon: "students" },
  { href: "/admin/penugasan", label: "Tugas", icon: "assignment" },
  { href: "/admin/perjalanan", label: "Perjalanan", icon: "trip" },
];

export const operatorBottomNav: NavItem[] = [
  { href: "/operator/operasional", label: "Operasi", icon: "dashboard" },
  { href: "/operator/penugasan", label: "Tugas", icon: "assignment" },
  { href: "/operator/perjalanan", label: "Perjalanan", icon: "trip" },
  { href: "/operator/bus", label: "Bus", icon: "bus" },
];

export const driverBottomNav: NavItem[] = [
  { href: "/pengemudi", label: "Tugas", icon: "dashboard" },
  { href: "/pengemudi/riwayat", label: "Riwayat", icon: "trip" },
];

export const guardianBottomNav: NavItem[] = [
  { href: "/wali", label: "Anak saya", icon: "students" },
  { href: "/wali/riwayat", label: "Riwayat", icon: "trip" },
];

export function isNavItemActive(pathname: string, href: string, rootHref: string) {
  if (href === rootHref) return pathname === rootHref;
  return pathname === href || pathname.startsWith(`${href}/`);
}
