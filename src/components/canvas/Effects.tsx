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
 * Advanced post-processing effects with GPU-tier adaptive quality.
 *
 * Effects by tier:
 * - High (desktop): All effects - bloom, vignette, chromatic aberration, noise, color grading, scanlines
 * - Medium (tablet/mid-range): Bloom, vignette, noise (reduced intensity)
 * - Low (mobile/budget): Bloom and vignette only
 *
 * Effect order (optimized for visual blend):
 * 1. Vignette - base depth framing
 * 2. Bloom - particle glow
 * 3. Noise - film grain texture
 * 4. Chromatic aberration - edge color fringing
 * 5. Color grading (hue/saturation + brightness/contrast)
 * 6. Scanlines - retro-tech overlay
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

    // Mobile devices max out at medium tier for battery/performance
    if (isMobile) {
      return gpuTier === "low" ? "low" : "medium";
    }

    return gpuTier;
  }, [device?.gpu, device?.isMobile]);


  if (!isComposerSafe) return null;

  // Low tier: minimal effects (bloom + vignette only)
  if (effectTier === "low") {
    return (
      <EffectComposer multisampling={0} stencilBuffer={false}>
        <Vignette
          offset={0.3}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur={false}
          radius={0.5}
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
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur={false}
          radius={0.5}
          blendFunction={BlendFunction.ADD}
        />
        <Noise opacity={0.08} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    );
  }

  // High tier: all effects enabled (tuned for clarity)
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      {/* Vignette for depth - applied first as base */}
      <Vignette
        offset={0.35}
        darkness={0.4}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Bloom for glowing particles - reduced to avoid washing out text */}
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        mipmapBlur={true}
        radius={0.5}
        blendFunction={BlendFunction.ADD}
      />

      {/* Film grain - subtle texture */}
      <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />

      {/* Color grading - enhance purples and cyans for brand colors */}
      <HueSaturation
        hue={0}
        saturation={0.1}
        blendFunction={BlendFunction.NORMAL}
      />
      <BrightnessContrast
        brightness={0.01}
        contrast={0.03}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
