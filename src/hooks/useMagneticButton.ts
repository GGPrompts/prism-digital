"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

export interface MagneticButtonOptions {
  /** Distance in pixels at which the magnetic effect starts (default: 100) */
  magneticDistance?: number;
  /** Maximum pixel offset the button content can move (default: 15) */
  maxOffset?: number;
  /** Strength of the magnetic pull, 0-1 (default: 0.4) */
  strength?: number;
  /** Whether to scale the glow intensity based on proximity (default: true) */
  scaleGlow?: boolean;
  /** CSS variable name for glow opacity (default: --magnetic-glow) */
  glowVariable?: string;
}

/**
 * Hook to add magnetic attraction effect to buttons
 *
 * The button content subtly follows the cursor when nearby,
 * with an elastic snap-back when the cursor leaves.
 *
 * @param options - Configuration options for the magnetic effect
 * @returns Object containing refs and handlers to attach to the button
 */
export function useMagneticButton(options: MagneticButtonOptions = {}) {
  const {
    magneticDistance = 100,
    maxOffset = 15,
    strength = 0.4,
    scaleGlow = true,
    glowVariable = "--magnetic-glow",
  } = options;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const isHovering = useRef(false);
  const isFocused = useRef(false);
  const rafId = useRef<number | null>(null);

  // Pre-allocate objects to avoid GC in animation loop
  const mousePosition = useRef({ x: 0, y: 0 });
  const buttonCenter = useRef({ x: 0, y: 0 });

  const updateButtonCenter = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    buttonCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const calculateMagneticOffset = useCallback(() => {
    const dx = mousePosition.current.x - buttonCenter.current.x;
    const dy = mousePosition.current.y - buttonCenter.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > magneticDistance) {
      return { x: 0, y: 0, proximity: 0 };
    }

    // Proximity ratio: 1 at center, 0 at edge of magnetic zone
    const proximity = 1 - distance / magneticDistance;

    // Apply strength and clamp to max offset
    const magneticPull = proximity * strength;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, dx * magneticPull));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, dy * magneticPull));

    return { x: offsetX, y: offsetY, proximity };
  }, [magneticDistance, maxOffset, strength]);

  const animateToPosition = useCallback(
    (x: number, y: number, proximity: number, immediate = false) => {
      if (!contentRef.current || !buttonRef.current) return;

      const duration = immediate ? 0 : 0.3;
      const ease = immediate ? "none" : "power2.out";

      gsap.to(contentRef.current, {
        x,
        y,
        duration,
        ease,
        overwrite: true,
      });

      if (scaleGlow) {
        gsap.to(buttonRef.current, {
          [glowVariable]: proximity,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    },
    [scaleGlow, glowVariable]
  );

  const snapBack = useCallback(() => {
    if (!contentRef.current || !buttonRef.current) return;

    gsap.to(contentRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
      overwrite: true,
    });

    if (scaleGlow) {
      gsap.to(buttonRef.current, {
        [glowVariable]: 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [scaleGlow, glowVariable]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      updateButtonCenter();

      const { x, y, proximity } = calculateMagneticOffset();

      if (proximity > 0) {
        if (!isHovering.current) {
          isHovering.current = true;
        }
        animateToPosition(x, y, proximity, false);
      } else if (isHovering.current) {
        isHovering.current = false;
        snapBack();
      }
    },
    [updateButtonCenter, calculateMagneticOffset, animateToPosition, snapBack]
  );

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    snapBack();
  }, [snapBack]);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    // On focus, animate glow without position shift
    if (buttonRef.current && scaleGlow) {
      gsap.to(buttonRef.current, {
        [glowVariable]: 0.7,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [scaleGlow, glowVariable]);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    if (buttonRef.current && scaleGlow) {
      gsap.to(buttonRef.current, {
        [glowVariable]: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [scaleGlow, glowVariable]);

  useEffect(() => {
    // Check for touch device - disable magnetic effect on touch
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (isTouch) return;

    const button = buttonRef.current;
    if (!button) return;

    // Use document-level mouse move for proximity detection
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    button.addEventListener("mouseleave", handleMouseLeave);
    button.addEventListener("focus", handleFocus);
    button.addEventListener("blur", handleBlur);

    // Update center on scroll and resize
    window.addEventListener("scroll", updateButtonCenter, { passive: true });
    window.addEventListener("resize", updateButtonCenter, { passive: true });

    // Initial center calculation
    updateButtonCenter();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
      button.removeEventListener("focus", handleFocus);
      button.removeEventListener("blur", handleBlur);
      window.removeEventListener("scroll", updateButtonCenter);
      window.removeEventListener("resize", updateButtonCenter);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave, handleFocus, handleBlur, updateButtonCenter]);

  return {
    buttonRef,
    contentRef,
  };
}
