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
    <section className="sbm-chooser-card" aria-labelledby="explore-title">
      <Link href="/" className="sbm-chooser-brand"><span className="sbm-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><rect x="4" y="5" width="24" height="19" rx="4" fill="currentColor"/><path d="M7.5 9h17v8h-17z" fill="#fff"/><circle cx="10" cy="25" r="2.5" fill="#142044"/><circle cx="22" cy="25" r="2.5" fill="#142044"/></svg></span><span>School Bus Management</span></Link>
      <div className="sbm-chooser-compact-copy">
        <h1 id="explore-title">Pilih tampilan pengguna</h1>
        <p>Mode eksplorasi sementara untuk melihat pengembangan area aplikasi sebelum proses masuk akun tersedia.</p>
      </div>
      <nav className="sbm-chooser-links" aria-label="Pilih tampilan pengguna">
        {roles.map((role) => <Link href={role.href} className={`sbm-chooser-link ${role.tone}`} key={role.href}>
          <span className="sbm-chooser-link-icon"><Icon type={role.icon}/></span>
          <span className="sbm-chooser-link-copy"><strong>{role.title}</strong></span>
          <span className="sbm-chooser-link-arrow" aria-hidden="true">→</span>
        </Link>)}
      </nav>
      <p className="sbm-chooser-note">Akses ini hanya untuk peninjauan tampilan, bukan akses akun pengguna.</p>
      <Link href="/" className="sbm-chooser-back">← Kembali ke halaman utama</Link>
    </section>
    <style>{`
      .sbm-chooser-compact{min-height:100vh;display:grid;place-items:center;padding:28px 18px;background:#f7f6f1}
      .sbm-chooser-card{width:min(440px,100%);padding:26px;background:#fff;border:1px solid #ece6d6;border-radius:18px;box-shadow:0 16px 44px #2637460d}
      .sbm-chooser-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#263746;font-size:13px;font-weight:800;margin-bottom:27px}
      .sbm-chooser-brand .sbm-mark{width:34px;height:34px}
      .sbm-chooser-brand svg{width:34px;height:34px}
      .sbm-chooser-compact-copy{margin-bottom:18px}
      .sbm-chooser-compact-copy h1{font:800 22px Manrope,sans-serif;letter-spacing:-.6px;color:#243444;margin:0 0 8px}
      .sbm-chooser-compact-copy p{font-size:12px;line-height:1.6;color:#78848b;margin:0}
      .sbm-chooser-links{display:grid;gap:8px}
      .sbm-chooser-link{display:flex;align-items:center;gap:12px;padding:11px 12px;background:#fff;border:1px solid #e9e3d1;border-radius:10px;text-decoration:none}
      .sbm-chooser-link:hover{border-color:#e2bd43}
      .sbm-chooser-link-icon{width:34px;height:34px;display:grid;place-items:center;flex:none;border-radius:9px;background:#fff0b5;color:#876500}
      .sbm-chooser-link-icon svg{width:20px;height:20px}
      .sbm-chooser-link-copy{display:grid;gap:3px;min-width:0}
      .sbm-chooser-link-copy strong{font:800 13px Manrope,sans-serif;color:#263746}
      .sbm-chooser-link-arrow{margin-left:auto;color:#987400;font-size:18px}
      .sbm-chooser-link.driver .sbm-chooser-link-icon{background:#e8f1f8;color:#316f9b}
      .sbm-chooser-link.operator .sbm-chooser-link-icon{background:#e9eef0;color:#526b78}
      .sbm-chooser-note{margin:16px 0 0;padding-top:13px;border-top:1px solid #f0ede5;font-size:10px;line-height:1.5;color:#8a9296}
      .sbm-chooser-back{display:inline-block;margin-top:16px;color:#76601e;font-size:11px;font-weight:700;text-decoration:none}
      @media(max-width:420px){.sbm-chooser-card{padding:21px}.sbm-chooser-compact-copy h1{font-size:20px}}
    `}</style>
  </main>;
}
