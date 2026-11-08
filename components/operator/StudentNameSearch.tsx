"use client";

import { useState, type ReactNode } from "react";

export function StudentNameSearch({ names, children }: { names: string[]; children: ReactNode[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase("id-ID");
  const matches = names.map((name) => name.toLocaleLowerCase("id-ID").includes(needle));
  return <>
    <label className="student-name-search">Nama siswa<input type="search" value={query} maxLength={120} placeholder="Cari pada daftar ini" onChange={(event) => setQuery(event.target.value)} /></label>
    {!matches.some(Boolean) && <p role="status">Belum ada siswa yang ditemukan. Coba nama lain.</p>}
    <section className="student-read-grid" aria-label="Daftar siswa">{children.map((child, index) => matches[index] ? child : null)}</section>
  </>;
}
