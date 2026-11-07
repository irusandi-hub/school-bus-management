import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Eksplorasi Sementara | School Bus Management" };

const roles = [
  { href: "/akses/wali", title: "Orang Tua" },
  { href: "/akses/pengemudi", title: "Pengemudi" },
  { href: "/akses/operator", title: "Operator" },
];

export default function ChooseRolePage() {
  return (
    <main className="sbm-role-explore">
      <section className="sbm-role-explore-card" aria-labelledby="explore-title">
        <Link href="/" className="sbm-role-explore-brand" aria-label="Kembali ke beranda">
          <span className="sbm-role-explore-mark">S</span>
          <span>School Bus Management</span>
        </Link>
        <h1 id="explore-title">Pilih tampilan pengguna</h1>
        <p className="sbm-role-explore-note">Halaman ini hanya untuk eksplorasi sementara selama aplikasi dikembangkan. Pilihan di bawah bukan proses masuk ke akun.</p>
        <nav className="sbm-role-explore-actions" aria-label="Pilih tampilan untuk dieksplorasi">
          {roles.map((role) => (
            <Link href={role.href} key={role.href}>{role.title}<span aria-hidden="true">→</span></Link>
          ))}
        </nav>
        <Link href="/" className="sbm-role-explore-back">Kembali ke beranda</Link>
      </section>
      <style>{`
        .sbm-role-explore{min-height:100vh;display:grid;place-items:center;padding:22px;background:#f7f5ec}
        .sbm-role-explore-card{width:min(100%,430px);padding:28px;background:#fff;border:1px solid #eee5ca;border-radius:18px;box-shadow:0 14px 40px #4e42100b}
        .sbm-role-explore-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#33414a;font:800 12px Manrope,sans-serif;margin-bottom:27px}
        .sbm-role-explore-mark{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#edc32e;color:#3c310f;font:800 18px Manrope,sans-serif}
        .sbm-role-explore-card h1{font:800 21px Manrope,sans-serif;letter-spacing:-.5px;color:#263746;margin:0 0 8px}
        .sbm-role-explore-note{font-size:12px;line-height:1.65;color:#78838a;margin:0 0 20px}
        .sbm-role-explore-actions{display:grid;gap:9px}
        .sbm-role-explore-actions a{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border:1px solid #e9e3d1;border-radius:10px;text-decoration:none;color:#263746;font:800 13px Manrope,sans-serif;background:#fff}
        .sbm-role-explore-actions a:first-child{background:#fff9e7;border-color:#f0dfa9}
        .sbm-role-explore-actions a span{font-size:18px;color:#987400}
        .sbm-role-explore-back{display:inline-block;margin-top:20px;color:#7c6a37;text-decoration:none;font-size:11px;font-weight:700}
        @media(max-width:480px){.sbm-role-explore-card{padding:22px;border-radius:15px}}
      `}</style>
    </main>
  );
}
