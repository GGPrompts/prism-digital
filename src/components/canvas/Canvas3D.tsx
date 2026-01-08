"use client";

import dynamic from "next/dynamic";

const CanvasWrapper = dynamic(
  () =>
    import("@/components/canvas/CanvasWrapper").then((mod) => mod.CanvasWrapper),
  { ssr: false }
);

export function Canvas3D() {
  return <CanvasWrapper />;
}
