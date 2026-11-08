import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";

export const metadata: Metadata = { title: "Orang Tua | Pengelola" };

export default async function OperatorGuardiansPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;
  // Akses baca mengikuti kebijakan guardians_select_operator yang sudah ada.
  const { data, error } = await supabase.from("guardians").select("id, full_name, email, active").order("full_name", { ascending: true }).limit(200);
  const guardians = (data ?? []) as { id: string; full_name: string; email: string | null; active: boolean }[];
  return <>
    <PageHeader title="Orang Tua" description="Orang tua yang terhubung ke siswa pada organisasi Anda. Halaman ini hanya untuk membaca." />
    {error && <Notice kind="error">Daftar orang tua belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
    <section className="panel">
      <header className="panel-head"><div><h2 className="panel-title">Daftar orang tua</h2><div className="panel-subtitle">Maksimal 200 orang tua, diurutkan berdasarkan nama</div></div></header>
      <div className="admin-table-wrap"><table className="admin-table table-stack"><thead><tr><th scope="col">Nama</th><th scope="col">Email</th><th scope="col">Status</th></tr></thead><tbody>
        {guardians.length ? guardians.map((guardian) => <tr key={guardian.id}><td data-label="Nama"><strong>{guardian.full_name}</strong></td><td data-label="Email">{guardian.email ?? "—"}</td><td data-label="Status"><Pill tone={guardian.active ? "success" : "neutral"}>{guardian.active ? "Aktif" : "Nonaktif"}</Pill></td></tr>) : <EmptyRow colSpan={3} title="Belum ada orang tua" detail="Orang tua akan muncul setelah terhubung ke siswa pada organisasi Anda." />}
      </tbody></table></div>
    </section>
  </>;
}
