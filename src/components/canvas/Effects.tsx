"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface EffectsProps {
  device?: DeviceCapabilities;
}

export function Effects({ device }: EffectsProps) {
  const gl = useThree((state) => state.gl);
  const [isComposerSafe, setIsComposerSafe] = useState(false);

  useEffect(() => {
    let canceled = false;
    let tries = 0;

    const check = () => {
      if (canceled) return;
      tries += 1;

      try {
        const context = gl?.getContext?.();
        if (!context || context.isContextLost?.()) {
          setIsComposerSafe(false);
          return;
        }

        const attrs = context.getContextAttributes?.();
        if (attrs) {
          setIsComposerSafe(true);
          return;
        }
      } catch {
        setIsComposerSafe(false);
        return;
      }

      if (tries < 10) requestAnimationFrame(check);
    };

    check();
    return () => {
      canceled = true;
    };
  }, [gl]);

  if (!isComposerSafe) return null;

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
