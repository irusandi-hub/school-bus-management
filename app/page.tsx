"use client";

import { useMemo, useState } from "react";

type Role = "Admin Pusat" | "Pengemudi" | "Orang Tua/Wali";
type Section = string;

const menus: Record<Role, { label: string; icon: string }[]> = {
  "Admin Pusat": [
    { label: "Ringkasan", icon: "▦" },
    { label: "Sekolah & Operator", icon: "⌂" },
    { label: "Data Siswa & Wali", icon: "♧" },
    { label: "Bus & Pengemudi", icon: "▰" },
    { label: "Rute & Titik Jemput", icon: "⌖" },
    { label: "Penugasan", icon: "↗" },
    { label: "Laporan & Audit", icon: "▤" },
  ],
  "Pengemudi": [
    { label: "Tugas Saya", icon: "▦" },
    { label: "Perjalanan", icon: "↗" },
    { label: "Daftar Siswa", icon: "♧" },
    { label: "Kendala & Pemeriksaan", icon: "✓" },
  ],
  "Orang Tua/Wali": [
    { label: "Anak Saya", icon: "⌂" },
    { label: "Perjalanan", icon: "↗" },
    { label: "Riwayat & Laporan", icon: "▤" },
    { label: "Akun", icon: "○" },
  ],
};

const roleIntro: Record<Role, { greeting: string; description: string }> = {
  "Admin Pusat": {
    greeting: "Kendalikan operasi transportasi",
    description: "Kelola data, penugasan, rute, dan laporan sesuai kewenangan organisasi.",
  },
  "Pengemudi": {
    greeting: "Siap menjalankan tugas?",
    description: "Periksa penugasan dan rute yang disetujui sebelum memulai perjalanan.",
  },
  "Orang Tua/Wali": {
    greeting: "Informasi perjalanan anak",
    description: "Pantau status perjalanan dan lihat riwayat anak yang terhubung ke akun Anda.",
  },
};

function Status({ children, kind = "wait" }: { children: React.ReactNode; kind?: "wait" | "live" | "done" }) {
  return <span className={`status ${kind}`}>{children}</span>;
}

function Metric({ label, value, note, icon }: { label: string; value: string; note: string; icon: string }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return <section className="panel"><div className="panel-head"><div><h3 className="panel-title">{title}</h3><div className="panel-subtitle">Ruang kerja siap dihubungkan</div></div><Status>Belum terhubung</Status></div><div className="empty-state"><div className="empty-illustration">⌁</div><strong className="empty-title">Belum ada data operasional</strong><p>{detail}</p><span className="muted-hint">Data akan muncul setelah akun, hak akses, dan sumber data disiapkan.</span></div></section>;
}

