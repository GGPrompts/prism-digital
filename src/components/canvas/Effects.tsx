"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      {/* Bloom for glowing particles */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
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
