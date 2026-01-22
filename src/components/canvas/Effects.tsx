"use client";

import { useEffect, useState, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

  // Adaptive bloom values based on GPU tier and theme
  // Increase bloom in dark mode for glow effects, reduce in light mode
  const bloomIntensity = effectTier === "high" ? (isDark ? 0.6 : 0.35) : (isDark ? 0.5 : 0.3);
  const bloomRadius = effectTier === "high" ? (isDark ? 0.5 : 0.3) : (isDark ? 0.4 : 0.25);
  const vignetteIntensity = isDark ? 0.35 : 0.2;

  if (!isComposerSafe) return null;

  // Low tier: minimal effects (bloom + vignette only)
  if (effectTier === "low") {
    return (
      <EffectComposer multisampling={0} stencilBuffer={false}>
        <Vignette
          offset={0.3}
          darkness={isDark ? 0.4 : 0.25}
          blendFunction={BlendFunction.NORMAL}
        />
        <Bloom
          intensity={isDark ? 0.5 : 0.35}
          luminanceThreshold={isDark ? 0.5 : 0.6}
          luminanceSmoothing={0.9}
          mipmapBlur={false}
          radius={isDark ? 0.4 : 0.25}
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
          darkness={isDark ? 0.4 : 0.25}
          blendFunction={BlendFunction.NORMAL}
        />
        <Bloom
          intensity={isDark ? 0.6 : 0.4}
          luminanceThreshold={isDark ? 0.4 : 0.55}
          luminanceSmoothing={0.9}
          mipmapBlur={false}
          radius={isDark ? 0.5 : 0.3}
          blendFunction={BlendFunction.ADD}
        />
        <Noise opacity={isDark ? 0.05 : 0.03} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    );
  }

  // High tier: all effects (tuned for text clarity)
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      {/* Vignette for depth framing */}
      <Vignette
        offset={0.35}
        darkness={vignetteIntensity}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Bloom - higher in dark mode for glow effects */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={isDark ? 0.45 : 0.55}
        luminanceSmoothing={0.5}
        mipmapBlur={true}
        radius={bloomRadius}
        blendFunction={BlendFunction.ADD}
      />

      {/* Film grain - subtle texture */}
      <Noise opacity={isDark ? 0.04 : 0.025} blendFunction={BlendFunction.OVERLAY} />

      {/* Color grading - subtle enhancement */}
      <HueSaturation
        hue={0}
        saturation={isDark ? 0.1 : 0.06}
        blendFunction={BlendFunction.NORMAL}
      />
      <BrightnessContrast
        brightness={isDark ? 0.01 : 0.02}
        contrast={isDark ? 0.02 : 0.01}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
