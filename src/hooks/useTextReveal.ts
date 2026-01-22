"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TextRevealOptions {
  /** Animation duration in seconds (default: 0.8) */
  duration?: number;
  /** Stagger delay between characters in seconds (default: 0.03) */
  stagger?: number;
  /** Y offset for character animation in pixels (default: 20) */
  yOffset?: number;
  /** Easing function (default: "power3.out") */
  ease?: string;
  /** ScrollTrigger start position (default: "top 85%") */
  triggerStart?: string;
  /** Delay before animation starts in seconds (default: 0) */
  delay?: number;
  /** Split by "chars" or "words" (default: "chars") */
  splitBy?: "chars" | "words";
  /** Whether to trigger on scroll (true) or immediately (false) */
  triggerOnScroll?: boolean;
  /** Whether animation should reverse on scroll up (default: false) */
  reverseOnLeave?: boolean;
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Split text into spans while preserving whitespace and structure
 */
function splitText(
  element: HTMLElement,
  splitBy: "chars" | "words"
): HTMLSpanElement[] {
  const text = element.textContent || "";
  const spans: HTMLSpanElement[] = [];

  // Create a wrapper for accessibility - screen readers will read this
  element.setAttribute("aria-label", text);

  if (splitBy === "words") {
    // Split by words, preserving spaces
    const words = text.split(/(\s+)/);
    element.innerHTML = "";

    words.forEach((word) => {
      if (word.match(/^\s+$/)) {
        // Preserve whitespace
        element.appendChild(document.createTextNode(word));
      } else if (word) {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity";
        span.setAttribute("aria-hidden", "true");
        element.appendChild(span);
        spans.push(span);
      }
    });
  } else {
    // Split by characters
    element.innerHTML = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === " " || char === "\n" || char === "\t") {
        // Preserve whitespace as text nodes
        element.appendChild(document.createTextNode(char));
      } else {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity";
        span.setAttribute("aria-hidden", "true");
        element.appendChild(span);
        spans.push(span);
      }
    }
  }

  return spans;
}

/**
 * Hook for cinematic text reveal animations
 *
 * Splits text into characters or words and animates them with staggered reveals.
 * Respects prefers-reduced-motion and maintains accessibility.
 *
 * @param options - Animation configuration options
 * @returns ref to attach to the text element
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const textRef = useTextReveal({ duration: 1, stagger: 0.05 });
 *   return <h1 ref={textRef}>Hello World</h1>;
 * }
 * ```
 */
export function useTextReveal<T extends HTMLElement = HTMLElement>(
  options: TextRevealOptions = {}
) {
  const {
    duration = 0.8,
    stagger = 0.03,
    yOffset = 20,
    ease = "power3.out",
    triggerStart = "top 85%",
    delay = 0,
    splitBy = "chars",
    triggerOnScroll = true,
    reverseOnLeave = false,
  } = options;

  const elementRef = useRef<T>(null);
  const spansRef = useRef<HTMLSpanElement[]>([]);
  const contextRef = useRef<gsap.Context | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    const reducedMotion = prefersReducedMotion();

    // If reduced motion, just ensure text is visible and skip animation
    if (reducedMotion) {
      element.style.opacity = "1";
      return;
    }

    // Split text into spans
    spansRef.current = splitText(element, splitBy);
    const spans = spansRef.current;

    if (spans.length === 0) return;

    // Create GSAP context for proper cleanup
    contextRef.current = gsap.context(() => {
      // Set initial state - characters start invisible and offset
      gsap.set(spans, {
        opacity: 0,
        y: yOffset,
      });

      // Make container visible (it may have been hidden initially)
      gsap.set(element, { opacity: 1 });

      if (triggerOnScroll) {
        // Scroll-triggered animation
        gsap.to(spans, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease,
          delay,
          scrollTrigger: {
            trigger: element,
            start: triggerStart,
            toggleActions: reverseOnLeave
              ? "play reverse play reverse"
              : "play none none none",
          },
        });
      } else {
        // Immediate animation (for hero text on page load)
        gsap.to(spans, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease,
          delay,
        });
      }
    }, element);

    return () => {
      contextRef.current?.revert();
    };
  }, [
    duration,
    stagger,
    yOffset,
    ease,
    triggerStart,
    delay,
    splitBy,
    triggerOnScroll,
    reverseOnLeave,
  ]);

  return elementRef;
}

/**
 * Component wrapper for text reveal animations
 * Useful when you need more control or want to animate existing refs
 */
export function useTextRevealOnRef<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  options: TextRevealOptions = {}
) {
  const {
    duration = 0.8,
    stagger = 0.03,
    yOffset = 20,
    ease = "power3.out",
    triggerStart = "top 85%",
    delay = 0,
    splitBy = "chars",
    triggerOnScroll = true,
    reverseOnLeave = false,
  } = options;

  const spansRef = useRef<HTMLSpanElement[]>([]);
  const contextRef = useRef<gsap.Context | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    const reducedMotion = prefersReducedMotion();

    if (reducedMotion) {
      element.style.opacity = "1";
      return;
    }

    spansRef.current = splitText(element, splitBy);
    const spans = spansRef.current;

    if (spans.length === 0) return;

    contextRef.current = gsap.context(() => {
      gsap.set(spans, {
        opacity: 0,
        y: yOffset,
      });

      gsap.set(element, { opacity: 1 });

      if (triggerOnScroll) {
        gsap.to(spans, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease,
          delay,
          scrollTrigger: {
            trigger: element,
            start: triggerStart,
            toggleActions: reverseOnLeave
              ? "play reverse play reverse"
              : "play none none none",
          },
        });
      } else {
        gsap.to(spans, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease,
          delay,
        });
      }
    }, element);

    return () => {
      contextRef.current?.revert();
    };
  }, [
    ref,
    duration,
    stagger,
    yOffset,
    ease,
    triggerStart,
    delay,
    splitBy,
    triggerOnScroll,
    reverseOnLeave,
  ]);
}

/**
 * Animated text component for simpler usage
 * Renders text with character/word reveal animation
 */
export interface AnimatedTextProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  options?: TextRevealOptions;
}
