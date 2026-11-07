import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pilih Area Pengguna | School Bus Management" };

const roles = [
 {href:"/akses/operator",title:"Operator",kicker:"PENGELOLA OPERASIONAL",detail:"Kelola armada, pengemudi, rute, penugasan, dan pantau perjalanan.",tone:"operator",icon:"operator",items:["Armada dan pengemudi","Rute serta penugasan","Monitoring perjalanan"]},
 {href:"/akses/pengemudi",title:"Pengemudi",kicker:"OPERASIONAL PERJALANAN",detail:"Akses tugas, panduan rute, daftar penjemputan, dan status siswa.",tone:"driver",icon:"driver",items:["Navigasi dan urutan titik","Daftar siswa dan status","Mulai dan akhiri perjalanan"]},
 {href:"/akses/wali",title:"Orang Tua/Wali",kicker:"PEMANTAUAN ANAK",detail:"Lihat informasi perjalanan anak dan fitur pemantauan yang tersedia.",tone:"wali",icon:"wali",items:["Status perjalanan anak","Lokasi bus jika tersedia","Video langsung jika tersedia"]},
];

function Icon({type}:{type:string}) {
 const common={viewBox:"0 0 32 32",fill:"none", "aria-hidden":true as const};
 if(type==="operator")return <svg {...common}><rect x="4" y="5" width="24" height="22" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M10 11h12M10 16h5m3 0h4M10 21h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
 if(type==="driver")return <svg {...common}><path d="M6 25 24 7M13 7h11v11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="25" r="3" stroke="currentColor" strokeWidth="2"/></svg>;
 return <svg {...common}><path d="M5 13 16 5l11 8v13H5V13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 26v-8h8v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>;
}
function Brand(){return <Link href="/" className="sbm-brand"><span className="sbm-mark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="5" width="24" height="19" rx="4" fill="currentColor"/><path d="M7.5 9h17v8h-17z" fill="#fff"/><circle cx="10" cy="25" r="2.5" fill="#142044"/><circle cx="22" cy="25" r="2.5" fill="#142044"/></svg></span><span>School Bus<br/>Management</span></Link>}

export default function ChooseRolePage(){
 return <main className="sbm-chooser"><header className="sbm-header"><Brand/><Link href="/" className="sbm-back">← Beranda</Link></header>
 <section className="sbm-chooser-content"><div className="sbm-chooser-intro"><p className="sbm-eyebrow"><i/> AKSES PLATFORM</p><h1>Pilih area pengguna</h1><p className="sbm-chooser-lead">Lanjutkan sesuai peran dan tanggung jawab Anda.</p></div>
 <div className="sbm-chooser-grid">{roles.map(role=><article className={`sbm-chooser-card ${role.tone}`} key={role.href}><div className="sbm-chooser-card-head"><span className="sbm-chooser-icon"><Icon type={role.icon}/></span><span className="sbm-role-kicker">{role.kicker}</span></div><h2>{role.title}</h2><p className="sbm-role-detail">{role.detail}</p><ul className="sbm-role-features">{role.items.map(item=><li key={item}><span>✓</span>{item}</li>)}</ul><Link href={role.href} className="sbm-role-action">Lanjutkan <span aria-hidden="true">↗</span></Link></article>)}</div></section>
 <footer className="sbm-footer"><span>© 2026 School Bus Management</span><span>Dammam, Saudi Arabia</span></footer></main>
}
