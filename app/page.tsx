import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Bus Management | Transportasi Sekolah Terpantau",
  description: "Informasi perjalanan sekolah yang mudah dipahami orang tua, panduan pengemudi, dan pengelolaan transportasi sekolah dalam satu aplikasi.",
};

function BrandMark() {
  return <span className="sbm-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><rect x="4" y="5" width="24" height="19" rx="4" fill="currentColor"/><path d="M7.5 9h17v8h-17z" fill="#fff"/><path d="M7 20h18" stroke="#142044" strokeWidth="2"/><circle cx="10" cy="25" r="2.5" fill="#142044"/><circle cx="22" cy="25" r="2.5" fill="#142044"/></svg></span>;
}
function Brand() {
  return <div className="sbm-brand"><BrandMark/><span>School Bus<br/>Management</span></div>;
}
function RoleIcon({ type }: { type: "parent" | "driver" | "operator" }) {
  if (type === "parent") return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="13" cy="10" r="5" stroke="currentColor" strokeWidth="2"/><path d="M3.5 27c.7-5.3 4.1-8 9.5-8 2.2 0 4 .5 5.4 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="m23 18 1.5 1.2L26 18c1.7-1.3 4 .1 3.4 2.3-.5 1.8-3.4 4-4.9 5-1.5-1-4.4-3.2-4.9-5-.6-2.2 1.7-3.6 3.4-2.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (type === "driver") return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2"/><path d="M5 13h7l4 3 4-3h7M16 19v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 27V8.5L16 4l11 4.5V27H5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 12h3v3h-3zm9 0h3v3h-3zm-9 7h3v3h-3zm9 0h3v3h-3zM14 27v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}

const roles = [
  { type: "parent" as const, title: "Orang Tua", description: "Ketahui perkembangan perjalanan anak, dengan akses informasi yang tetap terbatas.", points: ["Status naik, turun, dan perjalanan", "Lokasi bus saat GPS terhubung", "Kamera mengikuti status perjalanan"] },
  { type: "driver" as const, title: "Pengemudi", description: "Jalankan tugas dengan rute terarah, catatan siswa, dan pemeriksaan keselamatan.", points: ["Checklist pemeriksaan keselamatan", "Pemeriksaan siswa sebelum perjalanan ditutup", "Urutan titik dan navigasi"] },
  { type: "operator" as const, title: "Operator", description: "Kelola armada dan pengemudi, susun penugasan, serta pantau perjalanan.", points: ["Data dan status armada", "Data pengemudi dan penugasan", "Ringkasan serta riwayat perjalanan"] },
];

