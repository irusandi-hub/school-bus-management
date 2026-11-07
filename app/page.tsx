import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Bus Management | Transportasi Sekolah Terpantau",
  description: "Pengelolaan transportasi sekolah, operasional armada, navigasi pengemudi, dan pemantauan perjalanan anak.",
};

function BrandMark() {
  return <span className="sbm-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><rect x="4" y="5" width="24" height="19" rx="4" fill="currentColor"/><path d="M7.5 9h17v8h-17z" fill="#fff"/><path d="M7 20h18" stroke="#142044" strokeWidth="2"/><circle cx="10" cy="25" r="2.5" fill="#142044"/><circle cx="22" cy="25" r="2.5" fill="#142044"/></svg></span>;
}
function Brand(){return <Link href="/" className="sbm-brand"><BrandMark/><span>School Bus<br/>Management</span></Link>}

function HeroVisual() {
  return <div className="sbm-hero-visual" role="img" aria-label="Visualisasi pemantauan armada dan rute bus sekolah">
    <div className="sbm-visual-top"><span className="sbm-live-dot"/> FLEET MONITORING <span className="sbm-visual-live">LIVE VIEW</span></div>
    <svg className="sbm-map-visual" viewBox="0 0 660 330" fill="none" aria-hidden="true">
      <path d="M-20 75 160 25l120 64 125-42 120 56 160-45M-20 225l150-60 110 44 120-58 115 58 170-55M70-20l42 120-42 100 48 150M250-20l-35 120 45 105-20 150M470-20l-35 115 45 110-15 130M610-20l-55 130 65 90-35 150" stroke="#D7E2EC" strokeWidth="18" strokeLinecap="round"/>
      <path d="m-10 142 135-38 110 54 105-42 110 43 145-40" stroke="#fff" strokeWidth="9" strokeLinecap="round"/>
      <path d="m125 158 70-23 66 34 94-38 72 32 100-28" stroke="#2B83C6" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 0"/>
      <path d="m125 158 70-23 66 34 94-38 72 32 100-28" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 9"/>
      <circle cx="125" cy="158" r="12" fill="#fff" stroke="#2B83C6" strokeWidth="5"/><circle cx="527" cy="135" r="12" fill="#fff" stroke="#2B83C6" strokeWidth="5"/>
      <circle cx="329" cy="131" r="18" fill="#F5C32B" stroke="#fff" strokeWidth="6"/>
      <g transform="translate(302 103)" fill="#14294A"><rect x="4" y="5" width="47" height="23" rx="5"/><path d="M10 2h31l7 7H7z"/><rect x="9" y="9" width="8" height="7" rx="1" fill="#DCEBFA"/><rect x="20" y="9" width="8" height="7" rx="1" fill="#DCEBFA"/><rect x="31" y="9" width="8" height="7" rx="1" fill="#DCEBFA"/><circle cx="15" cy="29" r="5" fill="#14294A" stroke="#fff" strokeWidth="2"/><circle cx="42" cy="29" r="5" fill="#14294A" stroke="#fff" strokeWidth="2"/></g>
    </svg>
    <div className="sbm-visual-card sbm-visual-card-route"><span className="sbm-card-kicker">RUTE AKTIF</span><strong>Penjemputan siswa</strong><small>Urutan titik terencana</small><div className="sbm-route-progress"><i/></div></div>
    <div className="sbm-visual-card sbm-visual-card-bus"><span className="sbm-bus-symbol"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M6 7h12v5H6z" fill="currentColor" opacity=".2"/><path d="M5 15h14M7 20v-2m10 2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="17" r="1" fill="currentColor"/><circle cx="17" cy="17" r="1" fill="currentColor"/></svg></span><span><strong>Armada terpantau</strong><small>Lokasi mengikuti ketersediaan perangkat</small></span></div>
  </div>;
}

