import { redirect } from "next/navigation";

/** Legacy company URL. The entity is now Project Area; keep old links working. */
export default function LegacyCompanyPage() {
  redirect("/admin/area");
}