export default function LandingPage() {
  return <main className="sbm-landing sbm-landing-v4 sbm-refined">
    <header className="sbm-header"><Brand/><a href="#peran" className="sbm-mobile-menu" aria-label="Lihat pilihan pengguna"><span/><span/><span/></a></header>
    <section className="sbm-hero">
      <div className="sbm-hero-copy">
        <p className="sbm-eyebrow"><i/> TRANSPORTASI SEKOLAH</p>
        <h1>Perjalanan anak<br/>lebih <em>terpantau</em>,<br/>hati lebih tenang.</h1>
        <p className="sbm-lead">Informasi perjalanan anak, panduan pengemudi, dan pengelolaan bus sekolah dalam satu aplikasi yang mudah digunakan.</p>
        <div className="sbm-hero-actions"><Link href="/pilih-peran" className="sbm-hero-primary">Mulai Sekarang <span>→</span></Link><a href="#peran" className="sbm-hero-secondary">Lihat Peran Pengguna <span>↓</span></a></div>
        <div className="sbm-hero-trust"><span><i/> Informasi lebih mudah dipahami</span><span><i/> Akses sesuai kewenangan</span></div>
      </div>
      <div className="sbm-hero-visual" role="img" aria-label="Foto bus sekolah dan ringkasan visual rute perjalanan">
        <div className="sbm-visual-top"><span className="sbm-live-dot"/> PERJALANAN SEKOLAH</div>
        <img className="sbm-hero-photo" src="https://images.pexels.com/photos/5406428/pexels-photo-5406428.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Bus sekolah kuning melintas di jalan perkotaan" loading="eager"/>
        <div className="sbm-photo-shade" aria-hidden="true"/>
        <div className="sbm-live-route-card">
          <div className="sbm-live-route-head"><span><i/> RUTE PERJALANAN</span><b>TERENCANA</b></div>
          <svg viewBox="0 0 280 92" fill="none" aria-hidden="true"><path d="M18 67 80 48l48 15 60-38 73 12" stroke="#dbe5eb" strokeWidth="13" strokeLinecap="round"/><path d="m18 67 62-19 48 15 60-38 73 12" stroke="#fff" strokeWidth="7" strokeLinecap="round"/><path d="m18 67 62-19 48 15 60-38 73 12" stroke="#2685bd" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5"/><circle cx="18" cy="67" r="6" fill="#fff" stroke="#2685bd" strokeWidth="3"/><circle cx="261" cy="38" r="6" fill="#fff" stroke="#2685bd" strokeWidth="3"/><rect x="139" y="30" width="25" height="15" rx="4" fill="#facc15" stroke="#fff" strokeWidth="2"/><path d="M144 34h5v4h-5zm8 0h5v4h-5z" fill="#17304e"/></svg>
          <div className="sbm-live-route-foot"><span><strong>Perjalanan sekolah</strong><small>Lokasi dan status sesuai koneksi perangkat</small></span><span className="sbm-route-arrow">↗</span></div>
        </div>
    </section>

    <section id="peran" className="sbm-feature-showcase sbm-role-showcase" aria-label="Fitur berdasarkan jenis pengguna">
      <div className="sbm-role-grid">
        <article className="sbm-role-card parent">
          <div className="sbm-role-card-top">
            <span className="sbm-role-icon"><RoleIcon type="parent"/></span>
            <span className="sbm-role-kicker">ORANG TUA / WALI</span>
          </div>
          <div className="sbm-role-media sbm-parent-media" aria-hidden="true"><div className="sbm-mini-map"><span className="map-road road-a"/><span className="map-road road-b"/><span className="map-road road-c"/><i className="map-point point-a"/><i className="map-point point-b"/><b className="map-bus">BUS</b></div><div className="sbm-media-caption"><strong>Perjalanan anak</strong><small>Ringkasan lokasi dan status</small></div></div>
          <p>Lihat perjalanan anak dengan lebih tenang.</p>
          <ul>
            <li><span className="sbm-feature-mini-icon">✓</span><span className="sbm-feature-copy">Ketahui saat anak naik atau turun bus.</span></li>
            <li><span className="sbm-feature-mini-icon">⌖</span><span className="sbm-feature-copy">Lihat posisi bus saat tersedia.</span></li>
            <li><span className="sbm-feature-mini-icon">▣</span><span className="sbm-feature-copy">Lihat kamera saat terhubung.</span></li>
            <li><span className="sbm-feature-mini-icon">♡</span><span className="sbm-feature-copy">Informasi anak hanya bisa dilihat oleh wali yang berhak.</span></li>
          </ul>
        </article>

        <article className="sbm-role-card driver">
          <div className="sbm-role-card-top">
            <span className="sbm-role-icon"><RoleIcon type="driver"/></span>
            <span className="sbm-role-kicker">PENGEMUDI</span>
          </div>
          <div className="sbm-role-media sbm-driver-media" aria-hidden="true"><img src="https://upload.wikimedia.org/wikipedia/commons/9/9f/2011_Blue_Bird_Vision_dashboard.jpg" alt="" loading="lazy"/><div className="sbm-media-glass"><span>URUTAN PERJALANAN</span><strong>Penjemputan → Sekolah</strong><small>Daftar titik tetap teratur</small></div></div>
          <p>Semua titik perjalanan tersusun jelas.</p>
          <ul>
            <li><span className="sbm-feature-mini-icon">↗</span><span className="sbm-feature-copy">Ikuti urutan titik jemput dan antar.</span></li>
            <li><span className="sbm-feature-mini-icon">◎</span><span className="sbm-feature-copy">Lihat informasi setiap anak.</span></li>
            <li><span className="sbm-feature-mini-icon">✓</span><span className="sbm-feature-copy">Catat anak yang naik, turun, atau tidak ikut bus.</span></li>
            <li><span className="sbm-feature-mini-icon">盾</span><span className="sbm-feature-copy">Periksa bus dan pastikan tak ada anak tertinggal.</span></li>
          </ul>
        </article>

        <article className="sbm-role-card operator">
          <div className="sbm-role-card-top">
            <span className="sbm-role-icon"><RoleIcon type="operator"/></span>
            <span className="sbm-role-kicker">OPERATOR</span>
          </div>
          <div className="sbm-role-media sbm-operator-media" aria-hidden="true"><img src="https://images.unsplash.com/photo-1642473358915-031ea57e3e3a?auto=format&fit=crop&w=1000&q=85" alt="" loading="lazy"/><div className="sbm-media-glass"><span>ARMADA SEKOLAH</span><strong>Data bus dan penugasan</strong><small>Ringkasan operasional</small></div></div>
          <p>Kelola bus dan pengemudi dengan lebih mudah.</p>
          <ul>
            <li><span className="sbm-feature-mini-icon">▣</span><span className="sbm-feature-copy">Lihat data dan kondisi bus.</span></li>
            <li><span className="sbm-feature-mini-icon">♙</span><span className="sbm-feature-copy">Lihat data pengemudi dan SIM.</span></li>
            <li><span className="sbm-feature-mini-icon">⇄</span><span className="sbm-feature-copy">Atur jadwal bus dan pengemudi.</span></li>
            <li><span className="sbm-feature-mini-icon">▤</span><span className="sbm-feature-copy">Pantau perjalanan yang berlangsung dan selesai.</span></li>
          </ul>
        </article>
      </div>
    </section>

    <section className="sbm-refined-assurance"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2.8 19 5.5v5.7c0 4.6-2.8 7.8-7 10-4.2-2.2-7-5.4-7-10V5.5l7-2.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m8.5 12 2.3 2.3 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span><p><strong>Keselamatan dan privasi tetap diperhatikan.</strong> Informasi anak hanya dapat dilihat oleh wali yang berhak. Lokasi bus dan kamera dapat digunakan saat perangkat serta jaringan tersedia.</p></section>
    <section className="sbm-login-section" aria-label="Masuk ke aplikasi">
      <div className="sbm-login-card">
        <div className="sbm-login-heading"><div><span className="sbm-login-kicker">SUDAH MEMILIKI AKUN?</span><strong>Masuk</strong></div></div>
        <label>Email atau username<input type="text" name="username" autoComplete="username" placeholder="Email atau username"/></label>
        <label>Kata sandi<input type="password" name="password" autoComplete="current-password" placeholder="Masukkan kata sandi"/></label>
        <Link href="/pilih-peran" className="sbm-login-submit">Masuk <span aria-hidden="true">→</span></Link>
        <p className="sbm-login-signup">Belum punya akun? <Link href="/daftar">Daftar</Link></p>
      </div>
    </section>
    <footer className="sbm-footer"><span>© 2026 School Bus Management</span><span>Transportasi sekolah · Dammam, Saudi Arabia</span></footer>
    <style>{`
      .sbm-refined{--ref-yellow:#efc32d}
      .sbm-refined .sbm-header{display:flex;align-items:center;justify-content:space-between}
      .sbm-refined .sbm-header-entry{font-size:13px;font-weight:700;color:#574719;text-decoration:none}
      .sbm-refined .sbm-header-entry span,.sbm-refined .sbm-primary-entry span{margin-left:8px;color:#9a7400}
      .sbm-refined .sbm-hero{align-items:center}
      .sbm-refined .sbm-hero-visual{background:#f8f0d5;border:0;box-shadow:none;border-radius:24px;min-height:300px}
      .sbm-refined .sbm-visual-top{color:#705c26}
      .sbm-refined .sbm-map-visual{max-height:300px}
      .sbm-route-caption{position:absolute;left:22px;right:22px;bottom:18px;display:flex;align-items:center;gap:12px;padding:12px 14px;background:#fff;border-radius:13px;box-shadow:0 5px 18px #705c2612}
      .sbm-route-caption .sbm-bus-symbol{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#fff0b5;color:#765a00;flex:none}
      .sbm-route-caption svg{width:23px;height:23px}
      .sbm-route-caption strong,.sbm-route-caption small{display:block}
      .sbm-route-caption strong{font-size:13px;color:#243444}
      .sbm-route-caption small{font-size:11px;color:#78838b;margin-top:3px}
      .sbm-login-section{display:flex;justify-content:center;margin:12px 0 52px;padding:26px 18px 0;border-top:1px solid #ece7d9}
      .sbm-login-card{width:min(100%,390px);padding:23px 24px 19px;background:#fff;border:1px solid #e9e2ce;border-radius:14px;box-shadow:0 8px 24px #2737460a}
      .sbm-login-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:18px}
      .sbm-login-heading strong{display:block;font:800 20px Manrope,sans-serif;color:#263746;margin-top:4px}
      .sbm-login-kicker{display:block;font-size:9px;font-weight:800;letter-spacing:1.1px;color:#9a780e}
      .sbm-login-heading>span{font-size:11px;color:#7a858b;padding-bottom:3px}
      .sbm-login-card label{display:block;margin:0 0 13px;font-size:11px;font-weight:700;color:#52616a}
      .sbm-login-card input{display:block;width:100%;height:43px;margin-top:6px;padding:0 12px;border:1px solid #e4e2d8;border-radius:8px;background:#fff;color:#263746;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box}
      .sbm-login-card input::placeholder{color:#a4aaad}
      .sbm-login-card input:focus{border-color:#d2aa1d;box-shadow:0 0 0 3px #efc32d24}
      .sbm-login-submit{display:flex;justify-content:center;align-items:center;width:100%;height:44px;margin-top:17px;border-radius:8px;background:#efc32d;color:#34290c;text-decoration:none;font-size:13px;font-weight:800;box-sizing:border-box;transition:filter .15s ease}
      .sbm-login-submit:hover{filter:brightness(.97)}
      .sbm-login-signup{margin:15px 0 0;text-align:center;font-size:11px;color:#7a858b}
      .sbm-login-signup a{color:#8a6900;font-weight:800;text-decoration:none}
      @media(max-width:480px){.sbm-login-section{margin-bottom:34px;padding:22px 14px 0}.sbm-login-card{padding:20px 17px 17px}.sbm-login-heading{align-items:flex-start;flex-direction:column;gap:3px}}
      .sbm-refined{--ref-yellow:#efc32d}
      .sbm-refined .sbm-header{display:flex;align-items:center;justify-content:space-between}
      .sbm-refined .sbm-hero{align-items:center}
      .sbm-refined .sbm-hero-visual{background:#f8f0d5;border:0;box-shadow:none;border-radius:24px;min-height:300px}
      .sbm-refined .sbm-visual-top{color:#705c26}
      .sbm-refined .sbm-map-visual{max-height:300px}
      .sbm-route-caption{position:absolute;left:22px;right:22px;bottom:18px;display:flex;align-items:center;gap:12px;padding:12px 14px;background:#fff;border-radius:13px;box-shadow:0 5px 18px #705c2612}
      .sbm-route-caption .sbm-bus-symbol{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#fff0b5;color:#765a00;flex:none}
      .sbm-route-caption svg{width:23px;height:23px}
      .sbm-route-caption strong,.sbm-route-caption small{display:block}
      .sbm-route-caption strong{font-size:13px;color:#243444}
      .sbm-route-caption small{font-size:11px;color:#78838b;margin-top:3px}
      .sbm-feature-showcase{width:min(calc(100% - 2 * clamp(20px,4vw,58px)),1324px);margin:42px auto 0}
      .sbm-section-heading{max-width:680px;margin-bottom:18px}
      .sbm-section-heading h2{font:800 clamp(22px,3vw,30px)/1.15 Manrope,sans-serif;letter-spacing:-.9px;margin:7px 0;color:#243444}
      .sbm-section-lead{font-size:12px;line-height:1.6;color:#71808b;margin:0}
      .sbm-parent-feature{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.88fr);gap:28px;align-items:center;padding:25px 28px;border:1px solid #eadcae;border-radius:18px;background:linear-gradient(115deg,#fff9e6,#fffef9 65%);box-shadow:0 10px 28px #9d79100d}
      .sbm-feature-label{display:flex;align-items:center;gap:8px;color:#89680b;font-size:9px;font-weight:800;letter-spacing:.8px}
      .sbm-feature-label svg{width:20px;height:20px}
      .sbm-parent-feature h3{max-width:490px;margin:13px 0 8px;font:800 clamp(22px,2.7vw,32px)/1.14 Manrope,sans-serif;letter-spacing:-1px;color:#26364a}
      .sbm-parent-feature-copy>p{max-width:460px;margin:0;color:#697785;font-size:12px;line-height:1.65}
      .sbm-feature-checks{list-style:none;margin:19px 0 0;padding:0;display:grid;gap:12px}
      .sbm-feature-checks li{display:grid;grid-template-columns:128px minmax(0,1fr);gap:8px;align-items:start;font-size:11px;line-height:1.5}
      .sbm-feature-checks strong{color:#3a4651}
      .sbm-feature-checks span{color:#73808a}
      .sbm-parent-feature-visual{min-width:0;padding:13px;border:1px solid #eee3bd;border-radius:14px;background:#fff;box-shadow:0 8px 22px #705c260c}
      .sbm-parent-visual-top{display:flex;justify-content:space-between;align-items:center;gap:8px;color:#3b4a58;font-size:8px;font-weight:800;letter-spacing:.6px}
      .sbm-parent-visual-top span{display:flex;align-items:center;gap:6px}
      .sbm-parent-visual-top i{width:6px;height:6px;border-radius:50%;background:#d4a51d}
      .sbm-parent-visual-top>b{font-size:7px;color:#9a7b24;background:#fff6d9;border-radius:20px;padding:5px 7px}
      .sbm-parent-journey{margin:11px 0 9px;padding:14px 12px 11px;border-radius:9px;background:#f7f8f5}
      .sbm-journey-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:14px;color:#718078;font-size:7px;font-weight:800;letter-spacing:.55px}
      .sbm-journey-head b{padding:4px 6px;border-radius:5px;background:#fff0bd;color:#8c6a0d;font-size:7px}
      .sbm-journey-line{display:grid;gap:0}
      .sbm-journey-step{position:relative;display:flex;align-items:flex-start;gap:9px;min-height:43px;color:#98a29b}
      .sbm-journey-step:not(:last-child):before{position:absolute;content:"";left:9px;top:20px;bottom:-1px;width:2px;background:#dfe5dc}
      .sbm-journey-step i{position:relative;z-index:1;display:grid;place-items:center;width:19px;height:19px;flex:none;border:1px solid #d8dfd7;border-radius:50%;background:#fff;color:#8c9a8e;font-size:8px;font-style:normal;font-weight:800}
      .sbm-journey-step.complete i{border-color:#a9c8a8;background:#e8f2e5;color:#548452}
      .sbm-journey-step.current i{border:2px solid #d9b12a;background:#fff8df}
      .sbm-journey-step.current i span{width:5px;height:5px;border-radius:50%;background:#c18e12}
      .sbm-journey-step strong,.sbm-journey-step small{display:block}
      .sbm-journey-step strong{padding-top:2px;font-size:9px;color:#46564d}
      .sbm-journey-step small{margin-top:2px;font-size:8px;color:#87928a}
      .sbm-parent-status-row,.sbm-parent-camera-row{display:flex;align-items:center;gap:9px;padding:9px 2px;border-top:1px solid #f0eee6}
      .sbm-status-symbol,.sbm-camera-symbol{width:27px;height:27px;display:grid;place-items:center;flex:none;border-radius:8px;background:#fff5d7;color:#92700e;font-size:13px;font-weight:800}
      .sbm-camera-symbol{background:#edf4f8;color:#487c9e}
      .sbm-parent-status-row>span:nth-child(2),.sbm-parent-camera-row>span:nth-child(2){min-width:0;flex:1}
      .sbm-parent-status-row strong,.sbm-parent-camera-row strong{display:block;font-size:9px;color:#394957}
      .sbm-parent-status-row small,.sbm-parent-camera-row small{display:block;margin-top:2px;font-size:8px;color:#82909a}
      .sbm-parent-status-row>b{font-size:7px;color:#8b6d18;white-space:nowrap}
      .sbm-camera-state{padding:4px 6px;border-radius:5px;background:#edf4f8;color:#477b9e;font-size:7px;font-weight:800}
      .sbm-support-features{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:15px}
      .sbm-support-feature{display:grid;grid-template-columns:38px minmax(0,1fr);gap:0 12px;padding:18px;border:1px solid #dce6ee;border-radius:14px;background:#fff}
      .sbm-support-icon{grid-row:1 / span 2;width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:#eaf2f8;color:#367ca8}
      .sbm-support-icon svg{width:22px;height:22px}
      .sbm-support-feature.operator .sbm-support-icon{background:#edf1f2;color:#5c7480}
      .sbm-support-kicker{font-size:8px;font-weight:800;letter-spacing:.7px;color:#64829a}
      .sbm-support-feature.operator .sbm-support-kicker{color:#74848b}
      .sbm-support-feature h3{margin:5px 0 5px;font:800 16px/1.25 Manrope,sans-serif;color:#2c3e50}
      .sbm-support-feature p{margin:0;font-size:10px;line-height:1.6;color:#71808b}
      .sbm-support-feature ul{grid-column:2;display:flex;flex-wrap:wrap;gap:6px 13px;list-style:none;padding:0;margin:12px 0 0}
      .sbm-support-feature li{font-size:8px;color:#526575}
      .sbm-support-feature li:before{content:"✓";margin-right:5px;color:#b18a1b;font-weight:900}
      .sbm-refined-assurance{width:min(calc(100% - 2 * clamp(20px,4vw,58px)),1324px);display:flex;align-items:center;gap:10px;margin:17px auto 24px;padding:11px 14px;border:1px solid #eee5c9;border-radius:10px;background:#fffdf5}
      .sbm-refined-assurance>span{width:22px;height:22px;display:grid;place-items:center;flex:none;border-radius:50%;background:#f8e8ad;color:#795d0d;font-size:11px;font-weight:900}
      .sbm-refined-assurance p{font-size:9px;line-height:1.5;color:#786f58;margin:0}
      .sbm-refined-assurance strong{color:#54451e}
      .sbm-login-section{display:flex;justify-content:center;margin:8px 0 26px;padding:0 clamp(20px,4vw,58px)}
      .sbm-login-card{width:min(100%,760px);display:grid;grid-template-columns:minmax(110px,.65fr) minmax(170px,1fr) minmax(145px,.85fr) 105px;align-items:center;gap:10px;padding:12px 14px;border:1px solid #e8e1cd;border-radius:12px;background:#fff;box-shadow:0 4px 14px #26374608}
      .sbm-login-heading{margin:0}
      .sbm-login-heading strong{display:block;font:800 16px Manrope,sans-serif;color:#263746}
      .sbm-login-kicker{display:block;margin-bottom:3px;font-size:7px;font-weight:800;letter-spacing:.8px;color:#9a780e}
      .sbm-login-card label{display:block;min-width:0;font-size:8px;font-weight:700;color:#687680}
      .sbm-login-card input{display:block;width:100%;height:35px;margin-top:4px;padding:0 9px;border:1px solid #e5e3da;border-radius:7px;background:#fff;color:#263746;font-size:10px;font-family:inherit;outline:none;box-sizing:border-box}
      .sbm-login-card input::placeholder{color:#a4aaad}
      .sbm-login-card input:focus{border-color:#d2aa1d;box-shadow:0 0 0 2px #efc32d24}
      .sbm-login-submit{display:flex;justify-content:center;align-items:center;gap:7px;width:100%;height:35px;border-radius:7px;background:#efc32d;color:#34290c;text-decoration:none;font-size:10px;font-weight:800;box-sizing:border-box;white-space:nowrap}
      .sbm-login-submit:hover{filter:brightness(.97)}
      .sbm-login-signup{grid-column:2 / -1;margin:0;text-align:right;font-size:8px;color:#7a858b}
      .sbm-login-signup a{color:#8a6900;font-weight:800;text-decoration:none}
      .sbm-refined .sbm-footer{padding:10px clamp(20px,4vw,58px) 14px;font-size:8px}
      @media(max-width:760px){
        .sbm-refined .sbm-hero{grid-template-columns:1fr}
        .sbm-refined .sbm-hero-visual{min-height:240px}
        .sbm-feature-showcase{width:calc(100% - 32px);margin-top:30px}
        .sbm-parent-feature{grid-template-columns:1fr;gap:18px;padding:19px}
        .sbm-parent-feature h3{font-size:25px}
        .sbm-parent-feature-visual{max-width:520px;width:100%;margin:auto}
        .sbm-support-features{grid-template-columns:1fr}
        .sbm-refined-assurance{width:calc(100% - 32px)}
        .sbm-login-section{padding:0 16px}
        .sbm-login-card{max-width:480px;grid-template-columns:1fr 1fr;gap:10px;padding:13px}
        .sbm-login-heading{grid-column:1 / -1}
        .sbm-login-submit{grid-column:1 / -1}
        .sbm-login-signup{grid-column:1 / -1;text-align:center}
      }
      /* Role colors: distinct accents, unchanged layout */
      .sbm-refined .sbm-feature-label{color:#96700d}
      .sbm-refined .sbm-feature-label svg{color:#bd9016}
      .sbm-refined .sbm-support-feature.driver{background:#f3f8fa;border-color:#d8e7eb}
      .sbm-refined .sbm-support-feature.driver .sbm-support-icon{background:#dceef1;color:#287b83}
      .sbm-refined .sbm-support-feature.driver .sbm-support-kicker{color:#287b83}
      .sbm-refined .sbm-support-feature.driver li:before{color:#328b8b}
      .sbm-refined .sbm-support-feature.operator{background:#f5f6fa;border-color:#dfe3ed}
      .sbm-refined .sbm-support-feature.operator .sbm-support-icon{background:#e5e9f3;color:#586b91}
      .sbm-refined .sbm-support-feature.operator .sbm-support-kicker{color:#586b91}
      .sbm-refined .sbm-support-feature.operator li:before{color:#7184aa}
      .sbm-refined .sbm-refined-assurance{background:#eef5f2;border-color:#d5e5dc}
      .sbm-refined .sbm-refined-assurance>span{width:30px;height:30px;border-radius:9px;background:#dcece3;color:#287451}
      .sbm-refined .sbm-refined-assurance>span svg{width:19px;height:19px}
      .sbm-refined .sbm-refined-assurance p{color:#526d60}
      .sbm-refined .sbm-refined-assurance strong{color:#245c43}
      .sbm-refined .sbm-parent-feature-visual{border-color:#e9dfbf}
      .sbm-refined .sbm-parent-journey{background:#f7f5ed}
      .sbm-refined .sbm-parent-camera-row .sbm-camera-symbol{background:#eaf2f7;color:#397a9b}
      .sbm-refined .sbm-parent-camera-row .sbm-camera-state{background:#eaf2f7;color:#397a9b}
      @media(max-width:420px){
        .sbm-parent-feature{padding:16px}
        .sbm-feature-checks li{grid-template-columns:1fr;gap:1px}
        .sbm-support-feature{padding:14px;grid-template-columns:32px minmax(0,1fr);gap:0 9px}
        .sbm-support-icon{width:31px;height:31px}
        .sbm-support-feature ul{gap:6px 9px}
        .sbm-login-card{grid-template-columns:1fr}
        .sbm-login-heading,.sbm-login-submit,.sbm-login-signup{grid-column:1}
      }

      /* Compact, feature-led hierarchy and balanced role cards */
      .sbm-refined .sbm-hero-copy h1{font-size:clamp(30px,4vw,48px);line-height:1.08;letter-spacing:-1.6px;margin:10px 0 12px}
      .sbm-refined .sbm-lead{font-size:13px;line-height:1.65;max-width:470px}
      .sbm-role-showcase{margin-top:34px}
      .sbm-role-showcase .sbm-section-heading{max-width:none;margin-bottom:15px}
      .sbm-role-showcase .sbm-section-heading h2{font-size:clamp(18px,2.2vw,23px);line-height:1.2;letter-spacing:-.45px;margin:5px 0}
      .sbm-role-showcase .sbm-section-lead{font-size:11px}
      .sbm-role-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;align-items:stretch}
      .sbm-role-card{min-width:0;padding:18px 17px 16px;border:1px solid #eadfbf;border-radius:15px;background:linear-gradient(160deg,#fffaf0 0%,#fff 58%);box-shadow:0 6px 18px #27374608}
      .sbm-role-card.driver{background:linear-gradient(160deg,#f0f8f8 0%,#fff 58%);border-color:#d9e9e8}
      .sbm-role-card.operator{background:linear-gradient(160deg,#f2f4f9 0%,#fff 58%);border-color:#dfe4ef}
      .sbm-role-card-top{display:flex;align-items:center;gap:10px;margin-bottom:13px}
      .sbm-role-icon{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:12px;background:#fff0bd;color:#9b7410}
      .sbm-role-icon svg{width:23px;height:23px}
      .sbm-role-card.driver .sbm-role-icon{background:#dcefee;color:#287b83}
      .sbm-role-card.operator .sbm-role-icon{background:#e4e9f4;color:#586b91}
      .sbm-role-kicker{font-size:9px;font-weight:800;letter-spacing:.75px;color:#96700d}
      .sbm-role-card.driver .sbm-role-kicker{color:#287b83}
      .sbm-role-card.operator .sbm-role-kicker{color:#586b91}
      .sbm-role-card h3{font:750 17px/1.25 Manrope,sans-serif;letter-spacing:-.35px;color:#2b3c4c;margin:0 0 6px}
      .sbm-role-card>p{min-height:36px;font-size:10px;line-height:1.55;color:#71808b;margin:0 0 14px}
      .sbm-role-card ul{list-style:none;display:grid;gap:11px;margin:0;padding:13px 0 0;border-top:1px solid #eee8d9}
      .sbm-role-card.driver ul{border-color:#e2eeee}
      .sbm-role-card.operator ul{border-color:#e7eaf1}
      .sbm-role-card li{display:grid;grid-template-columns:25px minmax(0,1fr);align-items:start;gap:8px;min-width:0}
      .sbm-feature-mini-icon{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:#fff1c9;color:#9a7410;font-size:12px;font-weight:800;line-height:1}
      .sbm-role-card.driver .sbm-feature-mini-icon{background:#e2f1ef;color:#287b83}
      .sbm-role-card.operator .sbm-feature-mini-icon{background:#e9edf6;color:#586b91}
      .sbm-role-card li strong,.sbm-role-card li small{display:block}
      .sbm-role-card li strong{font-size:10px;line-height:1.35;color:#3c4b58;font-weight:750}
      .sbm-role-card li small{margin-top:2px;font-size:9px;line-height:1.45;color:#7c8991}
      .sbm-refined .sbm-parent-feature,.sbm-refined .sbm-support-features{display:none}
      .sbm-refined-assurance{margin-top:15px}
      @media(max-width:820px){.sbm-role-grid{grid-template-columns:1fr 1fr}.sbm-role-card.parent{grid-column:1 / -1}.sbm-role-card.parent ul{grid-template-columns:1fr 1fr;column-gap:16px}.sbm-role-card>p{min-height:0}}
      @media(max-width:560px){.sbm-role-grid{grid-template-columns:1fr;gap:10px}.sbm-role-card.parent{grid-column:auto}.sbm-role-card.parent ul{grid-template-columns:1fr}.sbm-role-card{padding:16px}.sbm-role-showcase{margin-top:26px}.sbm-refined .sbm-hero-copy h1{font-size:clamp(29px,8vw,38px)}}
      /* Keep feature text readable: inherited legacy rules must not squeeze text spans into icon-sized boxes. */
      .sbm-role-card li{grid-template-columns:28px minmax(0,1fr);gap:9px;align-items:start}
      .sbm-role-card li>.sbm-feature-mini-icon{display:grid;width:26px;height:26px;min-width:26px;min-height:26px;box-sizing:border-box;place-items:center;flex:none;font-size:13px;line-height:1}
      .sbm-role-card li>span:not(.sbm-feature-mini-icon){display:block;width:auto;height:auto;min-width:0;min-height:0;max-width:100%;padding:0;margin:0;background:transparent;color:inherit;overflow-wrap:anywhere;word-break:normal}
      .sbm-role-card li strong{font-size:11px;line-height:1.4;overflow-wrap:anywhere}
      .sbm-role-card li small{font-size:10px;line-height:1.5;overflow-wrap:anywhere}
      .sbm-role-card>p{font-size:11px;line-height:1.55;min-height:0}
      .sbm-role-card h3{font-size:clamp(15px,1.3vw,17px);line-height:1.3;overflow-wrap:anywhere}
      @media(max-width:820px){.sbm-role-card li{grid-template-columns:26px minmax(0,1fr)}}
      @media(max-width:560px){.sbm-role-card li strong{font-size:11px}.sbm-role-card li small{font-size:10px}}
      /* Feature descriptions are single, readable lines; icons carry the visual cue. */
      .sbm-role-card li{grid-template-columns:26px minmax(0,1fr);gap:10px;align-items:center}
      .sbm-role-card li>.sbm-feature-mini-icon{width:25px;height:25px;min-width:25px;min-height:25px}
      .sbm-role-card .sbm-feature-copy{display:block;min-width:0;font-size:11px;line-height:1.55;color:#52616a;overflow-wrap:anywhere}
      .sbm-role-card>p{min-height:0;margin-bottom:13px;font-size:11px;line-height:1.55;color:#667681}
      .sbm-role-card h3{display:none}


      /* Premium, quiet visual direction: white surfaces, slate typography, yellow accents. */
      .sbm-refined{background:#fff;color:#0f172a}
      .sbm-refined .sbm-hero-visual{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 10px 28px #0f172a0a}
      .sbm-role-card,.sbm-role-card.driver,.sbm-role-card.operator{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 5px 18px #0f172a08}
      .sbm-role-card-top{margin-bottom:12px}
      .sbm-role-icon,.sbm-role-card.driver .sbm-role-icon,.sbm-role-card.operator .sbm-role-icon{background:#fef3c7;color:#854d0e;border-radius:10px}
      .sbm-role-kicker,.sbm-role-card.driver .sbm-role-kicker,.sbm-role-card.operator .sbm-role-kicker{color:#475569}
      .sbm-role-card>p{color:#334155;font-weight:650;font-size:12px;line-height:1.5;margin-bottom:12px}
      .sbm-role-card ul,.sbm-role-card.driver ul,.sbm-role-card.operator ul{border-color:#e2e8f0;gap:10px}
      .sbm-role-card li{grid-template-columns:24px minmax(0,1fr);gap:9px;align-items:center}
      .sbm-role-card li>.sbm-feature-mini-icon,.sbm-role-card.driver .sbm-feature-mini-icon,.sbm-role-card.operator .sbm-feature-mini-icon{width:23px;height:23px;min-width:23px;min-height:23px;background:#fef3c7;color:#854d0e;border-radius:7px}
      .sbm-role-card .sbm-feature-copy{font-size:11px;line-height:1.5;color:#475569}
      .sbm-role-showcase .sbm-section-heading h2{color:#0f172a}
      .sbm-role-showcase .sbm-section-lead{color:#64748b}
      .sbm-refined-assurance{border-radius:12px}
      @media(max-width:560px){.sbm-role-card{padding:15px}.sbm-role-card>p{font-size:12px}}
    `}</style>
  </main>;
}
