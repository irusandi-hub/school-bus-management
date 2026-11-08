import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";

export const metadata: Metadata = { title: "Sekolah | Operator" };

export default async function OperatorSchoolsPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;
  // Akses baca mengikuti kebijakan schools_select_operator yang sudah ada.
  const { data, error } = await supabase.from("schools").select("id, name, city").order("name", { ascending: true }).limit(200);
  const schools = (data ?? []) as { id: string; name: string; city: string | null }[];
  return <>
    <PageHeader title="Sekolah" description="Sekolah yang terhubung ke organisasi Anda. Halaman ini hanya untuk membaca." />
    {error && <Notice kind="error">Daftar sekolah belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
    <section className="panel">
      <header className="panel-head"><div><h2 className="panel-title">Daftar sekolah</h2><div className="panel-subtitle">Maksimal 200 sekolah, diurutkan berdasarkan nama</div></div></header>
      <div className="admin-table-wrap"><table className="admin-table table-stack"><thead><tr><th scope="col">Sekolah</th><th scope="col">Kota</th></tr></thead><tbody>
        {schools.length ? schools.map((school) => <tr key={school.id}><td data-label="Sekolah"><strong>{school.name}</strong></td><td data-label="Kota">{school.city ?? "—"}</td></tr>) : <EmptyRow colSpan={2} title="Belum ada sekolah" detail="Sekolah akan muncul setelah terhubung ke organisasi Anda." />}
      </tbody></table></div>
    </section>
  </>;
}
