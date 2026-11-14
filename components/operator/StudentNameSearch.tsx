"use client";

import { useState, type ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function StudentNameSearch({ names, children }: { names: string[]; children: ReactNode[] }) {
  const { locale } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase("id-ID");
  const matches = names.map((name) => name.toLocaleLowerCase("id-ID").includes(needle));
  return <>
    <label className="student-name-search">{c("Nama siswa")}<input type="search" value={query} maxLength={120} placeholder={c("Cari pada daftar ini")} onChange={(event) => setQuery(event.target.value)} /></label>
    {!matches.some(Boolean) && <p role="status">{c("Belum ada siswa yang ditemukan. Coba nama lain.")}</p>}
    <section className="student-read-grid" aria-label={c("Daftar siswa")}>{children.map((child, index) => matches[index] ? child : null)}</section>
  </>;
}
