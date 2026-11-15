import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { deploymentKind } from "@/lib/dev-open-access";
import { cameraDemoEnabled } from "@/lib/camera/demo-policy";
const CameraDeviceDemo = dynamicImport(
  () => import("@/components/camera/CameraDeviceDemo").then((module) => module.CameraDeviceDemo),
  {
    loading: () => (
      <section className="panel" role="status" aria-live="polite">
        <p>Memuat perangkat demo kamera…</p>
      </section>
    ),
  },
);

export const dynamic = "force-dynamic";

export default function CameraDemoPage() {
  if (!cameraDemoEnabled(deploymentKind(), process.env.CAMERA_DEVICE_DEMO)) notFound();
  return <CameraDeviceDemo />;
}
