import { OperatorLayout } from "@/app/operator/layout";

/**
 * Legacy /admin module URLs remain valid, but render inside the same global
 * Operator workspace. Authorization is centralized in OperatorLayout.
 */
export default function LegacyAdminLayout({ children }: { children: React.ReactNode }) {
  return <OperatorLayout>{children}</OperatorLayout>;
}
