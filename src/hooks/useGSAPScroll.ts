"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GSAPScrollState {
  scrollY: number;
  scrollProgress: number; // 0-1 normalized progress
  direction: "up" | "down";
  velocity: number;
  section: string;
}

/**
 * Enhanced scroll hook using GSAP ScrollTrigger
 * Provides smooth scroll state for 3D scene integration
 */
export function useGSAPScroll() {
  // Initialize with 0 to ensure 3D elements are visible on first render
  const [scrollState, setScrollState] = useState<GSAPScrollState>(() => ({
    scrollY: 0,
    scrollProgress: 0,
    direction: "down",
    velocity: 0,
    section: "hero",
  }));

  const velocityRef = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let updateCount = 0;
    const updateScrollState = () => {
      // Some browsers can report a tiny non-zero scrollY on load (e.g. address bar behavior).
      const rawScrollY = window.scrollY;
      const scrollY = rawScrollY < 4 ? 0 : rawScrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const scrollProgress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

      // Debug: Log first few updates and any time scrollProgress jumps significantly
      updateCount++;
      if (updateCount <= 5 || (updateCount % 30 === 0 && updateCount <= 150)) {
        console.log(`[useGSAPScroll] Update #${updateCount}: scrollY=${scrollY}, windowH=${windowHeight}, docH=${documentHeight}, maxScroll=${maxScroll}, progress=${scrollProgress.toFixed(3)}`);
      }

      // Calculate velocity
      const delta = scrollY - lastScrollY.current;
      velocityRef.current = delta;
      lastScrollY.current = scrollY;

      // Determine current section
      let section = "hero";
      const sections = ["hero", "features", "process", "testimonials"];
      const threshold = windowHeight * 0.5;

      sections.forEach((sec) => {
        const element = document.getElementById(sec);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < threshold && rect.bottom > threshold) {
            section = sec;
          }
        }
      });

      setScrollState({
        scrollY,
        scrollProgress,
        direction: delta > 0 ? "down" : "up",
        velocity: Math.abs(delta),
        section,
      });
    };

    // Create a ScrollTrigger that updates on every scroll event
    const trigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: updateScrollState,
    });

    // Also update on scroll for immediate feedback
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState, { passive: true });

    // Initial call
    updateScrollState();

    return () => {
      trigger.kill();
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return scrollState;
}

/**
 * Hook to create section-based scroll snapping
 */
export function useScrollSnap(enabled: boolean = true) {
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const trigger = ScrollTrigger.create({
      snap: {
        snapTo: "labelsDirectional",
        duration: { min: 0.2, max: 0.8 },
        delay: 0.1,
        ease: "power2.inOut",
      },
    });

    return () => {
      trigger.kill();
    };
  }, [enabled]);
}

/**
 * Hook for parallax effects on elements
 */
export function useParallax(
  ref: React.RefObject<HTMLElement>,
  options: {
    speed?: number;
    start?: string;
    end?: string;
  } = {}
) {
  const { speed = 0.5, start = "top bottom", end = "bottom top" } = options;

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const element = ref.current;

    const tween = gsap.to(element, {
      y: () => -window.innerHeight * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.kill();
    };
  }, [ref, speed, start, end]);
}