export default function Home() {
  const [role, setRole] = useState<Role>("Admin Pusat");
  const [section, setSection] = useState<Section>("Ringkasan");
  const [notice, setNotice] = useState("Pratinjau interface. Data, lokasi, dan status perjalanan belum berasal dari operasi nyata.");

  const navigation = menus[role];
  const intro = roleIntro[role];

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setSection(menus[nextRole][0].label);
    setNotice("Mode pratinjau peran berubah. Pemilih ini hanya untuk meninjau tampilan, bukan menentukan hak akses akun.");
  }

  function selectSection(label: string) {
    setSection(label);
    setNotice(label + " masih berupa rancangan interface dan belum terhubung ke data operasional.");
  }

  const avatar = role === "Admin Pusat" ? "AP" : role === "Pengemudi" ? "PG" : "OW";

  return (
    <div className={`app-shell role-${role === "Admin Pusat" ? "admin" : role === "Pengemudi" ? "driver" : "parent"}`}>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="School Bus beranda">
          <div className="brand-mark">S</div>
          <div><div className="brand-name">School Bus</div><div className="brand-sub">Manajemen transportasi</div></div>
        </a>
        <div className="nav-group">
          <div className="workspace-label">Ruang kerja</div>
          <nav className="nav-list" aria-label={`Menu ${role}`}>
            {navigation.map((item) => <button key={item.label} className={`nav-item ${section === item.label ? "active" : ""}`} onClick={() => selectSection(item.label)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{section === item.label && <span className="nav-active-dot" />}</button>)}
          </nav>
        </div>
        <div className="sidebar-bottom"><span className="security-icon">✓</span><strong>Akses sesuai peran</strong><p>Data operasional harus dibatasi oleh izin akun, organisasi, dan penugasan.</p></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title"><div className="eyebrow">DAMMAM · PILOT</div><h1 className="page-title">{section}</h1></div>
          <div className="top-actions"><span className="demo-badge"><span className="demo-dot" /> PRATINJAU</span><a className="login-link" href="/login">Masuk</a><div className="avatar" aria-label={role}>{avatar}</div></div>
        </header>

        <section className="welcome">
          <div className="welcome-copy"><div className="welcome-kicker">RUANG KERJA {role.toUpperCase()}</div><h2>{section === navigation[0].label ? intro.greeting : section}</h2><p>{section === navigation[0].label ? intro.description : `Menu ${section} untuk peran ${role}.`}</p></div>
          <label className="role-preview"><span className="eyebrow">Pratinjau sebagai</span><select className="role-select" value={role} onChange={(event) => changeRole(event.target.value as Role)} aria-label="Pilih interface untuk pratinjau"><option>Admin Pusat</option><option>Pengemudi</option><option>Orang Tua/Wali</option></select></label>
        </section>

        {role === "Admin Pusat" && section === "Ringkasan" && <>
          <section className="stats" aria-label="Ringkasan admin">
            <Metric label="Sekolah & operator" value="—" note="Menunggu data terdaftar" icon="⌂" />
            <Metric label="Bus terdaftar" value="—" note="Belum ada data nyata" icon="▰" />
            <Metric label="Perjalanan hari ini" value="—" note="Pagi dan sore" icon="↗" />
            <Metric label="Perlu ditinjau" value="—" note="Tidak ada angka simulasi" icon="!" />
          </section>
          <section className="content-grid admin-grid">
            <article className="panel"><div className="panel-head"><div><h3 className="panel-title">Ikhtisar operasional</h3><div className="panel-subtitle">Ringkasan akan mengikuti data yang dapat diakses admin</div></div><Status>Menunggu data</Status></div><div className="admin-overview"><div className="overview-icon">▦</div><h3>Operasi akan tampil di sini</h3><p>Setelah sekolah/operator, armada, rute, dan penugasan tersedia, halaman ini merangkum keadaan operasional tanpa mencampur data antarorganisasi.</p></div></article>
            <article className="panel"><div className="panel-head"><div><h3 className="panel-title">Tindakan administrasi</h3><div className="panel-subtitle">Pintasan pengelolaan</div></div></div><div className="quick-list">
              {["Sekolah & Operator", "Data Siswa & Wali", "Bus & Pengemudi", "Rute & Titik Jemput"].map((label, i) => <button className="quick-row" key={label} onClick={() => selectSection(label)}><span className="quick-icon">{["⌂","♧","▰","⌖"][i]}</span><span><strong>{label}</strong><small>Kelola data dan periksa kelengkapan</small></span><span className="quick-arrow">›</span></button>)}
            </div></article>
          </section>
          <div className="notice"><strong>Belum terhubung ke data operasional.</strong> Angka dan status nyata baru ditampilkan setelah sumber data dan kebijakan akses siap.</div>
        </>}

        {role === "Admin Pusat" && section !== "Ringkasan" && <EmptyPanel title={section} detail={section === "Rute & Titik Jemput" ? "Rute harus dapat ditinjau dan disetujui sebelum ditugaskan. Urutan stop pada perjalanan aktif tidak boleh berubah diam-diam." : section === "Laporan & Audit" ? "Laporan dan koreksi harus dapat ditelusuri ke catatan sumber serta dibatasi berdasarkan peran dan organisasi." : "Bagian ini akan menyediakan pengelolaan data sesuai kewenangan admin dan lingkup organisasi yang ditetapkan."} />}

        {role === "Pengemudi" && section === "Tugas Saya" && <>
          <section className="driver-hero"><div className="driver-hero-top"><div><span className="eyebrow light">TUGAS HARI INI</span><h2>Belum ada penugasan</h2><p>Penugasan bus dan rute akan tampil setelah diberikan oleh admin.</p></div><div className="driver-big-icon">↗</div></div><div className="driver-hero-bottom"><div><span>Bus</span><strong>Belum ditetapkan</strong></div><div><span>Jadwal</span><strong>Belum tersedia</strong></div><Status>Menunggu penugasan</Status></div></section>
          <section className="driver-action-grid"><button className="driver-action" onClick={() => selectSection("Perjalanan")}><span className="driver-action-icon">↗</span><strong>Buka perjalanan</strong><small>Lihat rute dan stop yang disetujui</small></button><button className="driver-action" onClick={() => selectSection("Daftar Siswa")}><span className="driver-action-icon">♧</span><strong>Daftar siswa</strong><small>Periksa siswa pada penugasan</small></button><button className="driver-action" onClick={() => selectSection("Kendala & Pemeriksaan")}><span className="driver-action-icon">✓</span><strong>Kendala & pemeriksaan</strong><small>Laporkan masalah dan periksa kabin</small></button></section>
          <div className="notice"><strong>Mode pratinjau.</strong> Tombol belum memulai perjalanan atau mengirim data.</div>
        </>}

        {role === "Pengemudi" && section === "Perjalanan" && <section className="panel"><div className="panel-head"><div><h3 className="panel-title">Navigasi perjalanan</h3><div className="panel-subtitle">Petunjuk arah ke titik berikutnya</div></div><Status>Menunggu rute</Status></div><div className="driver-empty"><div className="driver-empty-icon">⌖</div><h3>Rute belum tersedia</h3><p>Rute yang disetujui admin akan muncul di sini. Tujuan dan urutan pemberhentian harus berasal dari penugasan yang valid.</p><div className="directions-steps"><div><span>1</span><div><strong>Periksa penugasan</strong><small>Pastikan bus, jadwal, dan rute sesuai tugas Anda.</small></div></div><div><span>2</span><div><strong>Ikuti urutan stop</strong><small>Urutan pemberhentian tetap sesuai rute yang disetujui.</small></div></div><div><span>3</span><div><strong>Buka petunjuk arah</strong><small>Navigasi akan aktif setelah koordinat tujuan tersedia.</small></div></div></div></div></section>}
        {role === "Pengemudi" && section === "Daftar Siswa" && <EmptyPanel title="Daftar siswa pada tugas" detail="Hanya siswa yang terkait dengan penugasan aktif akan ditampilkan. Status naik/turun dicatat per siswa dan per perjalanan." />}
        {role === "Pengemudi" && section === "Kendala & Pemeriksaan" && <section className="driver-action-panel"><div className="panel-head"><div><h3 className="panel-title">Keselamatan perjalanan</h3><div className="panel-subtitle">Alur sebelum dan sesudah bertugas</div></div><Status>Belum aktif</Status></div><div className="safety-items"><div><span>01</span><section><strong>Laporkan kendala</strong><p>Catat masalah bus, rute, GPS, atau data siswa untuk ditinjau admin.</p></section></div><div><span>02</span><section><strong>Periksa kabin</strong><p>Pemeriksaan fisik wajib sebelum menutup sesi kerja.</p></section></div><div><span>03</span><section><strong>Selesaikan perjalanan</strong><p>Penutupan mengikuti status siswa dan aturan operasional yang disetujui.</p></section></div></div></section>}

        {role === "Orang Tua/Wali" && section === "Anak Saya" && <>
          <section className="parent-welcome-card"><div className="parent-icon">♡</div><div><span className="eyebrow">KELUARGA</span><h2>Belum ada anak terhubung</h2><p>Anak akan muncul setelah hubungan wali diverifikasi dan disetujui.</p></div><Status>Belum terhubung</Status></section>
          <section className="parent-status-grid"><article className="parent-status-card"><span className="parent-card-icon">↗</span><span className="eyebrow">PERJALANAN PAGI</span><strong>Belum tersedia</strong><p>Status akan ditampilkan setelah penugasan tersedia.</p></article><article className="parent-status-card"><span className="parent-card-icon">⌖</span><span className="eyebrow">LOKASI BUS</span><strong>Belum tersedia</strong><p>Tidak ada lokasi yang ditampilkan tanpa data terbaru.</p></article></section>
          <div className="notice"><strong>Privasi keluarga.</strong> Wali hanya boleh melihat anak yang memiliki relasi aktif dan disetujui. Posisi bus nantinya selalu disertai waktu pembaruan.</div>
        </>}
        {role === "Orang Tua/Wali" && section === "Perjalanan" && <section className="panel"><div className="panel-head"><div><h3 className="panel-title">Status perjalanan anak</h3><div className="panel-subtitle">Pagi dan sore ditampilkan secara terpisah</div></div><Status>Belum tersedia</Status></div><div className="parent-timeline"><div className="timeline-line"/>{[{n:"01",title:"Menunggu perjalanan",desc:"Jadwal akan tampil setelah anak terhubung ke penugasan."},{n:"02",title:"Status naik/turun",desc:"Hanya konfirmasi yang tercatat yang akan ditampilkan."},{n:"03",title:"Lokasi bus terakhir",desc:"Lokasi akan menyertakan waktu pembaruan dan status kesegaran."}].map(x=><div className="timeline-item" key={x.n}><span>{x.n}</span><div><strong>{x.title}</strong><p>{x.desc}</p></div></div>)}</div></section>}
        {role === "Orang Tua/Wali" && section === "Riwayat & Laporan" && <EmptyPanel title="Riwayat perjalanan anak" detail="Riwayat akan memisahkan perjalanan pagi dan sore, membedakan status terkonfirmasi dari status yang belum diketahui, dan hanya menampilkan data anak yang berhak diakses." />}
        {role === "Orang Tua/Wali" && section === "Akun" && <EmptyPanel title="Profil dan akses akun" detail="Informasi akun dan pengelolaan sesi akan ditampilkan di sini. Peran dan hubungan wali tidak dapat diubah sendiri dari halaman profil." />}

        <footer className="page-footer"><span>School Bus Management</span><span>Interface pratinjau · bukan sistem operasional</span></footer>
      </main>

      <nav className="mobile-nav" aria-label="Navigasi seluler">
        {navigation.slice(0, 4).map((item) => <button key={item.label} className={section === item.label ? "active" : ""} onClick={() => selectSection(item.label)}><span>{item.icon}</span>{item.label}</button>)}
      </nav>
    </div>
  );
}
