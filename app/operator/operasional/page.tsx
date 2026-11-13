import { redirect } from "next/navigation";

/** Legacy URL redirected into the single global Operator workspace. */
export default function LegacyOperatorModuleRedirect() {
  redirect("/operator");
}
