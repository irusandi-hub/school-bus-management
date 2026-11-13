import { OperatorWorkspaceLayout } from "@/components/operator/OperatorWorkspaceLayout";

export const dynamic = "force-dynamic";

/**
 * Legacy /admin module URLs remain valid, but render inside the same global
 * Operator workspace. Authorization is centralized in OperatorWorkspaceLayout.
 */
export default function LegacyAdminLayout({ children }: { children: React.ReactNode }) {
  return <OperatorWorkspaceLayout>{children}</OperatorWorkspaceLayout>;
}
