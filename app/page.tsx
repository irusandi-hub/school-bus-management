import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Bus Management | Perjalanan Sekolah Terpantau",
  description: "Pantau perjalanan anak, bantu pengemudi menjalankan rute, dan kelola armada bus sekolah dalam satu aplikasi.",
};

function Brand() {
  return (
    <Link href="/" className="landing-brand" aria-label="School Bus Management, beranda">
      <span className="landing-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none"><rect x="5" y="6" width="30" height="25" rx="5" fill="currentColor"/><path d="M9 11h22v11H9z" fill="#fff"/><path d="M8 26h24" stroke="#172b35" strokeWidth="2"/><circle cx="12" cy="32" r="3" fill="#172b35"/><circle cx="28" cy="32" r="3" fill="#172b35"/></svg>
      </span>
      <span>School Bus <strong>Management</strong></span>
    </Link>
  );
}

const roles = [
  {
    id: "parent",
    number: "01",
    title: "Orang Tua / Wali",
    intro: "Ketahui perjalanan anak tanpa harus terus bertanya.",
    items: ["Informasi anak naik dan turun bus", "Posisi bus saat GPS tersedia", "Tampilan kamera saat perangkat terhubung"],
  },
  {
    id: "driver",
    number: "02",
    title: "Pengemudi",
    intro: "Jalankan perjalanan dengan arahan yang jelas dan teratur.",
    items: ["Urutan titik jemput dan antar", "Informasi siswa dalam perjalanan", "Pencatatan status dan pemeriksaan bus"],
  },
  {
    id: "operator",
    number: "03",
    title: "Operator",
    intro: "Kelola armada, pengemudi, dan penugasan dalam satu tempat.",
    items: ["Data dan status kendaraan", "Data pengemudi dan penugasan", "Ringkasan perjalanan operasional"],
  },
];

