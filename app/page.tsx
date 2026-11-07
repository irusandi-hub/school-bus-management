import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Bus Management | Perjalanan Aman, Teratur dan Transparan",
  description: "Platform pengelolaan transportasi sekolah untuk Admin Pusat, operator, pengemudi, dan orang tua/wali.",
};

function BusMark() {
  return <span className="sbm-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M6 7.5A3.5 3.5 0 0 1 9.5 4h13A3.5 3.5 0 0 1 26 7.5V23H6V7.5Z" fill="currentColor"/><path d="M8.5 8h15v8h-15z" fill="#fff"/><path d="M6 18h20v5H6z" fill="currentColor"/><circle cx="10" cy="24" r="2.5" fill="#142044"/><circle cx="22" cy="24" r="2.5" fill="#142044"/><path d="M11 19h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg></span>;
}

function HeroIllustration() {
  return (
    <div className="sbm-hero-art" aria-label="Ilustrasi bus sekolah dan pemantauan rute">
      <div className="sbm-sky-glow" />
      <div className="sbm-art-building sbm-building-one" />
      <div className="sbm-art-building sbm-building-two" />
      <div className="sbm-art-tree sbm-tree-one" />
      <div className="sbm-art-tree sbm-tree-two" />
      <div className="sbm-art-road"><span /></div>
      <div className="sbm-phone">
        <div className="sbm-phone-notch" />
        <div className="sbm-phone-top">Perjalanan hari ini</div>
        <div className="sbm-mini-map">
          <i className="sbm-route-line" />
          <i className="sbm-map-pin pin-a">●</i>
          <i className="sbm-map-pin pin-b">●</i>
          <i className="sbm-map-pin pin-c">●</i>
        </div>
        <div className="sbm-phone-status"><span /> Bus SB-001 <b>Berjalan</b></div>
        <div className="sbm-phone-step">● Penjemputan</div>
        <div className="sbm-phone-step">● Menuju sekolah</div>
      </div>
      <div className="sbm-school-bus">
        <div className="sbm-bus-sign">SCHOOL BUS</div>
        <div className="sbm-bus-windows"><i /><i /><i /><i /></div>
        <div className="sbm-bus-front"><span /><span /><b /></div>
        <div className="sbm-bus-wheel wheel-left" /><div className="sbm-bus-wheel wheel-right" />
        <div className="sbm-bus-lights"><i /><i /></div>
      </div>
      <div className="sbm-live-label"><span /> Pantau perjalanan<br/>secara real-time*</div>
      <span className="sbm-art-note">*Jika perangkat dan layanan tersedia</span>
    </div>
  );
}

function FeatureCheck({ children }: { children: React.ReactNode }) {
  return <li className="sbm-check"><span aria-hidden="true">✓</span>{children}</li>;
}

