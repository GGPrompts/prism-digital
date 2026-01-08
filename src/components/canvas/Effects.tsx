"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface EffectsProps {
  device?: DeviceCapabilities;
}

export function Effects({ device }: EffectsProps) {
  // Adaptive effect quality based on GPU tier
  const bloomIntensity = device?.gpu === "high" ? 1.2 : 0.8;
  const bloomRadius = device?.gpu === "high" ? 0.8 : 0.5;

  return (
    <EffectComposer
      multisampling={0} // Disable multisampling for performance (FXAA handles AA)
      stencilBuffer={false} // Disable stencil buffer for better performance
    >
      {/* Bloom for glowing particles - adaptive quality */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur={device?.gpu === "high"} // Only use mipmapBlur on high-end
        radius={bloomRadius}
        blendFunction={BlendFunction.ADD}
      />

      {/* Subtle vignette for depth */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