function RoleVisual({ id }: { id: string }) {
  if (id === "parent") return (
    <div className="role-visual parent-visual" aria-hidden="true">
      <div className="visual-topline"><span>RINGKASAN PERJALANAN</span><i>● TERHUBUNG</i></div>
      <div className="parent-map">
        <span className="map-street street-one"/><span className="map-street street-two"/><span className="map-street street-three"/>
        <span className="map-place place-one"/><span className="map-place place-two"/>
        <span className="map-route"/>
        <span className="map-bus"><svg viewBox="0 0 32 24"><rect x="2" y="2" width="28" height="17" rx="4" fill="currentColor"/><path d="M6 5h20v7H6z" fill="#fff"/><circle cx="9" cy="20" r="2.5" fill="#172b35"/><circle cx="23" cy="20" r="2.5" fill="#172b35"/></svg></span>
      </div>
      <div className="visual-bottomline"><b>Bus dalam perjalanan</b><span>Lokasi diperbarui saat tersedia</span></div>
    </div>
  );
  if (id === "driver") return (
    <div className="role-visual driver-visual" aria-hidden="true">
      <div className="visual-topline"><span>PANDUAN RUTE</span><i>PERJALANAN HARI INI</i></div>
      <div className="route-preview">
        <div className="route-step done"><b>✓</b><span><strong>Garasi</strong><small>Titik awal</small></span><em/></div>
        <div className="route-step active"><b>2</b><span><strong>Titik penjemputan</strong><small>Urutan berikutnya</small></span><em/></div>
        <div className="route-step"><b>3</b><span><strong>Sekolah</strong><small>Tujuan akhir</small></span></div>
      </div>
      <div className="visual-bottomline"><b>Rute tersusun berurutan</b><span>Catatan siswa dan status perjalanan</span></div>
    </div>
  );
  return (
    <div className="role-visual operator-visual" aria-hidden="true">
      <div className="visual-topline"><span>RINGKASAN ARMADA</span><i>AREA OPERASIONAL</i></div>
      <div className="fleet-display">
        <div className="fleet-bus"><svg viewBox="0 0 180 82"><rect x="8" y="9" width="164" height="56" rx="11" fill="#eabf26"/><rect x="19" y="18" width="142" height="25" rx="4" fill="#f8fafc"/><path d="M24 22h24v17H24zm30 0h24v17H54zm30 0h24v17H84zm30 0h24v17h-24z" fill="#b9d0d9"/><path d="M9 48h162" stroke="#fff1b7" strokeWidth="3"/><circle cx="43" cy="66" r="10" fill="#263746"/><circle cx="139" cy="66" r="10" fill="#263746"/><circle cx="43" cy="66" r="4" fill="#dbe3e8"/><circle cx="139" cy="66" r="4" fill="#dbe3e8"/></svg></div>
        <div className="fleet-stats"><span><b>BUS</b><small>Armada</small></span><span><b>DRIVER</b><small>Pengemudi</small></span><span><b>RUTE</b><small>Penugasan</small></span></div>
      </div>
      <div className="visual-bottomline"><b>Data operasional terpusat</b><span>Armada dan penugasan lebih tertata</span></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header"><Brand/><a className="header-login" href="#akses">Masuk <span>↗</span></a></header>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow"><i/> TRANSPORTASI SEKOLAH</span>
          <h1>Perjalanan sekolah<br/>yang <em>lebih terpantau.</em></h1>
          <p>Informasi perjalanan anak, panduan bagi pengemudi, dan pengelolaan armada bus sekolah dalam satu aplikasi.</p>
          <div className="hero-actions">
            <Link href="/pilih-peran" className="button-primary">Masuk ke aplikasi <span>→</span></Link>
            <a href="#peran" className="button-secondary">Kenali fitur aplikasi <span>↓</span></a>
          </div>
          <div className="hero-notes"><span><b>✓</b> Informasi sesuai akses pengguna</span><span><b>✓</b> Dirancang untuk perjalanan sekolah</span></div>
        </div>
        <div className="hero-art">
          <img src="https://theshadowgps.com/cdn/shop/articles/Best_GPS_Car_Tracking_Device.jpg?v=1762760262" alt="Bus sekolah di jalan" fetchPriority="high"/>
          <div className="hero-image-shade"/>
          <div className="hero-image-label"><span className="label-icon">⌖</span><span><b>Perjalanan lebih terarah</b><small>Informasi dalam satu aplikasi</small></span></div>
          <div className="hero-index"><b>01</b><span>TRANSPORTASI<br/>SEKOLAH</span></div>
        </div>
      </section>

      <section className="roles-section" id="peran">
        <div className="section-heading">
          <span className="eyebrow">SATU APLIKASI, TIGA PERAN</span>
          <h2>Informasi yang dibutuhkan,<br/><em>lebih mudah dijangkau.</em></h2>
        </div>
        <div className="role-grid">
          {roles.map((role) => (
            <article className={`role-card ${role.id}`} key={role.id}>
              <div className="role-card-heading"><span className="role-number">{role.number}</span><span className="role-title">{role.title}</span></div>
              <RoleVisual id={role.id}/>
              <p className="role-intro">{role.intro}</p>
              <ul>{role.items.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="safety-strip">
        <span className="safety-mark" aria-hidden="true">✓</span>
        <p><strong>Keselamatan dan privasi menjadi perhatian.</strong> Informasi anak ditampilkan kepada wali yang berhak. Lokasi dan kamera bergantung pada ketersediaan perangkat serta jaringan.</p>
      </section>

      <section className="access-section" id="akses">
        <div><span className="eyebrow">AKSES APLIKASI</span><h2>Siap melanjutkan?</h2><p>Masuk untuk membuka halaman sesuai peran dan hak akses akun Anda.</p></div>
        <Link href="/pilih-peran" className="button-primary">Masuk ke aplikasi <span>→</span></Link>
      </section>

      <footer className="landing-footer"><Brand/><span>© 2026 School Bus Management</span><span>Dammam, Saudi Arabia</span></footer>

      <style>{`
        .landing-page{--yellow:#facc15;--yellow-deep:#eab308;--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;max-width:1440px;margin:0 auto;padding:0 clamp(20px,5.4vw,78px);background:#fff;color:var(--ink);font-family:'DM Sans',Arial,sans-serif}
        .landing-page *{box-sizing:border-box}
        .landing-header{height:82px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eef2f5}
        .landing-brand{display:inline-flex;align-items:center;gap:11px;color:#172b35;text-decoration:none;font:700 14px/1.15 Manrope,sans-serif;letter-spacing:-.3px}
        .landing-brand strong{display:block;font-weight:800}
        .landing-brand-mark{width:39px;height:39px;display:grid;place-items:center;color:#eab308}
        .landing-brand-mark svg{width:100%;height:100%}
        .header-login{display:inline-flex;align-items:center;gap:16px;padding:11px 17px;border:1px solid #dbe2e8;border-radius:8px;color:#172b35;text-decoration:none;font-size:12px;font-weight:700}
        .header-login span{color:#a07800}
        .landing-hero{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(34px,6vw,86px);align-items:center;padding:64px 0 70px}
        .hero-copy{max-width:530px}
        .eyebrow{display:inline-flex;align-items:center;gap:9px;color:#8a6a0b;font-size:10px;font-weight:800;letter-spacing:1.35px}
        .eyebrow>i{width:7px;height:7px;border-radius:50%;background:var(--yellow-deep)}
        .hero-copy h1,.section-heading h2,.access-section h2{font:800 clamp(36px,4.3vw,59px)/1.08 Manrope,sans-serif;letter-spacing:-2.2px;margin:20px 0 17px;color:var(--ink)}
        .hero-copy h1 em,.section-heading h2 em{font-style:normal;color:#b58a09}
        .hero-copy>p{max-width:440px;color:#64748b;font-size:15px;line-height:1.8;margin:0}
        .hero-actions{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:28px}
        .button-primary{display:inline-flex;align-items:center;justify-content:center;gap:23px;min-height:48px;padding:0 19px;border-radius:8px;background:var(--yellow);color:#332806;text-decoration:none;font-size:12px;font-weight:800;box-shadow:0 5px 13px #eab30824;transition:transform .18s,background .18s}
        .button-primary:hover{background:#f4c400;transform:translateY(-1px)}
        .button-secondary{display:inline-flex;align-items:center;gap:12px;color:#475569;text-decoration:none;font-size:12px;font-weight:700}
        .button-secondary span{color:#a07800}
        .hero-notes{display:flex;flex-wrap:wrap;gap:12px 20px;margin-top:27px;color:#748091;font-size:10px}
        .hero-notes b{display:inline-grid;place-items:center;width:16px;height:16px;margin-right:5px;border-radius:50%;background:#fef3c7;color:#98720b;font-size:9px}
        .hero-art{position:relative;min-width:0;height:440px;border-radius:13px;overflow:hidden;background:#dbe5e9}
        .hero-art>img{width:100%;height:100%;display:block;object-fit:cover;object-position:center}
        .hero-image-shade{position:absolute;inset:0;background:linear-gradient(180deg,#0f172a08 35%,#0f172a55 100%)}
        .hero-image-label{position:absolute;left:22px;bottom:22px;display:flex;align-items:center;gap:12px;padding:13px 17px;border:1px solid #ffffff80;border-radius:9px;background:#fffF;color:#172b35;backdrop-filter:blur(12px)}
        .label-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:8px;background:#fef3c7;color:#8a6a0b;font-size:21px}
        .hero-image-label b,.hero-image-label small{display:block}
        .hero-image-label b{font:700 12px Manrope,sans-serif}
        .hero-image-label small{margin-top:3px;color:#64748b;font-size:10px}
        .hero-index{position:absolute;right:20px;top:20px;display:flex;align-items:center;gap:9px;color:#fff;text-shadow:0 1px 8px #0008}
        .hero-index b{font:800 28px Manrope,sans-serif}
        .hero-index span{font-size:8px;line-height:1.45;font-weight:800;letter-spacing:1px}
        .roles-section{padding:34px 0 0}
        .section-heading{margin-bottom:25px}
        .section-heading h2{font-size:clamp(26px,3vw,38px);letter-spacing:-1.2px;line-height:1.16;margin:12px 0 0}
        .role-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}
        .role-card{min-width:0;padding:19px;border:1px solid var(--line);border-radius:12px;background:#fff;box-shadow:0 8px 24px #0f172a06}
        .role-card-heading{display:flex;align-items:center;gap:10px;margin-bottom:15px}
        .role-number{display:grid;place-items:center;width:29px;height:29px;border-radius:7px;background:#fef3c7;color:#8a6a0b;font:800 10px Manrope,sans-serif}
        .role-title{font:800 14px Manrope,sans-serif;color:#1e293b}
        .role-visual{height:178px;overflow:hidden;border-radius:9px;padding:13px;background:#f8fafc;border:1px solid #edf1f5}
        .visual-topline{display:flex;justify-content:space-between;align-items:center;gap:8px;color:#64748b;font-size:7px;font-weight:800;letter-spacing:.8px}
        .visual-topline i{font-style:normal;color:#7b8794;font-size:7px;white-space:nowrap}
        .parent-visual .visual-topline i{color:#3e8a69}
        .parent-map{height:95px;position:relative;margin-top:8px;overflow:hidden;border-radius:6px;background:#edf2ed;background-image:radial-gradient(#cdd9d0 1px,transparent 1px);background-size:13px 13px}
        .map-street{position:absolute;height:9px;border:1px solid #d8e1dc;border-radius:20px;background:#fff}
        .street-one{width:120%;left:-8%;top:48%;transform:rotate(-17deg)}
        .street-two{width:95%;left:14%;top:28%;transform:rotate(34deg)}
        .street-three{width:90%;left:24%;top:78%;transform:rotate(-48deg)}
        .map-route{position:absolute;left:18%;top:54%;width:66%;height:3px;background:#d6a800;transform:rotate(-14deg);border-radius:5px}
        .map-place{position:absolute;z-index:2;width:10px;height:10px;border-radius:50%;background:#fff;border:3px solid #6b9b7c}
        .place-one{left:15%;top:60%}.place-two{right:14%;top:27%}
        .map-bus{position:absolute;z-index:3;left:54%;top:34%;width:29px;height:25px;padding:3px;border-radius:6px;background:#fff;box-shadow:0 2px 7px #172b3522;color:#eab308}
        .map-bus svg{width:100%;height:100%}
        .visual-bottomline{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:9px}
        .visual-bottomline b{font-size:9px;color:#334155}.visual-bottomline span{font-size:7px;color:#8793a0;text-align:right}
        .driver-visual{background:#f7fafb}
        .route-preview{display:grid;gap:0;margin:13px 8px 0}
        .route-step{position:relative;display:flex;align-items:center;gap:10px;min-height:32px}
        .route-step:not(:last-child):after{position:absolute;content:"";left:10px;top:24px;bottom:-8px;width:2px;background:#dbe4e8}
        .route-step>b{z-index:1;width:21px;height:21px;display:grid;place-items:center;flex:none;border-radius:50%;border:1px solid #d5dee5;background:#fff;color:#7b8794;font-size:8px}
        .route-step.done>b{background:#e4f1e8;border-color:#b8d5c1;color:#3c8058}
        .route-step.active>b{background:#fef3c7;border:2px solid #eab308;color:#765900}
        .route-step span{display:flex;align-items:baseline;gap:8px;min-width:0}
        .route-step strong{font-size:9px;color:#334155}.route-step small{font-size:8px;color:#8994a0}
        .fleet-display{display:flex;flex-direction:column;align-items:center;justify-content:center;height:125px;padding-top:5px}
        .fleet-bus{width:74%;max-width:210px}
        .fleet-bus svg{display:block;width:100%;height:auto}
        .fleet-stats{display:flex;justify-content:center;gap:24px;margin-top:2px}
        .fleet-stats span{text-align:center}.fleet-stats b,.fleet-stats small{display:block}
        .fleet-stats b{font:800 8px Manrope,sans-serif;color:#475569}.fleet-stats small{font-size:7px;color:#94a3b8;margin-top:2px}
        .role-intro{margin:16px 0 13px;color:#334155;font-size:12px;line-height:1.55;font-weight:650}
        .role-card ul{display:grid;gap:10px;margin:0;padding:13px 0 0;border-top:1px solid #edf1f5;list-style:none}
        .role-card li{display:flex;align-items:flex-start;gap:9px;color:#64748b;font-size:10px;line-height:1.5}
        .role-card li>span{display:grid;place-items:center;flex:none;width:16px;height:16px;border-radius:50%;background:#fef3c7;color:#8a6a0b;font-size:9px;font-weight:800}
        .safety-strip{display:flex;align-items:center;gap:13px;margin:27px 0 35px;padding:15px 18px;border:1px solid #e9e4d2;border-radius:10px;background:#fffdf6}
        .safety-mark{display:grid;place-items:center;flex:none;width:30px;height:30px;border-radius:8px;background:#fef3c7;color:#8a6a0b;font-weight:800}
        .safety-strip p{margin:0;color:#64748b;font-size:10px;line-height:1.6}
        .safety-strip strong{color:#334155}
        .access-section{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px 30px;border-radius:12px;background:#111f35;color:#fff}
        .access-section .eyebrow{color:#f6d76b}.access-section h2{margin:7px 0 5px;color:#fff;font-size:25px;letter-spacing:-.7px}
        .access-section p{margin:0;color:#c3cfdd;font-size:11px;line-height:1.6}
        .landing-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px 0 27px;color:#8793a0;font-size:9px}
        .landing-footer .landing-brand{font-size:10px;color:#475569}.landing-footer .landing-brand-mark{width:27px;height:27px}
        @media(max-width:900px){.landing-page{padding:0 28px}.landing-hero{gap:30px;padding:48px 0 54px}.hero-art{height:370px}.role-grid{gap:11px}.role-card{padding:14px}.role-visual{height:165px}.visual-bottomline{align-items:flex-start;flex-direction:column;gap:2px}.visual-bottomline span{text-align:left}}
        @media(max-width:680px){
          .landing-page{padding:0 18px}
          .landing-header{height:66px}.landing-brand{font-size:12px;gap:8px}.landing-brand-mark{width:33px;height:33px}.header-login{padding:9px 12px;font-size:11px}
          .landing-hero{grid-template-columns:1fr;gap:23px;padding:36px 0 42px}
          .hero-copy{max-width:none}.hero-copy h1{font-size:clamp(34px,9vw,43px);line-height:1.1;letter-spacing:-1.5px;margin:13px 0 12px}
          .hero-copy>p{font-size:13px;line-height:1.7}
          .hero-actions{gap:15px;margin-top:21px}.button-primary{min-height:45px;padding:0 15px;gap:15px;font-size:11px}.button-secondary{font-size:11px}
          .hero-notes{display:grid;gap:8px;margin-top:18px;font-size:9px}
          .hero-art{height:265px;border-radius:10px}.hero-art>img{object-position:center 54%}.hero-image-label{left:12px;bottom:12px;padding:9px 11px;gap:8px}.label-icon{width:29px;height:29px;font-size:18px}.hero-image-label b{font-size:10px}.hero-image-label small{font-size:8px}.hero-index{right:12px;top:12px}.hero-index b{font-size:22px}
          .roles-section{padding-top:8px}.section-heading{margin-bottom:17px}.section-heading h2{font-size:27px;letter-spacing:-.8px;margin-top:9px}
          .role-grid{grid-template-columns:1fr;gap:12px}.role-card{padding:15px;border-radius:10px}.role-card-heading{margin-bottom:12px}.role-title{font-size:13px}
          .role-visual{height:166px;padding:12px}.parent-map{height:87px}.visual-bottomline{flex-direction:row;align-items:center}.visual-bottomline span{text-align:right}
          .role-intro{font-size:11px;margin:13px 0 11px}.role-card ul{gap:8px;padding-top:11px}.role-card li{font-size:10px}
          .safety-strip{align-items:flex-start;margin:19px 0 25px;padding:12px}.safety-strip p{font-size:9px}
          .access-section{align-items:flex-start;flex-direction:column;padding:21px 18px;gap:17px}.access-section h2{font-size:23px}.access-section p{font-size:10px}
          .landing-footer{flex-wrap:wrap;justify-content:space-between;padding:19px 0 22px}.landing-footer>span:last-child{width:100%}
        }
        @media(max-width:360px){.landing-page{padding:0 14px}.hero-copy h1{font-size:32px}.hero-actions{align-items:flex-start;flex-direction:column}.hero-art{height:235px}.section-heading h2{font-size:24px}.role-visual{height:158px}}
      `}</style>
    </main>
  );
}