export default function LandingPage() {
  return (
    <main className="sbm-landing">
      <header className="sbm-header">
        <Link href="/" className="sbm-brand"><BusMark/><span>School Bus<br/>Management</span></Link>
        <nav className="sbm-nav" aria-label="Navigasi utama"><a href="#beranda" className="active">⌂ <span>Beranda</span></a><Link href="/pilih-peran" className="sbm-login">↪ <span>Masuk</span></Link></nav>
      </header>

      <section className="sbm-hero" id="beranda">
        <div className="sbm-hero-copy">
          <p className="sbm-eyebrow"><i /> SOLUSI TRANSPORTASI SEKOLAH MODERN</p>
          <h1>Perjalanan Aman,<br/>Teratur dan Transparan<br/><em>untuk Setiap Anak</em></h1>
          <p className="sbm-lead">School Bus Management membantu sekolah dan operator bus mengelola transportasi siswa dengan lebih mudah, aman, dan efisien.</p>
          <Link href="/pilih-peran" className="sbm-primary">↪ <span>Masuk ke Aplikasi</span> <b>→</b></Link>
        </div>
        <HeroIllustration/>
      </section>

      <section className="sbm-role-grid" aria-label="Manfaat utama">
        <article className="sbm-role-card operator">
          <div className="sbm-role-content">
            <span className="sbm-tag">Untuk Operator</span>
            <h2>Kelola Operasional<br/>Lebih Mudah</h2>
            <ul><FeatureCheck>Pusat operasi real-time</FeatureCheck><FeatureCheck>Kelola rute dan penugasan</FeatureCheck><FeatureCheck>Pantau armada dan pengemudi</FeatureCheck><FeatureCheck>Laporan perjalanan &amp; ekspor data</FeatureCheck></ul>
            <Link href="/pilih-peran" className="sbm-secondary">Lihat lebih detail <b>→</b></Link>
          </div>
          <div className="sbm-ops-preview">
            <strong>Pusat Operasi</strong><div className="sbm-preview-stats"><span>Berlangsung<b>12</b></span><span>Menunggu<b>5</b></span><span>Selesai<b>8</b></span></div>
            <div className="sbm-preview-map"><i/><i/><i/><b>⌖</b></div>
            <small>Perjalanan aktif</small><div className="sbm-preview-row">SB-001 <span>Rute A</span><b>Berlangsung</b></div><div className="sbm-preview-row">SB-002 <span>Rute B</span><b>Menunggu</b></div>
          </div>
        </article>

        <article className="sbm-role-card parent">
          <div className="sbm-role-content">
            <span className="sbm-tag">Untuk Orang Tua/Wali</span>
            <h2>Selalu Dekat<br/>dengan Anak</h2>
            <ul><FeatureCheck>Lihat status perjalanan anak</FeatureCheck><FeatureCheck>Pantau posisi bus (jika tersedia)</FeatureCheck><FeatureCheck>Akses video langsung (jika tersedia)</FeatureCheck><FeatureCheck>Riwayat perjalanan &amp; kehadiran</FeatureCheck></ul>
            <Link href="/pilih-peran" className="sbm-secondary yellow">Lihat lebih detail <b>→</b></Link>
          </div>
          <div className="sbm-parent-phone"><div className="sbm-parent-notch"/><strong>Anak Saya</strong><div className="sbm-child-line"><i/> <span>Ahmad Fauzi<small>Kelas 3A</small></span></div><label>● Dalam Perjalanan</label><div className="sbm-parent-video">▶<small>Live Video · Jika tersedia</small></div></div>
        </article>
      </section>

      <section className="sbm-feature-grid">
        <article className="sbm-feature-card driver">
          <div className="sbm-feature-icon">⌖</div><span className="sbm-tag">Untuk Pengemudi</span><h2>Navigasi &amp; Rute Lebih Praktis</h2>
          <p>Dapatkan panduan perjalanan, urutan penjemputan, dan penyesuaian rute otomatis.</p>
          <ul><FeatureCheck>Navigasi ke titik jemput/antar</FeatureCheck><FeatureCheck>Rute mengikuti urutan yang ditetapkan</FeatureCheck><FeatureCheck>Informasi siswa &amp; lokasi</FeatureCheck><FeatureCheck>Konfirmasi kehadiran</FeatureCheck></ul>
          <div className="sbm-route-art"><span>📍 Menuju titik jemput</span><i/><b>➤</b></div>
        </article>
        <article className="sbm-feature-card admin">
          <div className="sbm-feature-icon">▤</div><span className="sbm-tag">Untuk Admin Pusat</span><h2>Kelola Data &amp; Laporan<br/>Secara Lengkap</h2>
          <p>Pantau data sekolah, armada, pengemudi, operator, dan siswa.</p>
          <ul><FeatureCheck>Manajemen sekolah, operator, siswa</FeatureCheck><FeatureCheck>Pengelolaan armada dan pengemudi</FeatureCheck><FeatureCheck>Laporan dan histori perjalanan</FeatureCheck></ul>
        </article>
      </section>

      <section className="sbm-security">
        <div className="sbm-shield">✓</div><div className="sbm-security-copy"><span>KESELAMATAN ADALAH PRIORITAS</span><h2>Sistem Keamanan Berlapis</h2><p>Akses hanya untuk pihak yang berwenang. Data siswa dan perjalanan dilindungi sesuai sistem keamanan yang berlaku.</p></div>
        <div className="sbm-security-points"><div>♙<small>Akses berdasarkan<br/>kewenangan akun</small></div><div>▣<small>Data terlindungi<br/>dan terenkripsi</small></div><div>◇<small>Privasi pengguna<br/>selalu terjaga</small></div></div>
      </section>

      <section className="sbm-login-band">
        <div className="sbm-login-copy"><Link href="/" className="sbm-brand"><BusMark/><span>School Bus<br/>Management</span></Link><h2>Masuk ke Akun Anda</h2><p>Akses aplikasi sesuai peran Anda.</p></div>
        <div className="sbm-login-panel"><div className="sbm-login-field">✉ <span>Masuk melalui pilihan jenis pengguna</span></div><Link href="/pilih-peran" className="sbm-login-submit">↪ &nbsp; Masuk</Link><small>Silakan pilih area kerja sesuai peran Anda. Proses autentikasi disiapkan pada tahap berikutnya.</small></div>
      </section>
      <footer className="sbm-footer"><span>© 2026 School Bus Management. Semua hak dilindungi.</span><span>⌖ &nbsp; Dammam, Saudi Arabia</span></footer>
    </main>
  );
}
