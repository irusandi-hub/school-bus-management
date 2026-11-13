"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminReadContext } from "@/lib/admin/read";
import { ALL_AREAS, PROJECT_AREA_COOKIE, safeWorkspacePath } from "@/lib/project-areas/context";
import { readText } from "@/lib/validation";

/**
 * Switches the dashboard working context. "all" is the global view; any other
 * value must be an existing active Area Operasional. The cookie only changes what the
 * Operator is looking at — it never grants access.
 */
export async function setProjectArea(formData: FormData) {
  const next = safeWorkspacePath(readText(formData, "next"));
  const value = readText(formData, "area") || ALL_AREAS;

  if (value !== ALL_AREAS) {
    const supabase = await adminReadContext();
    if (!supabase) {
      redirect(`${next}?jenis=error&pesan=${encodeURIComponent("Koneksi database belum dikonfigurasi.")}`);
    }

    const { data } = await supabase
      .from("project_areas")
      .select("id")
      .eq("id", value)
      .eq("active", true)
      .maybeSingle();

    if (!data) {
      redirect(`${next}?jenis=error&pesan=${encodeURIComponent("Area Operasional tidak ditemukan atau sudah nonaktif.")}`);
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(PROJECT_AREA_COOKIE, value, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/admin");
  revalidatePath("/operator");
  redirect(next);
}
