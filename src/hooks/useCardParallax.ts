"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";

export interface CardParallaxOptions {
  /** Maximum tilt angle in degrees (default: 8) */
  maxTilt?: number;
  /** Animation speed in seconds (default: 0.4) */
  animationDuration?: number;
  /** Whether to add shadow shift effect (default: true) */
  shadowShift?: boolean;
  /** Maximum shadow offset in pixels (default: 20) */
  maxShadowOffset?: number;
  /** Perspective depth in pixels (default: 1000) */
  perspective?: number;
}

/**
 * Hook to add parallax 3D tilt effect to cards based on mouse position
 *
 * Cards tilt smoothly based on mouse position within the card,
 * with shadow shifting for depth illusion.
 *
 * @param options - Configuration options for the parallax effect
 * @returns Ref to attach to the card element
 */
export function useCardParallax<T extends HTMLElement = HTMLDivElement>(
  options: CardParallaxOptions = {}
) {
  const {
    maxTilt = 8,
    animationDuration = 0.4,
    shadowShift = true,
    maxShadowOffset = 20,
    perspective = 1000,
  } = options;

  const cardRef = useRef<T>(null);
  const [isTouch, setIsTouch] = useState(false);

  // Pre-allocate to avoid GC in event handlers
  const mousePosition = useRef({ x: 0, y: 0 });
  const cardRect = useRef({ left: 0, top: 0, width: 0, height: 0 });

  // Detect touch device on mount
  useEffect(() => {
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouch(isTouchDevice);
  }, []);

  const updateCardRect = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRect.current = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const calculateTilt = useCallback(() => {
    const { left, top, width, height } = cardRect.current;
    const { x, y } = mousePosition.current;

    // Calculate position relative to card center (-0.5 to 0.5)
    const relativeX = ((x - left) / width) - 0.5;
    const relativeY = ((y - top) / height) - 0.5;

    // Calculate tilt angles (inverted for natural feel)
    // Y-axis rotation based on X position, X-axis rotation based on Y position
    const tiltY = relativeX * maxTilt * 2;
    const tiltX = -relativeY * maxTilt * 2;

    return { tiltX, tiltY, relativeX, relativeY };
  }, [maxTilt]);

  const animateTilt = useCallback(
    (tiltX: number, tiltY: number, relativeX: number, relativeY: number) => {
      if (!cardRef.current) return;

      const tween: gsap.TweenVars = {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: perspective,
        duration: animationDuration,
        ease: "power2.out",
        overwrite: true,
      };

      // Add shadow shift for depth illusion
      if (shadowShift) {
        const shadowX = relativeX * maxShadowOffset;
        const shadowY = relativeY * maxShadowOffset;
        const shadowBlur = 30 + Math.abs(relativeX * relativeY) * 20;
        tween.boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.15)`;
      }

      gsap.to(cardRef.current, tween);
    },
    [perspective, animationDuration, shadowShift, maxShadowOffset]
  );

  const resetTilt = useCallback(() => {
    if (!cardRef.current) return;

    const tween: gsap.TweenVars = {
      rotateX: 0,
      rotateY: 0,
      duration: animationDuration * 1.5,
      ease: "elastic.out(1, 0.5)",
      overwrite: true,
    };

    if (shadowShift) {
      tween.boxShadow = "0px 0px 30px rgba(0, 0, 0, 0.1)";
    }

    gsap.to(cardRef.current, tween);
  }, [animationDuration, shadowShift]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      updateCardRect();

      const { tiltX, tiltY, relativeX, relativeY } = calculateTilt();
      animateTilt(tiltX, tiltY, relativeX, relativeY);
    },
    [updateCardRect, calculateTilt, animateTilt]
  );

  const handleMouseLeave = useCallback(() => {
    resetTilt();
  }, [resetTilt]);

  const handleMouseEnter = useCallback(() => {
    updateCardRect();
  }, [updateCardRect]);

  useEffect(() => {
    // Disable parallax on touch devices
    if (isTouch) return;

    const card = cardRef.current;
    if (!card) return;

    // Set initial transform origin and style
    gsap.set(card, {
      transformStyle: "preserve-3d",
      transformPerspective: perspective,
    });

    card.addEventListener("mousemove", handleMouseMove, { passive: true });
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mouseenter", handleMouseEnter);

    // Update rect on scroll and resize
    window.addEventListener("scroll", updateCardRect, { passive: true });
    window.addEventListener("resize", updateCardRect, { passive: true });

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("scroll", updateCardRect);
      window.removeEventListener("resize", updateCardRect);
    };
  }, [
    isTouch,
    perspective,
    handleMouseMove,
    handleMouseLeave,
    handleMouseEnter,
    updateCardRect,
  ]);

  return cardRef;
}
