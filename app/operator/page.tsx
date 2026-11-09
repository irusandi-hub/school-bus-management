import AdminHomePage from "@/app/admin/page";

export const metadata = { title: "Ringkasan Operator | School Bus" };

/** The single Operator dashboard reuses the platform-wide administration overview. */
export default function OperatorHomePage() {
  return <AdminHomePage />;
}
