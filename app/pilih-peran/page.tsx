import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Jelajahi Tampilan | School Bus Management" };

const roles = [
  { href: "/akses/wali", title: "Orang Tua", detail: "Melihat informasi perjalanan dan pemantauan anak.", tone: "parent", icon: "parent" },
  { href: "/akses/pengemudi", title: "Pengemudi", detail: "Melihat tugas, rute, dan aktivitas perjalanan.", tone: "driver", icon: "driver" },
  { href: "/akses/operator", title: "Operator", detail: "Melihat pengelolaan armada dan operasional.", tone: "operator", icon: "operator" },
];

function Icon({ type }: { type: string }) {
  const common = { viewBox: "0 0 32 32", fill: "none", "aria-hidden": true as const };
  if (type === "parent") return <svg {...common}><path d="M5 13 16 5l11 8v13H5V13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 26v-8h8v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>;
  if (type === "driver") return <svg {...common}><path d="M6 25 24 7M13 7h11v11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="25" r="3" stroke="currentColor" strokeWidth="2"/></svg>;
  return <svg {...common}><rect x="4" y="5" width="24" height="22" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M10 11h12M10 16h5m3 0h4M10 21h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export default function ChooseRolePage() {
  return <main className="sbm-chooser sbm-chooser-compact">
    <header className="sbm-header">
      <Link href="/" className="sbm-brand"><span className="sbm-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><rect x="4" y="5" width="24" height="19" rx="4" fill="currentColor"/><path d="M7.5 9h17v8h-17z" fill="#fff"/><circle cx="10" cy="25" r="2.5" fill="#142044"/><circle cx="22" cy="25" r="2.5" fill="#142044"/></svg></span><span>School Bus<br/>Management</span></Link>
      <Link href="/" className="sbm-back">← Kembali</Link>
    </header>
    <section className="sbm-chooser-compact-body" aria-labelledby="explore-title">
      <div className="sbm-chooser-compact-copy">
        <h1 id="explore-title">Jelajahi tampilan pengguna</h1>
        <p>Pilih salah satu untuk melihat contoh area aplikasi. Ini hanya akses eksplorasi sementara sebelum proses masuk akun (autentikasi) diterapkan.</p>
      </div>
      <nav className="sbm-chooser-links" aria-label="Pilih tampilan pengguna">
        {roles.map((role) => <Link href={role.href} className={`sbm-chooser-link ${role.tone}`} key={role.href}>
          <span className="sbm-chooser-link-icon"><Icon type={role.icon}/></span>
          <span className="sbm-chooser-link-copy"><strong>{role.title}</strong><small>{role.detail}</small></span>
          <span className="sbm-chooser-link-arrow" aria-hidden="true">→</span>
        </Link>)}
      </nav>
    </section>
    <style>{`
      .sbm-chooser-compact{min-height:100vh}
      .sbm-chooser-compact .sbm-chooser-compact-body{width:min(760px,calc(100% - 36px));margin:70px auto 90px}
      .sbm-chooser-compact-copy{margin-bottom:20px}
      .sbm-chooser-compact-copy h1{font:800 clamp(22px,4vw,30px) Manrope,sans-serif;letter-spacing:-.8px;color:#243444;margin:0 0 8px}
      .sbm-chooser-compact-copy p{max-width:620px;font-size:13px;line-height:1.65;color:#738087;margin:0}
      .sbm-chooser-links{display:grid;gap:8px}
      .sbm-chooser-link{display:flex;align-items:center;gap:14px;padding:13px 15px;background:#fff;border:1px solid #e9e3d1;border-radius:12px;text-decoration:none;transition:border-color .15s,transform .15s}
      .sbm-chooser-link:hover{border-color:#e2bd43;transform:translateY(-1px)}
      .sbm-chooser-link-icon{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:10px;background:#fff0b5;color:#876500}
      .sbm-chooser-link-icon svg{width:22px;height:22px}
      .sbm-chooser-link-copy{display:grid;gap:3px;min-width:0}
      .sbm-chooser-link-copy strong{font:800 14px Manrope,sans-serif;color:#263746}
      .sbm-chooser-link-copy small{font-size:11px;line-height:1.45;color:#78848b}
      .sbm-chooser-link-arrow{margin-left:auto;color:#987400;font-size:20px}
      .sbm-chooser-link.driver .sbm-chooser-link-icon{background:#e8f1f8;color:#316f9b}
      .sbm-chooser-link.operator .sbm-chooser-link-icon{background:#e9eef0;color:#526b78}
      @media(max-width:600px){.sbm-chooser-compact .sbm-chooser-compact-body{margin:48px auto 60px}.sbm-chooser-link{padding:11px 12px;gap:11px}}
    `}</style>
  </main>;
}
