"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollConfigProps {
  enableSnap?: boolean;
  snapDuration?: number;
}

/**
 * Global scroll configuration component
 * Sets up GSAP ScrollTrigger defaults and optional scroll snapping
 */
export function ScrollConfig({
  enableSnap = false,
  snapDuration = 0.5,
}: ScrollConfigProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Configure ScrollTrigger defaults
    ScrollTrigger.config({
      // Limit to avoid performance issues
      limitCallbacks: true,
      // Sync refresh rate with display
      syncInterval: 0,
    });

    // Set default ease for all ScrollTriggers
    ScrollTrigger.defaults({
      toggleActions: "play none none reverse",
      markers: false, // Set to true for debugging
    });

    // Optional: Enable scroll snapping
    let snapTrigger: ReturnType<typeof ScrollTrigger.create> | undefined;
    if (enableSnap) {
      // Get all sections with scroll-section class
      const sections = gsap.utils.toArray(".scroll-section");

      if (sections.length > 0) {
        snapTrigger = ScrollTrigger.create({
          snap: {
            snapTo: 1 / (sections.length - 1),
            duration: { min: snapDuration, max: snapDuration * 1.5 },
            delay: 0.1,
            ease: "power2.inOut",
          },
        });
      }
    }

    // Refresh ScrollTrigger on window resize (debounced)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      snapTrigger?.kill();
    };
  }, [enableSnap, snapDuration]);

  return null;
}
