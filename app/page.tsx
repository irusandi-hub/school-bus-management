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
  if (type === "parent") return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 13 16 5l11 8v13H5V13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 26v-8h8v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>;
  if (type === "driver") return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 24 24 7M13 7h11v11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="25" r="3" stroke="currentColor" strokeWidth="2"/></svg>;
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="3" y="5" width="26" height="22" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M8 11h16M8 16h7m4 0h5M8 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

const roles = [
  { type: "parent" as const, title: "Orang Tua", description: "Pantau kabar perjalanan, lokasi bus, dan video saat tersedia.", points: ["Status perjalanan anak", "Lokasi bus saat terhubung", "Tampilan video saat diizinkan"] },
  { type: "driver" as const, title: "Pengemudi", description: "Jalankan perjalanan dengan urutan rute dan informasi siswa yang jelas.", points: ["Panduan titik jemput dan antar", "Informasi serta kehadiran siswa", "Pembaruan status perjalanan"] },
  { type: "operator" as const, title: "Operator", description: "Atur armada, pengemudi, rute, dan penugasan perjalanan.", points: ["Data armada dan pengemudi", "Rute serta penugasan", "Pemantauan operasional"] },
];

export default function LandingPage() {
  return <main className="sbm-landing sbm-landing-v4 sbm-refined">
    <header className="sbm-header"><Brand/></header>
    <section className="sbm-hero">
      <div className="sbm-hero-copy">
        <p className="sbm-eyebrow"><i/> TRANSPORTASI SEKOLAH</p>
        <h1>Perjalanan anak<br/>lebih <em>terpantau</em>,<br/>hati lebih tenang.</h1>
        <p className="sbm-lead">Informasi perjalanan anak, panduan pengemudi, dan pengelolaan bus sekolah dalam satu aplikasi yang mudah digunakan.</p>
        <div className="sbm-hero-trust"><span><i/> Informasi lebih mudah dipahami</span><span><i/> Akses sesuai kewenangan</span></div>
      </div>
      <div className="sbm-hero-visual" role="img" aria-label="Ilustrasi bus sekolah pada rute perjalanan">
        <div className="sbm-visual-top"><span className="sbm-live-dot"/> PERJALANAN SEKOLAH</div>
        <svg className="sbm-map-visual" viewBox="0 0 660 330" fill="none" aria-hidden="true">
          <path d="M-20 75 160 25l120 64 125-42 120 56 160-45M-20 225l150-60 110 44 120-58 115 58 170-55M70-20l42 120-42 100 48 150M250-20l-35 120 45 105-20 150M470-20l-35 115 45 110-15 130M610-20l-55 130 65 90-35 150" stroke="#D7E2EC" strokeWidth="18" strokeLinecap="round"/>
          <path d="m-10 142 135-38 110 54 105-42 110 43 145-40" stroke="#fff" strokeWidth="9" strokeLinecap="round"/>
          <path d="m125 158 70-23 66 34 94-38 72 32 100-28" stroke="#2B83C6" strokeWidth="5" strokeLinecap="round"/>
          <path d="m125 158 70-23 66 34 94-38 72 32 100-28" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 9"/>
          <circle cx="125" cy="158" r="12" fill="#fff" stroke="#2B83C6" strokeWidth="5"/><circle cx="527" cy="135" r="12" fill="#fff" stroke="#2B83C6" strokeWidth="5"/>
          <circle cx="329" cy="131" r="18" fill="#F5C32B" stroke="#fff" strokeWidth="6"/>
          <g transform="translate(302 103)" fill="#14294A"><rect x="4" y="5" width="47" height="23" rx="5"/><path d="M10 2h31l7 7H7z"/><rect x="9" y="9" width="8" height="7" rx="1" fill="#DCEBFA"/><rect x="20" y="9" width="8" height="7" rx="1" fill="#DCEBFA"/><rect x="31" y="9" width="8" height="7" rx="1" fill="#DCEBFA"/><circle cx="15" cy="29" r="5" fill="#14294A" stroke="#fff" strokeWidth="2"/><circle cx="42" cy="29" r="5" fill="#14294A" stroke="#fff" strokeWidth="2"/></g>
        </svg>
        <div className="sbm-route-caption"><span className="sbm-bus-symbol"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M6 7h12v5H6z" fill="currentColor" opacity=".2"/><path d="M5 15h14M7 20v-2m10 2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span><span><strong>Rute perjalanan terencana</strong><small>Dari titik awal, penjemputan, hingga sekolah</small></span></div>
      </div>
    </section>

    <section className="sbm-refined-roles" aria-label="Fitur untuk setiap pengguna">
      <div className="sbm-section-heading"><p className="sbm-eyebrow"><i/> SATU APLIKASI, TIGA PERAN</p><h2>Dirancang untuk setiap perjalanan</h2></div>
      {roles.map((role) => <article className={`sbm-refined-role ${role.type}`} key={role.type}>
        <span className="sbm-refined-role-icon"><RoleIcon type={role.type}/></span>
        <div className="sbm-refined-role-main"><h3>{role.title}</h3><p>{role.description}</p></div>
        <ul>{role.points.map((point) => <li key={point}>{point}</li>)}</ul>
      </article>)}
    </section>

    <section className="sbm-refined-assurance"><span aria-hidden="true">✓</span><p><strong>Informasi sesuai hak akses.</strong> Data anak, lokasi, dan video hanya ditampilkan kepada pengguna yang berwenang dan saat fitur tersedia.</p></section>
    <section className="sbm-login-section" aria-label="Masuk ke aplikasi">
      <div className="sbm-login-card">
        <div className="sbm-login-heading"><strong>Sign In</strong><span>Masuk untuk melanjutkan</span></div>
        <label>Email atau username<input type="text" name="username" autoComplete="username" placeholder="Masukkan email atau username"/></label>
        <label>Password<input type="password" name="password" autoComplete="current-password" placeholder="Masukkan password"/></label>
        <Link href="/pilih-peran" className="sbm-login-submit">Sign In</Link>
        <p className="sbm-login-signup">Belum terdaftar? <Link href="/daftar">Sign Up</Link></p>
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
      .sbm-login-section{display:flex;justify-content:center;margin:8px 0 58px;padding:0 18px}
      .sbm-login-card{width:min(100%,390px);padding:22px;background:#fff;border:1px solid #eee5c9;border-radius:15px;box-shadow:0 9px 28px #2737460b}
      .sbm-login-heading{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:17px}
      .sbm-login-heading strong{font:800 19px Manrope,sans-serif;color:#263746}
      .sbm-login-heading span{font-size:11px;color:#7a858b}
      .sbm-login-card label{display:block;margin:0 0 12px;font-size:11px;font-weight:700;color:#52616a}
      .sbm-login-card input{display:block;width:100%;height:42px;margin-top:6px;padding:0 12px;border:1px solid #e4e2d8;border-radius:8px;background:#fff;color:#263746;font:400 13px inherit;outline:none;box-sizing:border-box}
      .sbm-login-card input:focus{border-color:#d2aa1d;box-shadow:0 0 0 3px #efc32d24}
      .sbm-login-submit{display:flex;justify-content:center;align-items:center;width:100%;height:43px;margin-top:17px;border-radius:8px;background:#efc32d;color:#34290c;text-decoration:none;font-size:13px;font-weight:800;box-sizing:border-box}
      .sbm-login-signup{margin:14px 0 0;text-align:center;font-size:11px;color:#7a858b}
      .sbm-login-signup a{color:#8a6900;font-weight:800;text-decoration:none}
      .sbm-refined-roles{margin:56px 0 30px}
      .sbm-section-heading{margin-bottom:17px}
      .sbm-section-heading h2{font:800 clamp(21px,3vw,28px) Manrope,sans-serif;letter-spacing:-.8px;margin:7px 0 0;color:#243444}
      .sbm-refined-role{display:grid;grid-template-columns:48px minmax(190px,1.1fr) minmax(240px,1fr);align-items:center;gap:18px;padding:18px 8px;border-bottom:1px solid #e9e3d1;background:transparent}
      .sbm-refined-role:first-of-type{border-top:1px solid #e9e3d1}
      .sbm-refined-role-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#fff0b5;color:#876500}
      .sbm-refined-role-icon svg{width:24px;height:24px}
      .sbm-refined-role h3{font:800 16px Manrope,sans-serif;margin:0 0 4px;color:#273746}
      .sbm-refined-role p{font-size:13px;line-height:1.55;color:#6f7b82;margin:0}
      .sbm-refined-role ul{display:flex;flex-wrap:wrap;gap:7px 15px;list-style:none;padding:0;margin:0}
      .sbm-refined-role li{font-size:11px;color:#596971}
      .sbm-refined-role li:before{content:"✓";color:#a27b00;font-weight:800;margin-right:6px}
      .sbm-refined-role.driver .sbm-refined-role-icon{background:#e8f1f8;color:#316f9b}
      .sbm-refined-role.operator .sbm-refined-role-icon{background:#e9eef0;color:#526b78}
      .sbm-refined-assurance{display:flex;align-items:center;gap:12px;margin:30px 0 44px;padding:15px 17px;background:#fff9e8;border-radius:12px}
      .sbm-refined-assurance>span{width:27px;height:27px;display:grid;place-items:center;flex:none;border-radius:50%;background:#f4d66e;color:#594400;font-weight:900}
      .sbm-refined-assurance p{font-size:12px;line-height:1.55;color:#6f654b;margin:0}
      .sbm-refined-assurance strong{color:#493b1c}
      @media(max-width:760px){.sbm-auth-entry-card{align-items:flex-start;flex-direction:column}.sbm-auth-entry-actions{width:100%}.sbm-auth-entry-actions a{flex:1}.sbm-refined .sbm-hero{grid-template-columns:1fr}.sbm-refined .sbm-hero-visual{min-height:240px}.sbm-refined-role{grid-template-columns:42px 1fr;gap:10px 13px;padding:15px 2px}.sbm-refined-role ul{grid-column:2;gap:6px 12px}.sbm-refined .sbm-footer{gap:7px;flex-direction:column}}
    `}</style>
  </main>;
}
