"use client";

import { useEffect, useState, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  HueSaturation,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface EffectsProps {
  device?: DeviceCapabilities;
}

/**
 * Post-processing effects with GPU-tier adaptive quality.
 * Tuned to avoid blurring text overlays.
 */
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

  // Determine effect tier based on GPU and device type
  const effectTier = useMemo(() => {
    const gpuTier = device?.gpu ?? "high";
    const isMobile = device?.isMobile ?? false;

    if (isMobile) {
      return gpuTier === "low" ? "low" : "medium";
    }

    return gpuTier;
  }, [device?.gpu, device?.isMobile]);

  // Adaptive bloom values based on GPU tier
  const bloomIntensity = effectTier === "high" ? 0.5 : 0.4;
  const bloomRadius = effectTier === "high" ? 0.4 : 0.3;

  if (!isComposerSafe) return null;

  // Low tier: minimal effects (bloom + vignette only)
  if (effectTier === "low") {
    return (
      <EffectComposer multisampling={0} stencilBuffer={false}>
        <Vignette
          offset={0.3}
          darkness={0.4}
          blendFunction={BlendFunction.NORMAL}
        />
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          mipmapBlur={false}
          radius={0.3}
          blendFunction={BlendFunction.ADD}
        />
      </EffectComposer>
    );
  }

  // Medium tier: core effects (+ noise)
  if (effectTier === "medium") {
    return (
      <EffectComposer multisampling={0} stencilBuffer={false}>
        <Vignette
          offset={0.3}
          darkness={0.4}
          blendFunction={BlendFunction.NORMAL}
        />
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur={false}
          radius={0.4}
          blendFunction={BlendFunction.ADD}
        />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    );
  }

  // High tier: all effects (tuned for text clarity)
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      {/* Vignette for depth framing */}
      <Vignette
        offset={0.35}
        darkness={0.35}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Bloom - reduced intensity to avoid washing out text */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.5}
        mipmapBlur={true}
        radius={bloomRadius}
        blendFunction={BlendFunction.ADD}
      />

      {/* Film grain - subtle texture */}
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />

      {/* Color grading - subtle enhancement */}
      <HueSaturation
        hue={0}
        saturation={0.08}
        blendFunction={BlendFunction.NORMAL}
      />
      <BrightnessContrast
        brightness={0.01}
        contrast={0.02}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
