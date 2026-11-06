import { notFound } from "next/navigation";
import { deploymentKind } from "@/lib/dev-open-access";
import { cameraDemoEnabled } from "@/lib/camera/demo-policy";
import { CameraDeviceDemo } from "@/components/camera/CameraDeviceDemo";

export const dynamic = "force-dynamic";

export default function CameraDemoPage() {
  if (!cameraDemoEnabled(deploymentKind(), process.env.CAMERA_DEVICE_DEMO)) notFound();
  return <CameraDeviceDemo />;
}
