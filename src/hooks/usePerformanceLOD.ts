"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useState, useRef } from "react";

/**
 * Performance-based Level of Detail (LOD) hook
 * Dynamically adjusts quality based on frame rate
 */
export function usePerformanceLOD() {
  const [qualityLevel, setQualityLevel] = useState<"high" | "medium" | "low">("high");
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([60, 60, 60]);

  useFrame(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimeRef.current;

    // Update FPS every second
    if (elapsed >= 1000) {
      const currentFps = (frameCountRef.current * 1000) / elapsed;

      // Update FPS history (rolling average)
      fpsHistoryRef.current.push(currentFps);
      if (fpsHistoryRef.current.length > 3) {
        fpsHistoryRef.current.shift();
      }

      const avgFps =
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) /
        fpsHistoryRef.current.length;

      // Adjust quality level based on average FPS
      if (avgFps >= 55) {
        setQualityLevel("high");
      } else if (avgFps >= 45) {
        setQualityLevel("medium");
      } else {
        setQualityLevel("low");
      }

      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  });

  return qualityLevel;
}

/**
 * Get particle count multiplier based on quality level
 */
export function getParticleCountMultiplier(
  qualityLevel: "high" | "medium" | "low"
): number {
  switch (qualityLevel) {
    case "high":
      return 1.0;
    case "medium":
      return 0.6;
    case "low":
      return 0.3;
    default:
      return 1.0;
  }
}

/**
 * Get effect quality settings based on performance level
 */
export function getEffectQuality(qualityLevel: "high" | "medium" | "low") {
  switch (qualityLevel) {
    case "high":
      return {
        bloomIntensity: 1.2,
        bloomRadius: 0.8,
        mipmapBlur: true,
      };
    case "medium":
      return {
        bloomIntensity: 0.8,
        bloomRadius: 0.5,
        mipmapBlur: false,
      };
    case "low":
      return {
        bloomIntensity: 0.4,
        bloomRadius: 0.3,
        mipmapBlur: false,
      };
    default:
      return {
        bloomIntensity: 1.2,
        bloomRadius: 0.8,
        mipmapBlur: true,
      };
  }
}
