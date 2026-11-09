import { OperatorWorkspaceLayout } from "@/components/operator/OperatorWorkspaceLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operator | School Bus" };

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <OperatorWorkspaceLayout>{children}</OperatorWorkspaceLayout>;
}