function Check({children}:{children:React.ReactNode}){return <li><span aria-hidden="true">✓</span>{children}</li>}
function RoleIcon({type}:{type:"operator"|"driver"|"wali"}) {
  if(type==="operator") return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="5" width="24" height="22" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M10 11h12M10 16h5m3 0h4M10 21h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  if(type==="driver") return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 25 24 7M13 7h11v11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="25" r="3" stroke="currentColor" strokeWidth="2"/></svg>;
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 13 16 5l11 8v13H5V13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 26v-8h8v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M11 13h.01M21 13h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
}

const roles = [
  {type:"operator" as const,title:"Operator",kicker:"PENGELOLA OPERASIONAL",description:"Kendalikan armada, pengemudi, rute, penugasan, dan perjalanan dari satu pusat operasional.",items:["Armada dan pengemudi","Rute serta penugasan","Monitoring perjalanan"],tone:"operator"},
  {type:"driver" as const,title:"Pengemudi",kicker:"OPERASIONAL PERJALANAN",description:"Jalankan tugas dengan navigasi, urutan titik jemput, dan pembaruan status siswa.",items:["Navigasi titik jemput/antar","Urutan rute terencana","Konfirmasi kehadiran"],tone:"driver"},
  {type:"wali" as const,title:"Orang Tua/Wali",kicker:"PEMANTAUAN ANAK",description:"Dapatkan informasi perjalanan anak dan pantau bus melalui fitur yang tersedia.",items:["Status perjalanan anak","Lokasi bus jika tersedia","Video langsung jika tersedia"],tone:"wali"},
];

export default function LandingPage(){
 return <main className="sbm-landing">
  <header className="sbm-header"><Brand/><nav className="sbm-nav" aria-label="Navigasi utama"><a href="#beranda" className="active">Beranda</a><Link href="/pilih-peran" className="sbm-login">Masuk <span aria-hidden="true">↗</span></Link></nav></header>
  <section className="sbm-hero" id="beranda"><div className="sbm-hero-copy"><p className="sbm-eyebrow"><i/> PLATFORM MANAJEMEN TRANSPORTASI SEKOLAH</p><h1>Transportasi Sekolah<br/>yang <em>Terpantau</em>,<br/>Teratur, dan Terpercaya.</h1><p className="sbm-lead">Satu platform untuk mengelola operasional bus, memandu perjalanan pengemudi, dan memberi orang tua informasi perjalanan anak.</p><Link href="/pilih-peran" className="sbm-primary">Masuk ke Aplikasi <span aria-hidden="true">→</span></Link></div><HeroVisual/></section>
  <section className="sbm-role-grid" aria-label="Area pengguna">{roles.map(role=><article className={`sbm-role-card ${role.tone}`} key={role.type}><div className="sbm-role-card-head"><span className="sbm-role-icon"><RoleIcon type={role.type}/></span><span className="sbm-role-kicker">{role.kicker}</span></div><h2>{role.title}</h2><p className="sbm-role-description">{role.description}</p><ul>{role.items.map(item=><Check key={item}>{item}</Check>)}</ul><Link href="/pilih-peran" className="sbm-role-link">Buka area <span aria-hidden="true">↗</span></Link></article>)}</section>
  <section className="sbm-security"><span className="sbm-security-icon"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3 27 7v8c0 7-4.5 11.5-11 14-6.5-2.5-11-7-11-14V7l11-4Z" stroke="currentColor" strokeWidth="2"/><path d="m11 16 3.2 3.2L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><div><strong>Keamanan dan privasi sebagai prioritas</strong><p>Akses fitur dan informasi dibatasi sesuai kewenangan akun. Ketersediaan lokasi dan video bergantung pada perangkat serta layanan yang terhubung.</p></div><span className="sbm-security-meta">AKSES BERDASARKAN PERAN · PRIVASI DATA</span></section>
  <footer className="sbm-footer"><span>© 2026 School Bus Management</span><span>Dammam, Saudi Arabia</span></footer>
 </main>
}
