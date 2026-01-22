"use client";

import { useEffect, useState } from "react";

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  gpu: "high" | "medium" | "low";
}

/**
 * Hook to detect device capabilities and optimize 3D performance
 *
 * Returns device information for adaptive rendering:
 * - isMobile/isTablet: Screen size detection
 * - isTouch: Touch capability detection
 * - hasWebGL/hasWebGL2: WebGL support detection
 * - gpu: Estimated GPU tier based on device characteristics
 *
 * Use this to reduce particle counts, disable heavy effects, and provide fallbacks.
 */
export function useDeviceDetection(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    hasWebGL: true,
    hasWebGL2: true,
    pixelRatio: 1,
    viewportWidth: 1920,
    viewportHeight: 1080,
    gpu: "high",
  });


  useEffect(() => {
    const detectCapabilities = () => {
      // Viewport detection
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      // Device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // WebGL detection
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      const hasWebGL = !!gl;
      const hasWebGL2 = !!canvas.getContext("webgl2");

      // GPU tier estimation
      let gpu: "high" | "medium" | "low" = "high";

      if (isMobile) {
        // Mobile devices - conservative estimates
        if (pixelRatio < 2) {
          gpu = "low"; // Older/budget mobile devices
        } else if (width < 400 || navigator.hardwareConcurrency <= 4) {
          gpu = "medium"; // Mid-range mobile
        } else {
          gpu = "medium"; // Even high-end mobile gets medium for battery
        }
      } else if (isTablet) {
        gpu = "medium"; // Tablets get medium tier
      } else {
        // Desktop - check for high-performance indicators
        if (pixelRatio > 1 && navigator.hardwareConcurrency > 4) {
          gpu = "high"; // High-end desktop
        } else if (navigator.hardwareConcurrency <= 2) {
          gpu = "low"; // Low-end desktop
        } else {
          gpu = "medium"; // Mid-range desktop
        }
      }

      // Check for specific low-end indicators
      const isLowEndDevice =
        !hasWebGL2 ||
        navigator.hardwareConcurrency <= 2 ||
        (isMobile && pixelRatio < 2);

      if (isLowEndDevice) {
        gpu = "low";
      }

      setCapabilities({
        isMobile,
        isTablet,
        isTouch,
        hasWebGL,
        hasWebGL2,
        pixelRatio,
        viewportWidth: width,
        viewportHeight: height,
        gpu,
      });
    };

    // Initial detection
    detectCapabilities();

    // Re-detect on resize (viewport changes, orientation)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(detectCapabilities, 150);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", detectCapabilities);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", detectCapabilities);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return capabilities;
}

/**
 * Get optimal particle count based on device capabilities
 */
export function getOptimalParticleCount(capabilities: DeviceCapabilities): number {
  if (!capabilities.hasWebGL) return 0;

  switch (capabilities.gpu) {
    case "high":
      return capabilities.isMobile ? 1200 : 3000;
    case "medium":
      return capabilities.isMobile ? 600 : 1500;
    case "low":
      return capabilities.isMobile ? 300 : 800;
    default:
      return 1500;
  }
}

/**
 * Determine if post-processing effects should be enabled
 */
export function shouldEnableEffects(capabilities: DeviceCapabilities): boolean {
  // Disable effects only on low-end devices
  if (capabilities.gpu === "low") return false;
  // Enable effects on medium-GPU mobile devices for better visual quality
  // The Effects component already handles tier-appropriate settings
  return capabilities.hasWebGL2;
}

/**
 * Get optimal device pixel ratio for rendering
 */
export function getOptimalDPR(capabilities: DeviceCapabilities): [number, number] {
  // Limit DPR on mobile to save performance
  if (capabilities.isMobile) {
    return [1, Math.min(1.5, capabilities.pixelRatio)];
  }

  // Desktop can handle higher DPR
  return [1, Math.min(2, capabilities.pixelRatio)];
}
