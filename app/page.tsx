"use client";

import { useMemo, useState } from "react";

type Role = "Admin Pusat" | "Pengemudi" | "Orang Tua/Wali";
type Section = "Ringkasan" | "Perjalanan" | "Rute & Titik Jemput" | "Data Siswa" | "Bus & Pengemudi" | "Laporan";

const navigation: { label: Section; icon: string }[] = [
  { label: "Ringkasan", icon: "▦" },
  { label: "Perjalanan", icon: "↗" },
  { label: "Rute & Titik Jemput", icon: "⌖" },
  { label: "Data Siswa", icon: "♧" },
  { label: "Bus & Pengemudi", icon: "▰" },
  { label: "Laporan", icon: "▤" },
];

export default function Home() {
  const [role, setRole] = useState<Role>("Admin Pusat");
  const [section, setSection] = useState<Section>("Ringkasan");
  const [notice, setNotice] = useState("Ini adalah pratinjau interaktif. Data, peta, posisi bus, dan status perjalanan masih berupa contoh.");

  const roleContent = useMemo(() => {
    if (role === "Pengemudi") return {
      greeting: "Siap untuk perjalanan hari ini?",
      description: "Periksa penugasan dan rute sebelum mulai bertugas.",
      first: "Penugasan saya", second: "Stop perjalanan", third: "Konfirmasi siswa", fourth: "Laporan masalah",
      values: ["1", "12", "0", "0"],
      notes: ["Rute pagi · Bus 08", "Urutan tersimpan", "Menunggu perjalanan", "Belum ada laporan"],
    };
    if (role === "Orang Tua/Wali") return {
      greeting: "Pantau perjalanan anak",
      description: "Lihat status perjalanan dan informasi yang tersedia untuk keluarga.",
      first: "Anak terhubung", second: "Perjalanan hari ini", third: "Status terakhir", fourth: "Riwayat tersedia",
      values: ["1", "Pagi", "Belum mulai", "—"],
      notes: ["Relasi contoh", "Dari penugasan", "Lokasi belum tersedia", "Data contoh saja"],
    };
    return {
      greeting: "Selamat datang kembali",
      description: "Pantau operasi bus sekolah dari satu tempat.",
      first: "Bus terdaftar", second: "Perjalanan hari ini", third: "Dalam perjalanan", fourth: "Perlu perhatian",
      values: ["24", "18", "12", "2"],
      notes: ["Data contoh", "Pagi dan sore", "Status simulasi", "Periksa data simulasi"],
    };
  }, [role]);

  function chooseSection(label: Section) {
    setSection(label);
    setNotice(label === "Ringkasan"
      ? "Ini adalah pratinjau interaktif. Data, peta, posisi bus, dan status perjalanan masih berupa contoh."
      : label + " belum terhubung ke database. Tampilan ini menyiapkan struktur navigasi aplikasi.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><div className="brand-name">School Bus</div><div className="brand-sub">Manajemen transportasi</div></div>
        </div>
        <div>
          <div className="workspace-label">Menu utama</div>
          <nav className="nav-list" aria-label="Menu utama">
            {navigation.map((item) => (
              <button key={item.label} className={`nav-item ${section === item.label ? "active" : ""}`} onClick={() => chooseSection(item.label)}>
                <span className="nav-icon">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <strong>Operasi yang aman</strong>
          Rute yang disetujui tidak berubah diam-diam saat perjalanan aktif.
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="eyebrow">Dammam · Pilot</div><h1 className="page-title">{section}</h1></div>
          <div className="top-actions"><span className="demo-badge">MODE PRATINJAU</span><div className="avatar">{role === "Admin Pusat" ? "AP" : role === "Pengemudi" ? "PG" : "OW"}</div></div>
        </header>

        <section className="welcome">
          <div><h2>{roleContent.greeting}</h2><p>{roleContent.description}</p></div>
          <label>
            <span className="eyebrow" style={{display:"block",marginBottom:6}}>Lihat sebagai</span>
            <select className="role-select" value={role} onChange={(event) => setRole(event.target.value as Role)} aria-label="Pilih tampilan peran">
              <option>Admin Pusat</option><option>Pengemudi</option><option>Orang Tua/Wali</option>
            </select>
          </label>
        </section>

        {section === "Perjalanan" && role === "Pengemudi" ? (
          <section className="panel">
            <div className="panel-head">
              <div><h3 className="panel-title">Navigasi pengemudi</h3><div className="panel-subtitle">Menu Perjalanan · Petunjuk arah ke titik berikutnya</div></div>
              <span className="status wait">Menunggu rute</span>
            </div>
            <div className="driver-directions">
              <div className="directions-icon">↗</div>
              <h3>Petunjuk arah ada di sini</h3>
              <p>Setelah admin menetapkan rute dan koordinat setiap titik jemput, pengemudi dapat membuka Google Maps untuk navigasi ke pemberhentian berikutnya.</p>
              <div className="directions-steps">
                <div><span>1</span><div><strong>Buka penugasan</strong><small>Perjalanan yang diberikan admin akan muncul di bagian ini.</small></div></div>
                <div><span>2</span><div><strong>Pilih titik berikutnya</strong><small>Urutan berhenti mengikuti rute yang sudah disetujui.</small></div></div>
                <div><span>3</span><div><strong>Mulai navigasi</strong><small>Tombol Google Maps aktif setelah tujuan dan koordinat tersedia.</small></div></div>
              </div>
              <div className="directions-note">Navigasi belum aktif karena aplikasi masih memakai data contoh. Kami tidak menampilkan arah palsu atau tujuan yang belum dikonfirmasi.</div>
            </div>
          </section>
        ) : section === "Ringkasan" ? (
          <>
            <section className="stats" aria-label="Ringkasan operasional">
              {[roleContent.first, roleContent.second, roleContent.third, roleContent.fourth].map((label, index) => (
                <article className="stat-card" key={label}>
                  <div className="stat-top"><span>{label}</span><span className="stat-icon">{["▰","↗","⌖","✓"][index]}</span></div>
                  <div className="stat-value">{roleContent.values[index]}</div>
                  <div className={`stat-note ${index === 2 && role === "Admin Pusat" ? "good" : ""}`}>{roleContent.notes[index]}</div>
                </article>
              ))}
            </section>

            <section className="content-grid">
              <article className="panel">
                <div className="panel-head">
                  <div><h3 className="panel-title">Peta operasi</h3><div className="panel-subtitle">Ilustrasi area pilot · bukan peta navigasi langsung</div></div>
                  <button className="text-button" onClick={() => setNotice("Peta langsung belum dihubungkan. Tahap integrasi berikutnya akan memasang penyedia peta dan routing.")}>Detail peta ↗</button>
                </div>
                <div className="map-canvas" role="img" aria-label="Ilustrasi peta dengan jalur dan penanda bus simulasi">
                  <div className="road r1"/><div className="road r2"/><div className="road r3"/><div className="road r4"/><div className="road r5"/><div className="road r6"/>
                  <span className="map-label" style={{left:"9%",top:"29%"}}>AL FAYSALIYAH</span>
                  <span className="map-label" style={{left:"62%",top:"16%"}}>AL MAZruiyah</span>
                  <span className="map-label" style={{left:"57%",top:"81%"}}>DAMMAM</span>
                  <span className="map-caption">Rute simulasi · Pagi</span>
                  <div className="map-pin" style={{left:"22%",top:"57%"}}><span>1</span></div>
                  <div className="map-pin" style={{left:"49%",top:"38%"}}><span>2</span></div>
                  <div className="map-pin" style={{left:"74%",top:"59%"}}><span>S</span></div>
                  <div className="bus-pin" style={{left:"39%",top:"63%"}}>▰ Bus 08</div>
                </div>
                <div className="map-legend"><span><i className="legend-dot bus"/>Posisi bus simulasi</span><span><i className="legend-dot"/>Titik pemberhentian contoh</span></div>
              </article>

              <article className="panel">
                <div className="panel-head"><div><h3 className="panel-title">{role === "Pengemudi" ? "Urutan pemberhentian" : role === "Orang Tua/Wali" ? "Status perjalanan" : "Perjalanan hari ini"}</h3><div className="panel-subtitle">Contoh alur perjalanan</div></div><button className="text-button" onClick={() => chooseSection("Perjalanan")}>Lihat semua</button></div>
                <div className="route-list">
                  <div className="route-row"><div className="route-symbol">▰</div><div><div className="route-name">Bus 08 · Rute Pagi</div><div className="route-meta">12 titik · Sekolah Al Noor</div></div><span className="status live">Simulasi</span></div>
                  <div className="route-row"><div className="route-symbol">⌖</div><div><div className="route-name">Titik jemput A</div><div className="route-meta">Urutan 01 · contoh</div></div><span className="status wait">Menunggu</span></div>
                  <div className="route-row"><div className="route-symbol">⌖</div><div><div className="route-name">Titik jemput B</div><div className="route-meta">Urutan 02 · contoh</div></div><span className="status wait">Menunggu</span></div>
                  <div className="route-row"><div className="route-symbol">⚑</div><div><div className="route-name">Sekolah tujuan</div><div className="route-meta">Tujuan akhir · contoh</div></div><span className="status done">Tujuan</span></div>
                </div>
              </article>
            </section>

            <section className="quick-actions" aria-label="Aksi cepat">
              <button className="quick-action" onClick={() => {chooseSection("Perjalanan");setNotice("Daftar perjalanan masih menggunakan data contoh dan belum tersimpan ke database.")}}><span>↗</span><strong>Kelola perjalanan</strong><small>Jadwal dan status bus</small></button>
              <button className="quick-action" onClick={() => {chooseSection("Rute & Titik Jemput");setNotice("Editor rute belum terhubung. Urutan stop akan dikunci setelah rute disetujui admin.")}}><span>⌖</span><strong>Atur rute</strong><small>Rute dan titik jemput</small></button>
              <button className="quick-action" onClick={() => {chooseSection("Laporan");setNotice("Laporan akan diisi dari riwayat perjalanan setelah backend tersedia.")}}><span>▤</span><strong>Buka laporan</strong><small>Riwayat operasional</small></button>
            </section>
          </>
        ) : (
          <section className="panel">
            <div className="panel-head"><div><h3 className="panel-title">{section}</h3><div className="panel-subtitle">Ruang kerja awal untuk peran {role}</div></div><span className="status wait">Belum terhubung</span></div>
            <div className="empty-state">
              <div style={{fontSize:30,marginBottom:12}}>{navigation.find(item => item.label === section)?.icon}</div>
              <strong style={{display:"block",color:"var(--ink)",marginBottom:8}}>Fondasi tampilan sudah tersedia</strong>
              Bagian ini akan diisi dengan data nyata setelah database, login, dan aturan akses server disiapkan. Belum ada data yang disimpan atau dikirim.
            </div>
          </section>
        )}

        <div className="notice" role="status">{notice} <strong>Jangan gunakan pratinjau ini untuk keputusan operasional nyata.</strong></div>
      </main>

      <nav className="mobile-nav" aria-label="Navigasi seluler">
        {navigation.slice(0,4).map((item) => <button key={item.label} className={section === item.label ? "active" : ""} onClick={() => chooseSection(item.label)}><span>{item.icon}</span>{item.label === "Rute & Titik Jemput" ? "Rute" : item.label === "Ringkasan" ? "Beranda" : item.label}</button>)}
      </nav>
    </div>
  );
}
