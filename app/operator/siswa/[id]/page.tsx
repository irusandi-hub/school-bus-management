import { redirect } from "next/navigation";

/** Legacy detail URL redirected into the single global Operator workspace. */
export default async function LegacyOperatorDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/siswa/${encodeURIComponent(id)}`);
}
